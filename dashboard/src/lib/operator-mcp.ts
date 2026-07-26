import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import * as z from "zod/v4";
import {
  addDailyTask,
  addMonthlyTask,
  addTask,
  getAIBountyGoalProgress,
  getDailyTasks,
  getExternalSourceHealth,
  getExternalTasks,
  getMorningLog,
  getMonthlyTasks,
  getStructuredWeeklyFocus,
  getYearIncome,
  toggleDailyTask,
  updateDailyTask,
} from "@/lib/api";
import {
  getAgentAdvisorOverview,
  submitOperatorDailyPlan,
  type AgentGoalArea,
} from "@/lib/agent";
import {
  createOperatorActionRequest,
  listOperatorActionRequests,
  runAuditedOperatorTool,
} from "@/lib/operator";
import { BUSINESS_LINE_TARGETS_2026, YEAR_TARGETS } from "@/lib/targets";
import type { AuthenticatedOperator } from "@/lib/operator-auth";

const DATE_SCHEMA = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "必须为 YYYY-MM-DD");
const MONTH_SCHEMA = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "必须为 YYYY-MM");
const GOAL_AREA_SCHEMA = z.enum(["Overall", "Hunter", "SaaS", "Media"]);
const PLAN_GOAL_AREA_SCHEMA = z.enum(["Hunter", "SaaS", "Media"]);
const ACTION_TYPE_SCHEMA = z.enum([
  "publish_content",
  "submit_bounty_report",
  "deploy_project",
  "record_income",
  "record_asset",
  "other",
]);

function getBeijingDate(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function textResult(summary: string, data: unknown) {
  return {
    content: [{ type: "text" as const, text: `${summary}\n${JSON.stringify(data, null, 2)}` }],
    structuredContent:
      data && typeof data === "object" ? (data as Record<string, unknown>) : { value: data },
  };
}

export function createCoastOperatorServer(operator: AuthenticatedOperator): McpServer {
  const server = new McpServer(
    {
      name: "coast-operator",
      version: "0.3.0",
    },
    {
      instructions:
        "Coast Operator 0.3 管理 Coast2030 的 2026 工作台。先读取现状再写入。日/周/月任务属于可撤销的内部动作，可按用户明确指令执行；模型生成的日计划用 coast_propose_daily_plan 提交并等待 Dashboard 审批。发布、漏洞提交、部署、收入和资产修改只能用 coast_request_external_action 排队，不得声称已执行。所有工具调用均被审计。",
    },
  );

  server.registerTool(
    "coast_operator_status",
    {
      title: "查看 Coast Operator 状态",
      description: "确认连接身份、0.3 权限边界和可执行动作。",
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async () =>
      textResult("Coast Operator 0.3 已连接。", {
        version: "0.3.0",
        operator: operator.label,
        mode: "codex_mcp_operator",
        directActions: [
          "read_portfolio",
          "read_workbench",
          "create_daily_task",
          "update_daily_task",
          "set_daily_task_status",
          "create_weekly_focus",
          "create_monthly_milestone",
        ],
        approvalGated: [
          "model_daily_plan",
          "publish_content",
          "submit_bounty_report",
          "deploy_project",
          "record_income",
          "record_asset",
        ],
      }),
  );

  server.registerTool(
    "coast_get_2026_overview",
    {
      title: "读取 2026 经营总览",
      description: "读取三条业务线收入目标、AIBounty 进度和外部数据源状态。",
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async () => {
      const result = await runAuditedOperatorTool(
        operator.tokenId,
        "coast_get_2026_overview",
        {},
        async () => {
          const [total, hunter, saas, media, aiBounty, sourceHealth] = await Promise.all([
            getYearIncome(2026),
            getYearIncome(2026, "Hunter"),
            getYearIncome(2026, "SaaS"),
            getYearIncome(2026, "Media"),
            getAIBountyGoalProgress(),
            getExternalSourceHealth(),
          ]);
          return {
            year: 2026,
            total: { current: total, target: YEAR_TARGETS[2026] || 0 },
            businessLines: {
              Hunter: { current: hunter, target: BUSINESS_LINE_TARGETS_2026.Hunter },
              SaaS: { current: saas, target: BUSINESS_LINE_TARGETS_2026.SaaS },
              Media: { current: media, target: BUSINESS_LINE_TARGETS_2026.Media },
            },
            aiBounty,
            sourceHealth,
          };
        },
      );
      return textResult("已读取 2026 经营总览。", result);
    },
  );

  server.registerTool(
    "coast_get_workbench",
    {
      title: "读取 2026 工作台",
      description: "读取指定日期的晨间行动、今日任务、本周焦点、外部任务和 Operator 提案。",
      inputSchema: {
        date: DATE_SCHEMA.optional().describe("日期；省略时使用北京时间今天"),
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ date }) => {
      const targetDate = date || getBeijingDate();
      const result = await runAuditedOperatorTool(
        operator.tokenId,
        "coast_get_workbench",
        { date: targetDate },
        async () => {
          const [dailyTasks, morning, weekly, externalTasks, sourceHealth, operatorPlan] =
            await Promise.all([
              getDailyTasks(targetDate),
              getMorningLog(targetDate),
              getStructuredWeeklyFocus(),
              getExternalTasks(),
              getExternalSourceHealth(),
              getAgentAdvisorOverview(targetDate),
            ]);
          return {
            date: targetDate,
            morning,
            dailyTasks,
            weekly,
            externalTasks,
            sourceHealth,
            operatorPlan,
          };
        },
      );
      return textResult(`已读取 ${targetDate} 工作台。`, result);
    },
  );

  server.registerTool(
    "coast_propose_daily_plan",
    {
      title: "提交模型生成的今日计划",
      description:
        "由 Codex 根据工作台数据提交最多三条可验证行动；只生成待审批提案，不直接创建今日任务。",
      inputSchema: {
        date: DATE_SCHEMA.describe("计划日期"),
        objective: z.string().trim().min(1).max(500).describe("今天的总目标"),
        summary: z.string().trim().min(1).max(500).describe("计划摘要和取舍"),
        items: z
          .array(
            z.object({
              goalArea: PLAN_GOAL_AREA_SCHEMA,
              project: z.string().trim().min(1).max(120),
              title: z.string().trim().min(1).max(240),
              rationale: z.string().trim().min(1).max(800),
              definitionOfDone: z.string().trim().min(1).max(800),
              evidenceRequired: z.string().trim().min(1).max(500),
              priority: z.enum(["P0", "P1", "P2"]),
              sourceRef: z.string().trim().max(240).optional(),
            }),
          )
          .min(1)
          .max(3),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async ({ date, objective, summary, items }) => {
      const result = await runAuditedOperatorTool(
        operator.tokenId,
        "coast_propose_daily_plan",
        { date, objective, summary, items },
        () =>
          submitOperatorDailyPlan({
            date,
            objective,
            summary,
            items: items.map((item) => ({
              ...item,
              goalArea: item.goalArea as AgentGoalArea,
            })),
            requestedBy: operator.tokenId,
          }),
      );
      return textResult("模型计划已提交，等待本人在 2026 工作台审批。", result);
    },
  );

  server.registerTool(
    "coast_create_daily_task",
    {
      title: "创建今日任务",
      description: "创建一条可撤销的 Coast 内部今日任务。仅在用户明确要求创建时调用。",
      inputSchema: {
        date: DATE_SCHEMA.optional().describe("日期；省略时使用北京时间今天"),
        goalArea: GOAL_AREA_SCHEMA.default("Overall"),
        text: z.string().trim().min(1).max(500),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
      },
    },
    async ({ date, goalArea, text }) => {
      const targetDate = date || getBeijingDate();
      const result = await runAuditedOperatorTool(
        operator.tokenId,
        "coast_create_daily_task",
        { date: targetDate, goalArea, text },
        async () => {
          const created = await addDailyTask(text, targetDate, goalArea);
          return { created, date: targetDate, dailyTasks: await getDailyTasks(targetDate) };
        },
      );
      return textResult("今日任务已创建。", result);
    },
  );

  server.registerTool(
    "coast_update_daily_task",
    {
      title: "修改今日任务",
      description: "修改已有今日任务的文字内容。",
      inputSchema: {
        id: z.string().regex(/^\d+$/, "任务 id 必须为数字"),
        date: DATE_SCHEMA.optional(),
        text: z.string().trim().min(1).max(500),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async ({ id, date, text }) => {
      const result = await runAuditedOperatorTool(
        operator.tokenId,
        "coast_update_daily_task",
        { id, date, text },
        async () => {
          const updated = await updateDailyTask(id, text);
          return {
            updated,
            dailyTasks: date ? await getDailyTasks(date) : undefined,
          };
        },
      );
      return textResult("今日任务已更新。", result);
    },
  );

  server.registerTool(
    "coast_set_daily_task_status",
    {
      title: "更新今日任务状态",
      description: "把今日任务标记为完成或重新打开。",
      inputSchema: {
        id: z.string().regex(/^\d+$/, "任务 id 必须为数字"),
        date: DATE_SCHEMA.optional(),
        completed: z.boolean(),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async ({ id, date, completed }) => {
      const result = await runAuditedOperatorTool(
        operator.tokenId,
        "coast_set_daily_task_status",
        { id, date, completed },
        async () => {
          const updated = await toggleDailyTask(id, completed);
          return {
            updated,
            completed,
            dailyTasks: date ? await getDailyTasks(date) : undefined,
          };
        },
      );
      return textResult(completed ? "今日任务已完成。" : "今日任务已重新打开。", result);
    },
  );

  server.registerTool(
    "coast_create_weekly_focus",
    {
      title: "创建本周焦点",
      description: "在 Coast 2026 工作台创建一条本周焦点。",
      inputSchema: {
        goalArea: GOAL_AREA_SCHEMA.default("Overall"),
        text: z.string().trim().min(1).max(500),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
      },
    },
    async ({ goalArea, text }) => {
      const result = await runAuditedOperatorTool(
        operator.tokenId,
        "coast_create_weekly_focus",
        { goalArea, text },
        async () => {
          const created = await addTask(text, goalArea);
          return { created, weekly: await getStructuredWeeklyFocus() };
        },
      );
      return textResult("本周焦点已创建。", result);
    },
  );

  server.registerTool(
    "coast_create_monthly_milestone",
    {
      title: "创建本月关键点",
      description: "在 Coast 2026 工作台创建一条指定月份的关键点。",
      inputSchema: {
        month: MONTH_SCHEMA,
        goalArea: GOAL_AREA_SCHEMA.default("Overall"),
        text: z.string().trim().min(1).max(500),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
      },
    },
    async ({ month, goalArea, text }) => {
      const result = await runAuditedOperatorTool(
        operator.tokenId,
        "coast_create_monthly_milestone",
        { month, goalArea, text },
        async () => {
          const created = await addMonthlyTask(text, month, goalArea);
          return { created, month, milestones: await getMonthlyTasks(month) };
        },
      );
      return textResult("本月关键点已创建。", result);
    },
  );

  server.registerTool(
    "coast_request_external_action",
    {
      title: "申请高风险外部动作",
      description:
        "为发布、漏洞提交、部署、收入或资产修改创建审批请求；本工具绝不执行外部动作。",
      inputSchema: {
        actionType: ACTION_TYPE_SCHEMA,
        target: z.string().trim().min(1).max(240),
        summary: z.string().trim().min(1).max(800),
        riskLevel: z.enum(["medium", "high", "critical"]).default("high"),
        details: z.record(z.string(), z.unknown()).default({}),
        idempotencyKey: z.string().trim().min(8).max(200),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async ({ actionType, target, summary, riskLevel, details, idempotencyKey }) => {
      const result = await runAuditedOperatorTool(
        operator.tokenId,
        "coast_request_external_action",
        { actionType, target, summary, riskLevel, details, idempotencyKey },
        () =>
          createOperatorActionRequest({
            actionType,
            target,
            summary,
            riskLevel,
            request: details,
            requestedBy: operator.tokenId,
            idempotencyKey,
          }),
      );
      return textResult("外部动作未执行，审批请求已进入 Coast Operator 控制台。", result);
    },
  );

  server.registerTool(
    "coast_list_action_requests",
    {
      title: "读取外部动作审批",
      description: "查看高风险外部动作的审批状态；不能通过此工具自行批准。",
      inputSchema: {
        status: z.enum(["pending", "approved", "rejected", "executed"]).optional(),
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async ({ status }) => {
      const result = await runAuditedOperatorTool(
        operator.tokenId,
        "coast_list_action_requests",
        { status },
        () => listOperatorActionRequests(status),
      );
      return textResult("已读取 Operator 外部动作审批。", { requests: result });
    },
  );

  return server;
}

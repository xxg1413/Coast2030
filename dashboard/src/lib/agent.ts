import { getDB } from "@/lib/db";

export type AgentGoalArea = "Hunter" | "SaaS" | "Media";
export type AgentWorkItemState =
  | "proposed"
  | "approved"
  | "completed"
  | "verified"
  | "cancelled";
export type AgentApprovalStatus = "pending" | "approved" | "rejected";

export interface AgentPlannerExternalTask {
  id: string;
  source: "Product Lab" | "AI Notes" | "AIBounty";
  project: string;
  text: string;
  status: string;
  dueDate: string;
  priority?: string;
}

export interface AgentPlannerInput {
  date: string;
  dailyTasks: Array<{
    id: string;
    text: string;
    completed: boolean;
    goalArea: string;
  }>;
  coreActions: Array<{
    goalArea: AgentGoalArea;
    label: string;
    completed: boolean;
  }>;
  externalTasks: AgentPlannerExternalTask[];
  sourceHealth: Array<{
    source: "Product Lab" | "AI Notes" | "AIBounty";
    status: "ok" | "stale" | "error" | "unconfigured";
    message: string;
  }>;
  income: Record<AgentGoalArea, { current: number; target: number }>;
  aiBounty: {
    targetUsd: number;
    receivedUsd: number;
    submittedCount: number;
  };
}

export interface AgentAdvisorWorkItem {
  id: string;
  goalArea: AgentGoalArea;
  project: string;
  title: string;
  rationale: string;
  definitionOfDone: string;
  evidenceRequired: string;
  priority: string;
  state: AgentWorkItemState;
  dueDate: string;
  sourceKind: string;
  sourceRef: string;
  approvalStatus: AgentApprovalStatus;
  linkedDailyTaskId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AgentAdvisorOverview {
  date: string;
  run: null | {
    id: string;
    runKey: string;
    source: "operator" | "advisor";
    objective: string;
    status: string;
    summary: string;
    createdAt: string;
    completedAt: string;
    sourceHealth: AgentPlannerInput["sourceHealth"];
  };
  items: AgentAdvisorWorkItem[];
  boundary: {
    mode: "operator";
    canWriteChildProjects: false;
    canExecuteExternalActions: false;
    approvalRequired: true;
  };
}

interface AgentCandidate {
  goalArea: AgentGoalArea;
  project: string;
  title: string;
  rationale: string;
  definitionOfDone: string;
  evidenceRequired: string;
  priority: string;
  sourceKind: string;
  sourceRef: string;
}

function parseJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function progressText(current: number, target: number): string {
  if (target <= 0) return "年度目标未设置";
  return `年度已到账 ${(Math.min(current / target, 1) * 100).toFixed(1)}%`;
}

function hasDailyCoverage(input: AgentPlannerInput, goalArea: AgentGoalArea): boolean {
  return input.dailyTasks.some((task) => task.goalArea === goalArea);
}

function hasMorningCoverage(input: AgentPlannerInput, goalArea: AgentGoalArea): boolean {
  return input.coreActions.some((action) => action.goalArea === goalArea && action.label.trim().length > 0);
}

function buildCandidates(input: AgentPlannerInput): AgentCandidate[] {
  const productTask = input.externalTasks.find((task) => task.source === "Product Lab");
  const mediaTask = input.externalTasks.find((task) => task.source === "AI Notes");
  const gaps = (Object.keys(input.income) as AgentGoalArea[])
    .map((goalArea) => {
      const { current, target } = input.income[goalArea];
      return { goalArea, ratio: target > 0 ? current / target : 1 };
    })
    .sort((left, right) => left.ratio - right.ratio);
  const highestGapArea = gaps[0]?.goalArea;

  const candidates: AgentCandidate[] = [
    {
      goalArea: "Hunter",
      project: "AIBounty",
      title:
        input.aiBounty.submittedCount > 0
          ? "跟进 1 个已提交报告并记录平台状态"
          : "推进 1 个高价值目标到可提交状态",
      rationale: `${progressText(input.income.Hunter.current, input.income.Hunter.target)}；AIBounty 已提交 ${input.aiBounty.submittedCount} 个，已到账 $${input.aiBounty.receivedUsd.toLocaleString("en-US")}。`,
      definitionOfDone:
        input.aiBounty.submittedCount > 0
          ? "至少完成一次有效跟进，并在 AIBounty 中记录最新状态和下一步。"
          : "完成目标选择、复现或报告草稿中的一个可验证推进，并记录证据。",
      evidenceRequired: "报告路径、平台回执或复现记录中的至少一项",
      priority: highestGapArea === "Hunter" ? "P0" : "P1",
      sourceKind: "portfolio_gap",
      sourceRef: "aibounty:annual-progress",
    },
    {
      goalArea: "SaaS",
      project: productTask?.project || "Product Lab",
      title: productTask ? `推进 ${productTask.project}：${productTask.text}` : "完成 1 个可验证的获客、交付或产品动作",
      rationale: productTask
        ? `${progressText(input.income.SaaS.current, input.income.SaaS.target)}；Product Lab 当前开放项状态为“${productTask.status}”。`
        : `${progressText(input.income.SaaS.current, input.income.SaaS.target)}；当前没有可读取的 Product Lab 开放项。`,
      definitionOfDone: productTask
        ? "让该开放项产生一次可验证状态变化，并记录结果。"
        : "动作必须产生可追踪的注册、反馈、交付或付费信号。",
      evidenceRequired: "产品链接、用户反馈、交付记录或指标截图中的至少一项",
      priority: highestGapArea === "SaaS" ? "P0" : "P1",
      sourceKind: productTask ? "external_task" : "portfolio_gap",
      sourceRef: productTask?.id || "productlab:annual-progress",
    },
    {
      goalArea: "Media",
      project: mediaTask?.project || "AI Notes",
      title: mediaTask ? `推进 ${mediaTask.project}：${mediaTask.text}` : "完成 1 个可验证的内容生产或发布动作",
      rationale: mediaTask
        ? `${progressText(input.income.Media.current, input.income.Media.target)}；AI Notes 当前开放项状态为“${mediaTask.status}”。`
        : `${progressText(input.income.Media.current, input.income.Media.target)}；当前没有可读取的 AI Notes 开放项。`,
      definitionOfDone: mediaTask
        ? "让该内容任务产生一次可验证状态变化，并记录结果。"
        : "完成选题、成稿、发布或数据复盘中的一个完整阶段。",
      evidenceRequired: "草稿、发布链接或平台数据中的至少一项",
      priority: highestGapArea === "Media" ? "P0" : "P1",
      sourceKind: mediaTask ? "external_task" : "portfolio_gap",
      sourceRef: mediaTask?.id || "ainotes:annual-progress",
    },
  ];

  return candidates.filter(
    (candidate) =>
      !hasDailyCoverage(input, candidate.goalArea) &&
      !hasMorningCoverage(input, candidate.goalArea),
  );
}

export async function getAgentAdvisorOverview(date: string): Promise<AgentAdvisorOverview> {
  const db = await getDB();
  const operatorRunKey = `daily-operator:${date}`;
  const advisorRunKey = `daily-advisor:${date}`;
  const run = await db
    .prepare(`
      SELECT
        id, run_key, trigger_type, objective, status, context_json, summary,
        created_at, completed_at
      FROM agent_runs
      WHERE run_key IN (?, ?)
      ORDER BY CASE trigger_type WHEN 'codex_operator' THEN 0 ELSE 1 END
      LIMIT 1
    `)
    .bind(operatorRunKey, advisorRunKey)
    .first<{
      id: string;
      run_key: string;
      trigger_type: string;
      objective: string;
      status: string;
      context_json: string;
      summary: string;
      created_at: string;
      completed_at: string | null;
    }>();

  if (!run) {
    return {
      date,
      run: null,
      items: [],
      boundary: {
        mode: "operator",
        canWriteChildProjects: false,
        canExecuteExternalActions: false,
        approvalRequired: true,
      },
    };
  }

  const itemRows = await db
    .prepare(`
      SELECT
        work.id,
        work.goal_area,
        work.project,
        work.title,
        work.rationale,
        work.definition_of_done,
        work.evidence_required,
        work.priority,
        work.state,
        work.due_date,
        work.source_kind,
        work.source_ref,
        work.created_at,
        work.updated_at,
        approval.status AS approval_status,
        COALESCE(CAST(task.id AS TEXT), '') AS daily_task_id,
        COALESCE(task.completed, 0) AS daily_task_completed
      FROM agent_work_items work
      LEFT JOIN agent_approvals approval ON approval.work_item_id = work.id
      LEFT JOIN daily_tasks task ON task.agent_work_item_id = work.id
      WHERE work.run_id = ?
      ORDER BY
        CASE work.priority WHEN 'P0' THEN 0 WHEN 'P1' THEN 1 ELSE 2 END,
        CASE work.goal_area WHEN 'Hunter' THEN 0 WHEN 'SaaS' THEN 1 ELSE 2 END
    `)
    .bind(run.id)
    .all<{
      id: string;
      goal_area: AgentGoalArea;
      project: string;
      title: string;
      rationale: string;
      definition_of_done: string;
      evidence_required: string;
      priority: string;
      state: AgentWorkItemState;
      due_date: string;
      source_kind: string;
      source_ref: string;
      created_at: string;
      updated_at: string;
      approval_status: AgentApprovalStatus;
      daily_task_id: string;
      daily_task_completed: number;
    }>();

  const context = parseJson<{ sourceHealth?: AgentPlannerInput["sourceHealth"] }>(run.context_json, {});
  return {
    date,
    run: {
      id: run.id,
      runKey: run.run_key,
      source: run.trigger_type === "codex_operator" ? "operator" : "advisor",
      objective: run.objective,
      status: run.status,
      summary: run.summary,
      createdAt: run.created_at,
      completedAt: run.completed_at || "",
      sourceHealth: context.sourceHealth || [],
    },
    items: itemRows.results.map((item) => ({
      id: item.id,
      goalArea: item.goal_area,
      project: item.project,
      title: item.title,
      rationale: item.rationale,
      definitionOfDone: item.definition_of_done,
      evidenceRequired: item.evidence_required,
      priority: item.priority,
      state: item.daily_task_completed === 1 ? "completed" : item.state,
      dueDate: item.due_date,
      sourceKind: item.source_kind,
      sourceRef: item.source_ref,
      approvalStatus: item.approval_status || "pending",
      linkedDailyTaskId: item.daily_task_id,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    })),
    boundary: {
      mode: "operator",
      canWriteChildProjects: false,
      canExecuteExternalActions: false,
      approvalRequired: true,
    },
  };
}

export async function createDailyAdvisorPlan(input: AgentPlannerInput): Promise<AgentAdvisorOverview> {
  const existing = await getAgentAdvisorOverview(input.date);
  if (existing.run) return existing;

  const db = await getDB();
  const runId = crypto.randomUUID();
  const runKey = `daily-advisor:${input.date}`;
  const now = new Date().toISOString();
  const candidates = buildCandidates(input);
  const coveredCount = 3 - candidates.length;
  const summary = candidates.length
    ? `提出 ${candidates.length} 条建议；${coveredCount} 条主线已由晨间行动或今日任务覆盖。`
    : "三条主线今天都已有可执行行动，Agent 未重复创建建议。";
  const statements = [
    db
      .prepare(`
        INSERT INTO agent_runs (
          id, run_key, trigger_type, objective, status, context_json, plan_json,
          summary, budget_steps, started_at, completed_at, created_at, updated_at
        ) VALUES (?, ?, 'daily_advisor', ?, 'completed', ?, ?, ?, 3, ?, ?, ?, ?)
      `)
      .bind(
        runId,
        runKey,
        "基于年度缺口、晨间行动和三个项目状态，提出今天最小可验证行动。",
        JSON.stringify({ sourceHealth: input.sourceHealth }),
        JSON.stringify(candidates),
        summary,
        now,
        now,
        now,
        now,
      ),
  ];

  for (const candidate of candidates) {
    const workItemId = crypto.randomUUID();
    const approvalId = crypto.randomUUID();
    statements.push(
      db
        .prepare(`
          INSERT INTO agent_work_items (
            id, run_id, goal_area, project, title, rationale, definition_of_done,
            evidence_required, priority, state, due_date, source_kind, source_ref,
            created_by, version, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'proposed', ?, ?, ?, 'agent_advisor', 1, ?, ?)
        `)
        .bind(
          workItemId,
          runId,
          candidate.goalArea,
          candidate.project,
          candidate.title,
          candidate.rationale,
          candidate.definitionOfDone,
          candidate.evidenceRequired,
          candidate.priority,
          input.date,
          candidate.sourceKind,
          candidate.sourceRef,
          now,
          now,
        ),
      db
        .prepare(`
          INSERT INTO agent_approvals (
            id, run_id, work_item_id, action_type, risk_level, request_json,
            status, created_at, updated_at
          ) VALUES (?, ?, ?, 'create_daily_task', 'low', ?, 'pending', ?, ?)
        `)
        .bind(
          approvalId,
          runId,
          workItemId,
          JSON.stringify({
            destination: "daily_tasks",
            dueDate: input.date,
            externalAction: false,
          }),
          now,
          now,
        ),
      db
        .prepare(`
          INSERT OR IGNORE INTO agent_events (
            run_id, work_item_id, event_type, actor_type, actor_id,
            payload_json, idempotency_key, created_at
          ) VALUES (?, ?, 'work_item_proposed', 'agent', 'coast_advisor_v1', ?, ?, ?)
        `)
        .bind(
          runId,
          workItemId,
          JSON.stringify({ title: candidate.title, goalArea: candidate.goalArea }),
          `plan:${runKey}:${candidate.goalArea}`,
          now,
        ),
    );
  }

  try {
    await db.batch(statements);
  } catch (error) {
    const concurrent = await getAgentAdvisorOverview(input.date);
    if (concurrent.run) return concurrent;
    throw error;
  }
  return getAgentAdvisorOverview(input.date);
}

export interface OperatorPlanInput {
  date: string;
  objective: string;
  summary: string;
  requestedBy: string;
  items: Array<{
    goalArea: AgentGoalArea;
    project: string;
    title: string;
    rationale: string;
    definitionOfDone: string;
    evidenceRequired: string;
    priority: "P0" | "P1" | "P2";
    sourceRef?: string;
  }>;
}

export async function submitOperatorDailyPlan(input: OperatorPlanInput): Promise<AgentAdvisorOverview> {
  const db = await getDB();
  const runKey = `daily-operator:${input.date}`;
  const existing = await db
    .prepare("SELECT id FROM agent_runs WHERE run_key = ? LIMIT 1")
    .bind(runKey)
    .first<{ id: string }>();
  if (existing) return getAgentAdvisorOverview(input.date);

  const candidates = input.items.slice(0, 3);
  if (candidates.length === 0) {
    throw new Error("Operator 计划至少需要一条行动");
  }

  const runId = crypto.randomUUID();
  const now = new Date().toISOString();
  const statements = [
    db
      .prepare(`
        INSERT INTO agent_runs (
          id, run_key, trigger_type, objective, status, context_json, plan_json,
          summary, budget_steps, started_at, completed_at, created_at, updated_at
        ) VALUES (?, ?, 'codex_operator', ?, 'completed', ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        runId,
        runKey,
        input.objective,
        JSON.stringify({
          planner: "codex_mcp",
          requestedBy: input.requestedBy,
          sourceHealth: [],
        }),
        JSON.stringify(candidates),
        input.summary,
        candidates.length,
        now,
        now,
        now,
        now,
      ),
  ];

  for (const [index, candidate] of candidates.entries()) {
    const workItemId = crypto.randomUUID();
    const approvalId = crypto.randomUUID();
    statements.push(
      db
        .prepare(`
          INSERT INTO agent_work_items (
            id, run_id, goal_area, project, title, rationale, definition_of_done,
            evidence_required, priority, state, due_date, source_kind, source_ref,
            created_by, version, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'proposed', ?, 'codex_plan', ?, 'codex_operator', 1, ?, ?)
        `)
        .bind(
          workItemId,
          runId,
          candidate.goalArea,
          candidate.project.trim(),
          candidate.title.trim(),
          candidate.rationale.trim(),
          candidate.definitionOfDone.trim(),
          candidate.evidenceRequired.trim(),
          candidate.priority,
          input.date,
          candidate.sourceRef?.trim() || `codex:${input.date}:${index + 1}`,
          now,
          now,
        ),
      db
        .prepare(`
          INSERT INTO agent_approvals (
            id, run_id, work_item_id, action_type, risk_level, request_json,
            status, created_at, updated_at
          ) VALUES (?, ?, ?, 'create_daily_task', 'low', ?, 'pending', ?, ?)
        `)
        .bind(
          approvalId,
          runId,
          workItemId,
          JSON.stringify({
            destination: "daily_tasks",
            dueDate: input.date,
            externalAction: false,
            source: "codex_operator",
          }),
          now,
          now,
        ),
      db
        .prepare(`
          INSERT OR IGNORE INTO agent_events (
            run_id, work_item_id, event_type, actor_type, actor_id,
            payload_json, idempotency_key, created_at
          ) VALUES (?, ?, 'work_item_proposed', 'operator', ?, ?, ?, ?)
        `)
        .bind(
          runId,
          workItemId,
          input.requestedBy,
          JSON.stringify({
            title: candidate.title,
            goalArea: candidate.goalArea,
            planner: "codex_mcp",
          }),
          `operator-plan:${runKey}:${index + 1}`,
          now,
        ),
    );
  }

  try {
    await db.batch(statements);
  } catch (error) {
    const concurrent = await db
      .prepare("SELECT id FROM agent_runs WHERE run_key = ? LIMIT 1")
      .bind(runKey)
      .first<{ id: string }>();
    if (!concurrent) throw error;
  }

  return getAgentAdvisorOverview(input.date);
}

export async function decideAgentWorkItem(
  id: string,
  decision: "approve" | "reject",
): Promise<{ success: true; state: AgentWorkItemState }> {
  const db = await getDB();
  const item = await db
    .prepare(`
      SELECT id, run_id, goal_area, title, state, due_date, version
      FROM agent_work_items
      WHERE id = ?
      LIMIT 1
    `)
    .bind(id)
    .first<{
      id: string;
      run_id: string;
      goal_area: AgentGoalArea;
      title: string;
      state: AgentWorkItemState;
      due_date: string;
      version: number;
    }>();

  if (!item) throw new Error("Agent 工作项不存在");
  if (decision === "approve" && ["approved", "completed", "verified"].includes(item.state)) {
    return { success: true, state: item.state };
  }
  if (decision === "reject" && item.state === "cancelled") {
    return { success: true, state: "cancelled" };
  }
  if (item.state !== "proposed") {
    throw new Error("当前状态不允许审批");
  }

  const now = new Date().toISOString();
  if (decision === "reject") {
    await db.batch([
      db
        .prepare(`
          UPDATE agent_work_items
          SET state = 'cancelled', version = version + 1, updated_at = ?
          WHERE id = ? AND state = 'proposed'
        `)
        .bind(now, id),
      db
        .prepare(`
          UPDATE agent_approvals
          SET status = 'rejected', decided_by = 'owner', decided_at = ?, updated_at = ?
          WHERE work_item_id = ? AND status = 'pending'
        `)
        .bind(now, now, id),
      db
        .prepare(`
          INSERT OR IGNORE INTO agent_events (
            run_id, work_item_id, event_type, actor_type, actor_id,
            payload_json, idempotency_key, created_at
          ) VALUES (?, ?, 'work_item_rejected', 'human', 'owner', '{}', ?, ?)
        `)
        .bind(item.run_id, id, `reject:${id}:${item.version}`, now),
    ]);
    return { success: true, state: "cancelled" };
  }

  await db.batch([
    db
      .prepare(`
        UPDATE agent_work_items
        SET state = 'approved', approved_at = ?, version = version + 1, updated_at = ?
        WHERE id = ? AND state = 'proposed'
      `)
      .bind(now, now, id),
    db
      .prepare(`
        UPDATE agent_approvals
        SET status = 'approved', decided_by = 'owner', decided_at = ?, updated_at = ?
        WHERE work_item_id = ? AND status = 'pending'
      `)
      .bind(now, now, id),
    db
      .prepare(`
        INSERT OR IGNORE INTO daily_tasks (
          task_date, task_datetime, text, completed, goal_area, agent_work_item_id
        ) VALUES (?, ?, ?, 0, ?, ?)
      `)
      .bind(item.due_date, now, item.title, item.goal_area, id),
    db
      .prepare(`
        INSERT OR IGNORE INTO agent_events (
          run_id, work_item_id, event_type, actor_type, actor_id,
          payload_json, idempotency_key, created_at
        ) VALUES (?, ?, 'work_item_approved', 'human', 'owner', ?, ?, ?)
      `)
      .bind(
        item.run_id,
        id,
        JSON.stringify({ destination: "daily_tasks", dueDate: item.due_date }),
        `approve:${id}:${item.version}`,
        now,
      ),
  ]);

  return { success: true, state: "approved" };
}

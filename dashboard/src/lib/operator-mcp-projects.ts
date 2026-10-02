import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import * as z from "zod/v4";
import { runAuditedOperatorTool } from "@/lib/operator";
import type { AuthenticatedOperator } from "@/lib/operator-auth";
import {
    callUpstream,
    findEntity,
    getUpstreamState,
    mergeForReplace,
} from "@/lib/operator-upstream";

const DATE_SCHEMA = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "必须为 YYYY-MM-DD");
const MONTH_SCHEMA = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "必须为 YYYY-MM");

const AINOTES_PLATFORM_STATUS = z.enum(["运营中", "已暂停", "筹备中"]);
const AINOTES_TASK_STATUS = z.enum(["待办", "进行中", "已发布", "已完成"]);

const PRODUCTLAB_STAGE = z.enum(["概念期", "筹备中", "开发中", "验证期", "增长中", "运营中", "已暂停"]);
const PRODUCTLAB_ROADMAP_STATUS = z.enum(["待办", "进行中", "已完成", "已搁置"]);
const PRODUCTLAB_ROADMAP_PRIORITY = z.enum(["高", "中", "低"]);
const PRODUCTLAB_PILLAR = z.enum(["核心功能", "支付变现", "Onboarding", "增长获客", "仪表盘", "集成", "稳定性", "其他"]);
const PRODUCTLAB_CAMPAIGN_STATUS = z.enum(["待启动", "进行中", "已完成", "已复盘"]);
const PRODUCTLAB_REVENUE_CATEGORY = z.enum(["订阅", "一次性收入", "服务", "联盟", "其他"]);

const AIBOUNTY_TARGET_STATUS = z.enum(["Main", "Follow", "Watch", "Dropped"]);
const AIBOUNTY_VULN_STATUS = z.enum(["Verified", "Submitted", "Triaged", "Awarded", "Draft", "Downgraded"]);
const AIBOUNTY_VULN_SEVERITY = z.enum(["Critical", "High", "Medium", "Low", "Info", "Unrated"]);
const AIBOUNTY_TASK_PRIORITY = z.enum(["P0", "P1", "P2"]);
const AIBOUNTY_TASK_LINE = z.enum(["A", "ACC"]);
const AIBOUNTY_TASK_KIND = z.enum(["certain", "blocking", "explore"]);
const AIBOUNTY_TASK_WEEK = z.string().regex(/^W(?:[1-9]|1\d|2[0-3])$/, "必须为 W1-W23");

const READ_ONLY = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true } as const;
const WRITE = { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false } as const;
const DELETE_HINT = { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: false } as const;

function textResult(summary: string, data: unknown) {
    return {
        content: [{ type: "text" as const, text: `${summary}\n${JSON.stringify(data, null, 2)}` }],
        structuredContent:
            data && typeof data === "object" ? (data as Record<string, unknown>) : { value: data },
    };
}

function stripUndefined<T extends Record<string, unknown>>(input: T): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input)) {
        if (value !== undefined) out[key] = value;
    }
    return out;
}

type ToolResult = ReturnType<typeof textResult>;

export function registerUpstreamProjectTools(
    server: McpServer,
    operator: AuthenticatedOperator,
): void {
    const audited = <TArgs extends Record<string, unknown>>(
        toolName: string,
        args: TArgs,
        run: () => Promise<unknown>,
        summary: string,
    ): Promise<ToolResult> =>
        runAuditedOperatorTool(operator.tokenId, toolName, args, run).then((result) =>
            textResult(summary, result),
        );

    // ============ AI Notes ============

    server.registerTool(
        "ainotes_get_state",
        {
            title: "读取 AI Notes 全量状态",
            description: "读取平台账号、写作任务、粉丝快照、收入记录与月度汇总。",
            annotations: READ_ONLY,
        },
        async () =>
            audited("ainotes_get_state", {}, () => getUpstreamState("ainotes"), "已读取 AI Notes 状态。"),
    );

    server.registerTool(
        "ainotes_upsert_platform",
        {
            title: "新建或更新 AI Notes 平台账号",
            description:
                "不传 id 时新建；传 id 时按现有记录合并后全量更新。isMonthlyFocus 控制本月内容重点标记。",
            inputSchema: {
                id: z.string().trim().min(1).optional().describe("已有平台 id；省略则新建"),
                name: z.string().trim().min(1).max(120).describe("账号名称"),
                platform: z.string().trim().min(1).max(80).describe("平台名称，如 公众号/小红书"),
                contentType: z.string().trim().max(120).optional(),
                status: AINOTES_PLATFORM_STATUS.optional(),
                targetFollowers: z.number().int().min(0).optional(),
                baselineFollowers: z.number().int().min(0).optional(),
                isMonthlyFocus: z.boolean().optional(),
                notes: z.string().trim().max(2000).optional(),
            },
            annotations: WRITE,
        },
        async ({ id, ...fields }) =>
            audited("ainotes_upsert_platform", { id, ...fields }, async () => {
                if (id) {
                    const state = await getUpstreamState("ainotes");
                    const existing = findEntity(state, "platforms", id, "AI Notes");
                    const body = mergeForReplace(existing, stripUndefined(fields), [
                        "name", "platform", "contentType", "status", "targetFollowers",
                        "baselineFollowers", "isMonthlyFocus", "notes",
                    ]);
                    return callUpstream("ainotes", "PUT", `/api/platforms/${id}`, body);
                }
                return callUpstream("ainotes", "POST", "/api/platforms", stripUndefined(fields));
            }, id ? "AI Notes 平台账号已更新。" : "AI Notes 平台账号已创建。"),
    );

    server.registerTool(
        "ainotes_upsert_task",
        {
            title: "新建或更新 AI Notes 写作任务",
            description:
                "不传 id 时新建（platformAccountId 与 title 必填）；传 id 时合并更新。status=已完成 时必须同时给出 goalMetric、targetValue、actualValue、evidenceUrl。",
            inputSchema: {
                id: z.string().trim().min(1).optional().describe("已有任务 id；省略则新建"),
                platformAccountId: z.string().trim().min(1).describe("平台账号 id，用 ainotes_get_state 查看"),
                title: z.string().trim().min(1).max(200),
                contentFormat: z.string().trim().max(80).optional().describe("内容形式，如 图文/视频"),
                status: AINOTES_TASK_STATUS.optional(),
                dueDate: z.string().trim().max(32).optional(),
                publishedAt: z.string().trim().max(32).optional(),
                expectedRevenue: z.number().min(0).optional(),
                goalMetric: z.string().trim().max(120).optional().describe("结果指标名，如 阅读量"),
                goalDirection: z.enum(["at_least", "at_most"]).optional(),
                targetValue: z.number().nullable().optional(),
                actualValue: z.number().nullable().optional(),
                evidenceUrl: z.string().trim().url().optional().describe("结果证据链接（http/https）"),
                notes: z.string().trim().max(2000).optional(),
            },
            annotations: WRITE,
        },
        async ({ id, ...fields }) =>
            audited("ainotes_upsert_task", { id, ...fields }, async () => {
                const keys = [
                    "title", "platformAccountId", "contentFormat", "status", "dueDate", "publishedAt",
                    "expectedRevenue", "goalMetric", "goalDirection", "targetValue", "actualValue",
                    "evidenceUrl", "notes",
                ];
                if (id) {
                    const state = await getUpstreamState("ainotes");
                    const existing = findEntity(state, "tasks", id, "AI Notes");
                    return callUpstream("ainotes", "PUT", `/api/tasks/${id}`,
                        mergeForReplace(existing, stripUndefined(fields), keys));
                }
                return callUpstream("ainotes", "POST", "/api/tasks", stripUndefined(fields));
            }, id ? "AI Notes 写作任务已更新。" : "AI Notes 写作任务已创建。"),
    );

    server.registerTool(
        "ainotes_delete_task",
        {
            title: "删除 AI Notes 写作任务",
            description: "按 id 删除写作任务，不可恢复。",
            inputSchema: { id: z.string().trim().min(1) },
            annotations: DELETE_HINT,
        },
        async ({ id }) =>
            audited("ainotes_delete_task", { id }, () =>
                callUpstream("ainotes", "DELETE", `/api/tasks/${id}`), "AI Notes 写作任务已删除。"),
    );

    server.registerTool(
        "ainotes_add_snapshot",
        {
            title: "记录 AI Notes 粉丝快照",
            description: "为平台账号记录某天的粉丝/点赞/阅读数快照。",
            inputSchema: {
                platformAccountId: z.string().trim().min(1),
                snapshotDate: DATE_SCHEMA,
                followers: z.number().int().min(0).optional(),
                likes: z.number().int().min(0).optional(),
                views: z.number().int().min(0).optional(),
                notes: z.string().trim().max(2000).optional(),
            },
            annotations: WRITE,
        },
        async (fields) =>
            audited("ainotes_add_snapshot", fields, () =>
                callUpstream("ainotes", "POST", "/api/snapshots", stripUndefined(fields)),
                "AI Notes 粉丝快照已记录。"),
    );

    server.registerTool(
        "ainotes_delete_snapshot",
        {
            title: "删除 AI Notes 粉丝快照",
            description: "按 id 删除粉丝快照，不可恢复。",
            inputSchema: { id: z.string().trim().min(1) },
            annotations: DELETE_HINT,
        },
        async ({ id }) =>
            audited("ainotes_delete_snapshot", { id }, () =>
                callUpstream("ainotes", "DELETE", `/api/snapshots/${id}`), "AI Notes 粉丝快照已删除。"),
    );

    server.registerTool(
        "ainotes_upsert_revenue",
        {
            title: "新建或更新 AI Notes 收入记录",
            description:
                "不传 id 时新建（platformAccountId/recordDate/isSettled 必填）；传 id 时合并更新。amount 单位为元。isSettled=true 的记录会进入 Coast 收入总盘。",
            inputSchema: {
                id: z.string().trim().min(1).optional(),
                platformAccountId: z.string().trim().min(1),
                recordDate: DATE_SCHEMA,
                amount: z.number().min(0).optional(),
                category: z.string().trim().max(80).optional().describe("默认 内容收入"),
                isSettled: z.boolean().describe("是否已到账"),
                notes: z.string().trim().max(2000).optional(),
            },
            annotations: WRITE,
        },
        async ({ id, ...fields }) =>
            audited("ainotes_upsert_revenue", { id, ...fields }, async () => {
                const keys = ["platformAccountId", "recordDate", "amount", "category", "isSettled", "notes"];
                if (id) {
                    const state = await getUpstreamState("ainotes");
                    const existing = findEntity(state, "revenues", id, "AI Notes");
                    return callUpstream("ainotes", "PUT", `/api/revenues/${id}`,
                        mergeForReplace(existing, stripUndefined(fields), keys));
                }
                return callUpstream("ainotes", "POST", "/api/revenues", stripUndefined(fields));
            }, id ? "AI Notes 收入记录已更新。" : "AI Notes 收入记录已创建。"),
    );

    server.registerTool(
        "ainotes_delete_revenue",
        {
            title: "删除 AI Notes 收入记录",
            description: "按 id 删除收入记录，不可恢复；已到账收入删除会影响 Coast 收入总盘。",
            inputSchema: { id: z.string().trim().min(1) },
            annotations: DELETE_HINT,
        },
        async ({ id }) =>
            audited("ainotes_delete_revenue", { id }, () =>
                callUpstream("ainotes", "DELETE", `/api/revenues/${id}`), "AI Notes 收入记录已删除。"),
    );

    // ============ Product Lab ============

    server.registerTool(
        "productlab_get_state",
        {
            title: "读取 Product Lab 全量状态",
            description: "读取产品、roadmap、推广活动、指标快照、收入记录与月度目标。",
            annotations: READ_ONLY,
        },
        async () =>
            audited("productlab_get_state", {}, () => getUpstreamState("productlab"), "已读取 Product Lab 状态。"),
    );

    server.registerTool(
        "productlab_upsert_product",
        {
            title: "新建或更新 Product Lab 产品",
            description:
                "不传 id 时新建（name 必填）；传 id 时合并更新。stage=开发中 受 WIP≤2 限制；name 变更会自动重算 slug。",
            inputSchema: {
                id: z.string().trim().min(1).optional(),
                name: z.string().trim().min(1).max(120),
                stage: PRODUCTLAB_STAGE.optional(),
                pricingModel: z.string().trim().max(20).optional().describe("如 subscription/one_time/freemium"),
                positioning: z.string().trim().max(200).optional(),
                annualRevenueTarget: z.number().min(0).optional().describe("年度收入目标 USD"),
                registeredUserTarget: z.number().int().min(0).optional(),
                paidUserTarget: z.number().int().min(0).optional(),
                isPinned: z.boolean().optional(),
                pinnedRank: z.number().int().min(1).optional(),
                notes: z.string().trim().max(2000).optional(),
            },
            annotations: WRITE,
        },
        async ({ id, ...fields }) =>
            audited("productlab_upsert_product", { id, ...fields }, async () => {
                const keys = [
                    "name", "stage", "pricingModel", "positioning", "annualRevenueTarget",
                    "registeredUserTarget", "paidUserTarget", "isPinned", "pinnedRank", "notes",
                ];
                if (id) {
                    const state = await getUpstreamState("productlab");
                    const existing = findEntity(state, "products", id, "Product Lab");
                    return callUpstream("productlab", "PUT", `/api/products/${id}`,
                        mergeForReplace(existing, stripUndefined(fields), keys));
                }
                return callUpstream("productlab", "POST", "/api/products", stripUndefined(fields));
            }, id ? "Product Lab 产品已更新。" : "Product Lab 产品已创建。"),
    );

    server.registerTool(
        "productlab_delete_product",
        {
            title: "删除 Product Lab 产品",
            description: "按 id 删除产品，并级联删除其 roadmap/活动/指标/收入记录，不可恢复。",
            inputSchema: { id: z.string().trim().min(1) },
            annotations: DELETE_HINT,
        },
        async ({ id }) =>
            audited("productlab_delete_product", { id }, () =>
                callUpstream("productlab", "DELETE", `/api/products/${id}`), "Product Lab 产品已删除。"),
    );

    server.registerTool(
        "productlab_upsert_roadmap",
        {
            title: "新建或更新 Product Lab 路线图项",
            description: "不传 id 时新建（productId 与 title 必填）；传 id 时合并更新。",
            inputSchema: {
                id: z.string().trim().min(1).optional(),
                productId: z.string().trim().min(1).describe("产品 id，用 productlab_get_state 查看"),
                title: z.string().trim().min(1).max(200),
                pillar: PRODUCTLAB_PILLAR.optional(),
                status: PRODUCTLAB_ROADMAP_STATUS.optional(),
                priority: PRODUCTLAB_ROADMAP_PRIORITY.optional(),
                dueDate: z.string().trim().max(32).optional(),
                acceptanceCriteria: z.string().trim().max(1000).optional(),
                goalMetric: z.string().trim().max(120).optional(),
                notes: z.string().trim().max(2000).optional(),
            },
            annotations: WRITE,
        },
        async ({ id, ...fields }) =>
            audited("productlab_upsert_roadmap", { id, ...fields }, async () => {
                const keys = [
                    "productId", "title", "pillar", "status", "priority", "dueDate",
                    "acceptanceCriteria", "goalMetric", "notes",
                ];
                if (id) {
                    const state = await getUpstreamState("productlab");
                    const existing = findEntity(state, "roadmap", id, "Product Lab");
                    return callUpstream("productlab", "PUT", `/api/roadmap/${id}`,
                        mergeForReplace(existing, stripUndefined(fields), keys));
                }
                return callUpstream("productlab", "POST", "/api/roadmap", stripUndefined(fields));
            }, id ? "Product Lab 路线图项已更新。" : "Product Lab 路线图项已创建。"),
    );

    server.registerTool(
        "productlab_delete_roadmap",
        {
            title: "删除 Product Lab 路线图项",
            description: "按 id 删除路线图项，不可恢复。",
            inputSchema: { id: z.string().trim().min(1) },
            annotations: DELETE_HINT,
        },
        async ({ id }) =>
            audited("productlab_delete_roadmap", { id }, () =>
                callUpstream("productlab", "DELETE", `/api/roadmap/${id}`), "Product Lab 路线图项已删除。"),
    );

    server.registerTool(
        "productlab_upsert_campaign",
        {
            title: "新建或更新 Product Lab 推广活动",
            description: "不传 id 时新建（productId 与 title 必填）；传 id 时合并更新。",
            inputSchema: {
                id: z.string().trim().min(1).optional(),
                productId: z.string().trim().min(1),
                title: z.string().trim().min(1).max(200),
                channel: z.string().trim().max(80).optional(),
                status: PRODUCTLAB_CAMPAIGN_STATUS.optional(),
                startDate: z.string().trim().max(32).optional(),
                endDate: z.string().trim().max(32).optional(),
                cost: z.number().min(0).optional(),
                signups: z.number().int().min(0).optional(),
                conversions: z.number().int().min(0).optional(),
                targetSignups: z.number().int().min(0).optional(),
                targetConversions: z.number().int().min(0).optional(),
                successCriteria: z.string().trim().max(1000).optional(),
                decision: z.string().trim().max(1000).optional(),
                notes: z.string().trim().max(2000).optional(),
            },
            annotations: WRITE,
        },
        async ({ id, ...fields }) =>
            audited("productlab_upsert_campaign", { id, ...fields }, async () => {
                const keys = [
                    "productId", "title", "channel", "status", "startDate", "endDate", "cost",
                    "signups", "conversions", "targetSignups", "targetConversions",
                    "successCriteria", "decision", "notes",
                ];
                if (id) {
                    const state = await getUpstreamState("productlab");
                    const existing = findEntity(state, "campaigns", id, "Product Lab");
                    return callUpstream("productlab", "PUT", `/api/campaigns/${id}`,
                        mergeForReplace(existing, stripUndefined(fields), keys));
                }
                return callUpstream("productlab", "POST", "/api/campaigns", stripUndefined(fields));
            }, id ? "Product Lab 推广活动已更新。" : "Product Lab 推广活动已创建。"),
    );

    server.registerTool(
        "productlab_delete_campaign",
        {
            title: "删除 Product Lab 推广活动",
            description: "按 id 删除推广活动，不可恢复。",
            inputSchema: { id: z.string().trim().min(1) },
            annotations: DELETE_HINT,
        },
        async ({ id }) =>
            audited("productlab_delete_campaign", { id }, () =>
                callUpstream("productlab", "DELETE", `/api/campaigns/${id}`), "Product Lab 推广活动已删除。"),
    );

    server.registerTool(
        "productlab_upsert_metric",
        {
            title: "新建或更新 Product Lab 指标快照",
            description:
                "不传 id 时新建（productId 与 snapshotDate 必填）；传 id 时合并更新。paidUsers 不能超过 registeredUsers。金额单位为 USD。",
            inputSchema: {
                id: z.string().trim().min(1).optional(),
                productId: z.string().trim().min(1),
                snapshotDate: DATE_SCHEMA,
                periodStart: z.string().trim().max(32).optional(),
                periodEnd: z.string().trim().max(32).optional(),
                totalPaidAmount: z.number().min(0).optional(),
                monthlyRecurringRevenue: z.number().min(0).optional(),
                registeredUsers: z.number().int().min(0).optional(),
                newRegisteredUsers: z.number().int().min(0).optional(),
                paidUsers: z.number().int().min(0).optional(),
                newPaidUsers: z.number().int().min(0).optional(),
                canceledPaidUsers: z.number().int().min(0).optional(),
                newMrr: z.number().min(0).optional(),
                expansionMrr: z.number().min(0).optional(),
                contractionMrr: z.number().min(0).optional(),
                churnedMrr: z.number().min(0).optional(),
                notes: z.string().trim().max(2000).optional(),
            },
            annotations: WRITE,
        },
        async ({ id, ...fields }) =>
            audited("productlab_upsert_metric", { id, ...fields }, async () => {
                const keys = [
                    "productId", "snapshotDate", "periodStart", "periodEnd", "totalPaidAmount",
                    "monthlyRecurringRevenue", "registeredUsers", "newRegisteredUsers", "paidUsers",
                    "newPaidUsers", "canceledPaidUsers", "newMrr", "expansionMrr", "contractionMrr",
                    "churnedMrr", "notes",
                ];
                if (id) {
                    const state = await getUpstreamState("productlab");
                    const existing = findEntity(state, "metrics", id, "Product Lab");
                    return callUpstream("productlab", "PUT", `/api/metrics/${id}`,
                        mergeForReplace(existing, stripUndefined(fields), keys));
                }
                return callUpstream("productlab", "POST", "/api/metrics", stripUndefined(fields));
            }, id ? "Product Lab 指标快照已更新。" : "Product Lab 指标快照已创建。"),
    );

    server.registerTool(
        "productlab_delete_metric",
        {
            title: "删除 Product Lab 指标快照",
            description: "按 id 删除指标快照，不可恢复。",
            inputSchema: { id: z.string().trim().min(1) },
            annotations: DELETE_HINT,
        },
        async ({ id }) =>
            audited("productlab_delete_metric", { id }, () =>
                callUpstream("productlab", "DELETE", `/api/metrics/${id}`), "Product Lab 指标快照已删除。"),
    );

    server.registerTool(
        "productlab_upsert_revenue",
        {
            title: "新建或更新 Product Lab 收入记录",
            description:
                "不传 id 时新建（productId/recordDate/isSettled 必填）；传 id 时合并更新。amount 单位为 USD。isSettled=true 的记录按汇率进入 Coast 收入总盘。",
            inputSchema: {
                id: z.string().trim().min(1).optional(),
                productId: z.string().trim().min(1),
                recordDate: DATE_SCHEMA,
                amount: z.number().min(0).optional().describe("USD"),
                category: PRODUCTLAB_REVENUE_CATEGORY.optional(),
                isSettled: z.boolean().describe("是否已到账"),
                notes: z.string().trim().max(2000).optional(),
            },
            annotations: WRITE,
        },
        async ({ id, ...fields }) =>
            audited("productlab_upsert_revenue", { id, ...fields }, async () => {
                const keys = ["productId", "recordDate", "amount", "category", "isSettled", "notes"];
                if (id) {
                    const state = await getUpstreamState("productlab");
                    const existing = findEntity(state, "revenues", id, "Product Lab");
                    return callUpstream("productlab", "PUT", `/api/revenues/${id}`,
                        mergeForReplace(existing, stripUndefined(fields), keys));
                }
                return callUpstream("productlab", "POST", "/api/revenues", stripUndefined(fields));
            }, id ? "Product Lab 收入记录已更新。" : "Product Lab 收入记录已创建。"),
    );

    server.registerTool(
        "productlab_delete_revenue",
        {
            title: "删除 Product Lab 收入记录",
            description: "按 id 删除收入记录，不可恢复；已到账收入删除会影响 Coast 收入总盘。",
            inputSchema: { id: z.string().trim().min(1) },
            annotations: DELETE_HINT,
        },
        async ({ id }) =>
            audited("productlab_delete_revenue", { id }, () =>
                callUpstream("productlab", "DELETE", `/api/revenues/${id}`), "Product Lab 收入记录已删除。"),
    );

    server.registerTool(
        "productlab_set_revenue_target",
        {
            title: "设置 Product Lab 月度收入目标",
            description: "按月份 upsert 收入目标（USD）；targetAmount=0 且 notes 为空时删除该月目标。",
            inputSchema: {
                monthKey: MONTH_SCHEMA,
                targetAmount: z.number().min(0),
                notes: z.string().trim().max(1000).optional(),
            },
            annotations: WRITE,
        },
        async ({ monthKey, targetAmount, notes }) =>
            audited("productlab_set_revenue_target", { monthKey, targetAmount, notes }, () =>
                callUpstream("productlab", "PUT", `/api/revenue-targets/${monthKey}`, {
                    monthKey, targetAmount, notes: notes || "",
                }), "Product Lab 月度收入目标已设置。"),
    );

    // ============ AIBounty ============

    server.registerTool(
        "aibounty_get_state",
        {
            title: "读取 AIBounty 全量状态",
            description: "读取 KPI、phases/tasks、目标池、漏洞管线、周复盘与 repo 同步健康度。",
            annotations: READ_ONLY,
        },
        async () =>
            audited("aibounty_get_state", {}, () => getUpstreamState("aibounty"), "已读取 AIBounty 状态。"),
    );

    server.registerTool(
        "aibounty_upsert_target",
        {
            title: "新建或更新 AIBounty 目标",
            description:
                "不传 id 时新建（name 与 structuralThesis 必填）；传 id 时合并更新。主攻 Main 最多 2 个，超出会被拒绝。",
            inputSchema: {
                id: z.string().trim().min(1).optional(),
                name: z.string().trim().min(1).max(200),
                status: AIBOUNTY_TARGET_STATUS.optional(),
                bountyFloor: z.number().min(0).optional().describe("官方奖励下限 USD"),
                riskSurface: z.string().trim().max(500).optional(),
                structuralThesis: z.string().trim().min(1).max(3000).describe("结构性失效假设"),
                nextAction: z.string().trim().max(1000).optional(),
                lastReviewed: z.string().trim().max(20).optional().describe("YYYY-MM-DD"),
                notes: z.string().trim().max(10000).optional(),
            },
            annotations: WRITE,
        },
        async ({ id, ...fields }) =>
            audited("aibounty_upsert_target", { id, ...fields }, async () => {
                const keys = [
                    "name", "status", "bountyFloor", "riskSurface", "structuralThesis",
                    "nextAction", "lastReviewed", "notes",
                ];
                if (id) {
                    const state = await getUpstreamState("aibounty");
                    const existing = findEntity(state, "targets", id, "AIBounty");
                    return callUpstream("aibounty", "PUT", `/api/targets/${id}`,
                        mergeForReplace(existing, stripUndefined(fields), keys));
                }
                return callUpstream("aibounty", "POST", "/api/targets", stripUndefined(fields));
            }, id ? "AIBounty 目标已更新。" : "AIBounty 目标已创建。"),
    );

    server.registerTool(
        "aibounty_delete_target",
        {
            title: "删除 AIBounty 目标",
            description: "按 id 删除目标池记录，不可恢复。",
            inputSchema: { id: z.string().trim().min(1) },
            annotations: DELETE_HINT,
        },
        async ({ id }) =>
            audited("aibounty_delete_target", { id }, () =>
                callUpstream("aibounty", "DELETE", `/api/targets/${id}`), "AIBounty 目标已删除。"),
    );

    server.registerTool(
        "aibounty_upsert_vuln",
        {
            title: "新建或更新 AIBounty 漏洞记录",
            description:
                "不传 id 时新建（title/target/severity 必填）；传 id 时合并更新（repo 来源记录会被 409 拒绝）。状态约束：Verified 需 platform+reportPath（reports/ 或 targets/<t>/suspects|poc/）；Submitted/Triaged/Awarded 另需 platformReportId+submittedAt；Awarded 需 awardedBounty>0；Paid 只能由 repo sync 登记；状态回退需 confirmDowngrade=true。",
            inputSchema: {
                id: z.string().trim().min(1).optional(),
                title: z.string().trim().min(1).max(500),
                target: z.string().trim().min(1).max(300),
                severity: AIBOUNTY_VULN_SEVERITY,
                status: AIBOUNTY_VULN_STATUS.optional(),
                platform: z.string().trim().max(200).optional().describe("提交平台，如 huntr/0din"),
                platformReportId: z.string().trim().max(200).optional(),
                submittedAt: DATE_SCHEMA.optional(),
                expectedBounty: z.number().min(0).optional(),
                awardedBounty: z.number().min(0).optional(),
                reportPath: z.string().trim().max(1000).optional().describe("repo 内报告/证据路径"),
                notes: z.string().trim().max(30000).optional(),
                confirmDowngrade: z.boolean().optional().describe("状态回退时必须传 true"),
            },
            annotations: WRITE,
        },
        async ({ id, ...fields }) =>
            audited("aibounty_upsert_vuln", { id, ...fields }, async () => {
                const keys = [
                    "title", "target", "severity", "status", "platform", "platformReportId",
                    "submittedAt", "expectedBounty", "awardedBounty", "reportPath", "notes",
                ];
                if (id) {
                    const state = await getUpstreamState("aibounty");
                    const existing = findEntity(state, "vulns", id, "AIBounty");
                    const body = mergeForReplace(existing, stripUndefined(fields), keys);
                    if (fields.confirmDowngrade !== undefined) {
                        body.confirmDowngrade = fields.confirmDowngrade;
                    }
                    return callUpstream("aibounty", "PUT", `/api/vulns/${id}`, body);
                }
                return callUpstream("aibounty", "POST", "/api/vulns", stripUndefined(fields));
            }, id ? "AIBounty 漏洞记录已更新。" : "AIBounty 漏洞记录已创建。"),
    );

    server.registerTool(
        "aibounty_delete_vuln",
        {
            title: "删除 AIBounty 漏洞记录",
            description: "按 id 删除漏洞记录，不可恢复；repo 来源记录会被 409 拒绝，需在 reports/SUBMISSIONS.md 处理。",
            inputSchema: { id: z.string().trim().min(1) },
            annotations: DELETE_HINT,
        },
        async ({ id }) =>
            audited("aibounty_delete_vuln", { id }, () =>
                callUpstream("aibounty", "DELETE", `/api/vulns/${id}`), "AIBounty 漏洞记录已删除。"),
    );

    server.registerTool(
        "aibounty_upsert_task",
        {
            title: "新建或更新 AIBounty 阶段任务",
            description:
                "不传 id 时新建（phaseId 与 title 必填）；传 id 时按幂等 upsert 更新（未提供 done 时保留原状态）。",
            inputSchema: {
                id: z.string().trim().min(1).optional(),
                phaseId: z.string().trim().min(1).describe("所属 phase id，用 aibounty_get_state 查看 plan.phases"),
                title: z.string().trim().min(1).max(500),
                priority: AIBOUNTY_TASK_PRIORITY.optional(),
                due: z.string().trim().max(20).optional().describe("YYYY-MM-DD"),
                line: AIBOUNTY_TASK_LINE.optional().describe("A=漏洞主线；ACC=积累任务"),
                kind: AIBOUNTY_TASK_KIND.optional(),
                week: AIBOUNTY_TASK_WEEK.optional(),
                done: z.boolean().optional(),
            },
            annotations: WRITE,
        },
        async (fields) =>
            audited("aibounty_upsert_task", fields, () =>
                callUpstream("aibounty", "POST", "/api/tasks", stripUndefined(fields)),
                fields.id ? "AIBounty 任务已更新。" : "AIBounty 任务已创建。"),
    );

    server.registerTool(
        "aibounty_toggle_task",
        {
            title: "完成或重开 AIBounty 任务",
            description: "切换任务完成状态，不改其他字段。",
            inputSchema: {
                id: z.string().trim().min(1),
                done: z.boolean(),
            },
            annotations: WRITE,
        },
        async ({ id, done }) =>
            audited("aibounty_toggle_task", { id, done }, () =>
                callUpstream("aibounty", "PATCH", `/api/tasks/${id}/toggle`, { done }),
                done ? "AIBounty 任务已完成。" : "AIBounty 任务已重开。"),
    );

    server.registerTool(
        "aibounty_delete_task",
        {
            title: "删除 AIBounty 任务",
            description: "按 id 删除阶段任务，不可恢复。",
            inputSchema: { id: z.string().trim().min(1) },
            annotations: DELETE_HINT,
        },
        async ({ id }) =>
            audited("aibounty_delete_task", { id }, () =>
                callUpstream("aibounty", "DELETE", `/api/tasks/${id}`), "AIBounty 任务已删除。"),
    );

    server.registerTool(
        "aibounty_upsert_phase",
        {
            title: "新建或更新 AIBounty 阶段",
            description: "不传 id 时新建（title 必填）；传 id 时合并更新。",
            inputSchema: {
                id: z.string().trim().min(1).optional(),
                title: z.string().trim().min(1).max(200),
                goal: z.string().trim().max(3000).optional(),
                startDate: z.string().trim().max(20).optional(),
                endDate: z.string().trim().max(20).optional(),
            },
            annotations: WRITE,
        },
        async ({ id, ...fields }) =>
            audited("aibounty_upsert_phase", { id, ...fields }, async () => {
                const keys = ["title", "goal", "startDate", "endDate"];
                if (id) {
                    const state = await getUpstreamState("aibounty");
                    const phases = (state.plan as Record<string, unknown> | undefined)?.phases;
                    const existing = findEntity({ phases }, "phases", id, "AIBounty");
                    return callUpstream("aibounty", "PUT", `/api/phases/${id}`,
                        mergeForReplace(existing, stripUndefined(fields), keys));
                }
                return callUpstream("aibounty", "POST", "/api/phases", stripUndefined(fields));
            }, id ? "AIBounty 阶段已更新。" : "AIBounty 阶段已创建。"),
    );

    server.registerTool(
        "aibounty_delete_phase",
        {
            title: "删除 AIBounty 阶段",
            description: "按 id 删除阶段，并级联删除其下全部任务，不可恢复。",
            inputSchema: { id: z.string().trim().min(1) },
            annotations: DELETE_HINT,
        },
        async ({ id }) =>
            audited("aibounty_delete_phase", { id }, () =>
                callUpstream("aibounty", "DELETE", `/api/phases/${id}`), "AIBounty 阶段已删除。"),
    );

    server.registerTool(
        "aibounty_update_kpis",
        {
            title: "更新 AIBounty KPI",
            description:
                "只更新传入的 KPI 项，其余保持原值。cash_received 为已到账 USD，deep_negotiations 为深度沟通次数。",
            inputSchema: {
                cashReceived: z.number().min(0).optional(),
                deepNegotiations: z.number().int().min(0).optional(),
            },
            annotations: WRITE,
        },
        async ({ cashReceived, deepNegotiations }) =>
            audited("aibounty_update_kpis", { cashReceived, deepNegotiations }, async () => {
                if (cashReceived === undefined && deepNegotiations === undefined) {
                    throw new Error("至少提供一个 KPI 字段");
                }
                const state = await getUpstreamState("aibounty");
                const current = (state.kpis as Record<string, unknown>) || {};
                return callUpstream("aibounty", "PUT", "/api/kpis", {
                    kpis: {
                        cash_received: cashReceived ?? Number(current.cash_received || 0),
                        deep_negotiations: deepNegotiations ?? Number(current.deep_negotiations || 0),
                    },
                });
            }, "AIBounty KPI 已更新。"),
    );

    server.registerTool(
        "aibounty_update_notes",
        {
            title: "更新 AIBounty 周复盘与阻塞",
            description: "只更新传入字段，未传入的保持原值。",
            inputSchema: {
                weeklyReview: z.string().trim().max(30000).optional(),
                blockers: z.string().trim().max(30000).optional(),
            },
            annotations: WRITE,
        },
        async ({ weeklyReview, blockers }) =>
            audited("aibounty_update_notes", { weeklyReview, blockers }, async () => {
                if (weeklyReview === undefined && blockers === undefined) {
                    throw new Error("至少提供一个字段");
                }
                const state = await getUpstreamState("aibounty");
                const current = (state.notes as Record<string, unknown>) || {};
                return callUpstream("aibounty", "PUT", "/api/notes", {
                    weeklyReview: weeklyReview ?? String(current.weeklyReview || ""),
                    blockers: blockers ?? String(current.blockers || ""),
                });
            }, "AIBounty 复盘笔记已更新。"),
    );
}

import { getDB } from "@/lib/db";

export type OperatorActionStatus = "pending" | "approved" | "rejected" | "executed";
export type OperatorRiskLevel = "medium" | "high" | "critical";

export interface OperatorActionRequest {
  id: string;
  actionType: string;
  target: string;
  summary: string;
  riskLevel: OperatorRiskLevel;
  request: Record<string, unknown>;
  status: OperatorActionStatus;
  requestedBy: string;
  decidedBy: string;
  decidedAt: string;
  executedAt: string;
  createdAt: string;
  updatedAt: string;
}

function serializeAuditValue(value: unknown): string {
  try {
    const serialized = JSON.stringify(value ?? {});
    return serialized.length > 20_000 ? `${serialized.slice(0, 20_000)}…` : serialized;
  } catch {
    return JSON.stringify({ unserializable: true });
  }
}

export async function runAuditedOperatorTool<T>(
  tokenId: string,
  toolName: string,
  request: unknown,
  handler: () => Promise<T>,
): Promise<T> {
  const db = await getDB();
  const createdAt = new Date().toISOString();

  try {
    const result = await handler();
    await db
      .prepare(`
        INSERT INTO operator_tool_calls (
          token_id, tool_name, request_json, response_json, status,
          error_message, created_at, completed_at
        ) VALUES (?, ?, ?, ?, 'success', '', ?, ?)
      `)
      .bind(
        tokenId,
        toolName,
        serializeAuditValue(request),
        serializeAuditValue(result),
        createdAt,
        new Date().toISOString(),
      )
      .run();
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Operator 工具执行失败";
    await db
      .prepare(`
        INSERT INTO operator_tool_calls (
          token_id, tool_name, request_json, response_json, status,
          error_message, created_at, completed_at
        ) VALUES (?, ?, ?, '{}', 'error', ?, ?, ?)
      `)
      .bind(
        tokenId,
        toolName,
        serializeAuditValue(request),
        message.slice(0, 1_000),
        createdAt,
        new Date().toISOString(),
      )
      .run();
    throw error;
  }
}

export async function createOperatorActionRequest(input: {
  actionType: string;
  target: string;
  summary: string;
  riskLevel: OperatorRiskLevel;
  request: Record<string, unknown>;
  requestedBy: string;
  idempotencyKey: string;
}): Promise<OperatorActionRequest> {
  const db = await getDB();
  const existing = await db
    .prepare(`
      SELECT *
      FROM operator_action_requests
      WHERE idempotency_key = ?
      LIMIT 1
    `)
    .bind(input.idempotencyKey)
    .first<Record<string, unknown>>();

  if (existing) return mapActionRow(existing);

  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  await db
    .prepare(`
      INSERT INTO operator_action_requests (
        id, action_type, target, summary, risk_level, request_json, status,
        requested_by, idempotency_key, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?)
    `)
    .bind(
      id,
      input.actionType,
      input.target.trim(),
      input.summary.trim(),
      input.riskLevel,
      JSON.stringify(input.request),
      input.requestedBy,
      input.idempotencyKey,
      now,
      now,
    )
    .run();

  const created = await db
    .prepare("SELECT * FROM operator_action_requests WHERE id = ? LIMIT 1")
    .bind(id)
    .first<Record<string, unknown>>();
  if (!created) throw new Error("Operator 审批请求创建失败");
  return mapActionRow(created);
}

export async function listOperatorActionRequests(
  status?: OperatorActionStatus,
): Promise<OperatorActionRequest[]> {
  const db = await getDB();
  const rows = status
    ? await db
        .prepare(`
          SELECT *
          FROM operator_action_requests
          WHERE status = ?
          ORDER BY created_at DESC
          LIMIT 100
        `)
        .bind(status)
        .all<Record<string, unknown>>()
    : await db
        .prepare(`
          SELECT *
          FROM operator_action_requests
          ORDER BY created_at DESC
          LIMIT 100
        `)
        .all<Record<string, unknown>>();

  return rows.results.map(mapActionRow);
}

export async function decideOperatorActionRequest(
  id: string,
  decision: "approve" | "reject",
): Promise<OperatorActionRequest> {
  const db = await getDB();
  const pending = await db
    .prepare(`
      SELECT id
      FROM operator_action_requests
      WHERE id = ? AND status = 'pending'
      LIMIT 1
    `)
    .bind(id)
    .first<{ id: string }>();
  if (!pending) {
    throw new Error("审批请求不存在或已处理");
  }

  const now = new Date().toISOString();
  const status = decision === "approve" ? "approved" : "rejected";
  await db
    .prepare(`
      UPDATE operator_action_requests
      SET status = ?, decided_by = 'owner', decided_at = ?, updated_at = ?
      WHERE id = ? AND status = 'pending'
    `)
    .bind(status, now, now, id)
    .run();

  const row = await db
    .prepare("SELECT * FROM operator_action_requests WHERE id = ? LIMIT 1")
    .bind(id)
    .first<Record<string, unknown>>();
  if (!row) throw new Error("审批请求不存在");
  return mapActionRow(row);
}

function mapActionRow(row: Record<string, unknown>): OperatorActionRequest {
  let request: Record<string, unknown> = {};
  try {
    request = JSON.parse(String(row.request_json || "{}")) as Record<string, unknown>;
  } catch {
    request = {};
  }

  return {
    id: String(row.id || ""),
    actionType: String(row.action_type || ""),
    target: String(row.target || ""),
    summary: String(row.summary || ""),
    riskLevel: String(row.risk_level || "high") as OperatorRiskLevel,
    request,
    status: String(row.status || "pending") as OperatorActionStatus,
    requestedBy: String(row.requested_by || ""),
    decidedBy: String(row.decided_by || ""),
    decidedAt: String(row.decided_at || ""),
    executedAt: String(row.executed_at || ""),
    createdAt: String(row.created_at || ""),
    updatedAt: String(row.updated_at || ""),
  };
}

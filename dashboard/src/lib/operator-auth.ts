import { getDB } from "@/lib/db";

const OPERATOR_TOKEN_PREFIX = "coast_op_";
const DEFAULT_TOKEN_TTL_DAYS = 180;

export interface OperatorAccessToken {
  id: string;
  label: string;
  tokenPrefix: string;
  lastUsedAt: string;
  expiresAt: string;
  revokedAt: string;
  createdAt: string;
}

export interface AuthenticatedOperator {
  tokenId: string;
  label: string;
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function hashToken(token: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function normalizeLabel(value?: string): string {
  const label = value?.trim().slice(0, 80);
  return label || "Codex";
}

export async function createOperatorAccessToken(
  label?: string,
): Promise<{ token: string; record: OperatorAccessToken }> {
  const random = new Uint8Array(32);
  crypto.getRandomValues(random);
  const token = `${OPERATOR_TOKEN_PREFIX}${bytesToBase64Url(random)}`;
  const tokenHash = await hashToken(token);
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const expiresAt = new Date(
    Date.now() + DEFAULT_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();
  const tokenPrefix = token.slice(0, 18);
  const normalizedLabel = normalizeLabel(label);
  const db = await getDB();

  await db
    .prepare(`
      INSERT INTO operator_access_tokens (
        id, label, token_prefix, token_hash, expires_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?)
    `)
    .bind(id, normalizedLabel, tokenPrefix, tokenHash, expiresAt, createdAt)
    .run();

  return {
    token,
    record: {
      id,
      label: normalizedLabel,
      tokenPrefix,
      lastUsedAt: "",
      expiresAt,
      revokedAt: "",
      createdAt,
    },
  };
}

export async function listOperatorAccessTokens(): Promise<OperatorAccessToken[]> {
  const db = await getDB();
  const rows = await db
    .prepare(`
      SELECT id, label, token_prefix, last_used_at, expires_at, revoked_at, created_at
      FROM operator_access_tokens
      ORDER BY created_at DESC
    `)
    .all<{
      id: string;
      label: string;
      token_prefix: string;
      last_used_at: string | null;
      expires_at: string | null;
      revoked_at: string | null;
      created_at: string;
    }>();

  return rows.results.map((row) => ({
    id: row.id,
    label: row.label,
    tokenPrefix: row.token_prefix,
    lastUsedAt: row.last_used_at || "",
    expiresAt: row.expires_at || "",
    revokedAt: row.revoked_at || "",
    createdAt: row.created_at,
  }));
}

export async function revokeOperatorAccessToken(id: string): Promise<boolean> {
  const db = await getDB();
  const active = await db
    .prepare(`
      SELECT id
      FROM operator_access_tokens
      WHERE id = ? AND revoked_at IS NULL
      LIMIT 1
    `)
    .bind(id)
    .first<{ id: string }>();
  if (!active) return false;

  await db
    .prepare(`
      UPDATE operator_access_tokens
      SET revoked_at = ?
      WHERE id = ? AND revoked_at IS NULL
    `)
    .bind(new Date().toISOString(), id)
    .run();

  return true;
}

export async function authenticateOperatorRequest(
  request: Request,
): Promise<AuthenticatedOperator | null> {
  const authorization = request.headers.get("authorization") || "";
  const [scheme, token] = authorization.split(/\s+/, 2);
  if (scheme?.toLowerCase() !== "bearer" || !token?.startsWith(OPERATOR_TOKEN_PREFIX)) {
    return null;
  }

  const tokenHash = await hashToken(token);
  const db = await getDB();
  const row = await db
    .prepare(`
      SELECT id, label
      FROM operator_access_tokens
      WHERE token_hash = ?
        AND revoked_at IS NULL
        AND (expires_at IS NULL OR expires_at > ?)
      LIMIT 1
    `)
    .bind(tokenHash, new Date().toISOString())
    .first<{ id: string; label: string }>();

  if (!row) return null;

  await db
    .prepare("UPDATE operator_access_tokens SET last_used_at = ? WHERE id = ?")
    .bind(new Date().toISOString(), row.id)
    .run();

  return { tokenId: row.id, label: row.label };
}

import { getCloudflareContext } from "@opennextjs/cloudflare";

const SESSION_VERSION = "v1";
export const AUTH_COOKIE_NAME = "auth_token";
export const AUTH_SESSION_TTL_SECONDS = 60 * 60 * 24;

function readRuntimeEnv(key: string): string | undefined {
  const processValue = process.env[key];
  if (typeof processValue === "string" && processValue.length > 0) {
    return processValue;
  }

  try {
    const env = getCloudflareContext()?.env as Record<string, unknown> | undefined;
    const value = env?.[key];
    return typeof value === "string" && value.length > 0 ? value : undefined;
  } catch {
    return undefined;
  }
}

function getSessionSecret(): string | undefined {
  return readRuntimeEnv("AUTH_SESSION_SECRET") || readRuntimeEnv("AUTH_PASSWORD_HASH");
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function sign(value: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return toBase64Url(new Uint8Array(signature));
}

function secureCompare(left: string, right: string): boolean {
  let mismatch = left.length === right.length ? 0 : 1;
  const maxLength = Math.max(left.length, right.length);

  for (let index = 0; index < maxLength; index += 1) {
    mismatch |= (left.charCodeAt(index) || 0) ^ (right.charCodeAt(index) || 0);
  }

  return mismatch === 0;
}

export async function createAuthSessionToken(): Promise<{ token: string; expiresAt: number }> {
  const secret = getSessionSecret();
  if (!secret) throw new Error("Auth session secret is not configured");

  const expiresAt = Math.floor(Date.now() / 1000) + AUTH_SESSION_TTL_SECONDS;
  const nonce = toBase64Url(crypto.getRandomValues(new Uint8Array(18)));
  const payload = `${SESSION_VERSION}.${expiresAt}.${nonce}`;
  const signature = await sign(payload, secret);

  return {
    token: `${payload}.${signature}`,
    expiresAt,
  };
}

export async function verifyAuthSessionToken(token?: string): Promise<boolean> {
  if (!token) return false;

  const secret = getSessionSecret();
  if (!secret) return false;

  const parts = token.split(".");
  if (parts.length !== 4 || parts[0] !== SESSION_VERSION) return false;

  const expiresAt = Number(parts[1]);
  if (!Number.isInteger(expiresAt) || expiresAt <= Math.floor(Date.now() / 1000)) {
    return false;
  }

  const payload = parts.slice(0, 3).join(".");
  const expectedSignature = await sign(payload, secret);
  return secureCompare(parts[3], expectedSignature);
}

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { invalidateExternalSyncCaches } from "@/lib/api";

export type UpstreamProject = "ainotes" | "productlab" | "aibounty";

function readRuntimeEnv(key: string): string {
    const fromProcess = process.env[key];
    if (typeof fromProcess === "string" && fromProcess.length > 0) {
        return fromProcess;
    }
    try {
        const env = getCloudflareContext()?.env as Record<string, unknown> | undefined;
        const value = env?.[key];
        return typeof value === "string" ? value : "";
    } catch {
        return "";
    }
}

const PROJECT_LABELS: Record<UpstreamProject, string> = {
    ainotes: "AI Notes",
    productlab: "Product Lab",
    aibounty: "AIBounty",
};

function projectConfig(project: UpstreamProject): {
    label: string;
    baseUrl: string;
    password: string;
    statePath: string;
} {
    switch (project) {
        case "ainotes":
            return {
                label: PROJECT_LABELS.ainotes,
                baseUrl: readRuntimeEnv("AI_NOTES_SYNC_URL") || "https://pxiaoer-ai-notes.openbot.workers.dev",
                password: readRuntimeEnv("AI_NOTES_SYNC_PASSWORD"),
                statePath: "/api/state",
            };
        case "productlab":
            return {
                label: PROJECT_LABELS.productlab,
                baseUrl: readRuntimeEnv("PRODUCT_LAB_SYNC_URL") || "https://pxiaoer-product-lab.openbot.workers.dev",
                password: readRuntimeEnv("PRODUCT_LAB_SYNC_PASSWORD"),
                statePath: "/api/state",
            };
        case "aibounty":
            return {
                label: PROJECT_LABELS.aibounty,
                baseUrl: readRuntimeEnv("AIBOUNTY_SYNC_URL") || "https://aibounty-plan.openbot.workers.dev",
                password: readRuntimeEnv("AIBOUNTY_SYNC_PASSWORD"),
                statePath: "/api/state",
            };
    }
}

const sessionCookies = new Map<UpstreamProject, string>();

async function loginUpstream(project: UpstreamProject): Promise<string> {
    const config = projectConfig(project);
    if (!config.password) {
        throw new Error(`${config.label} 未配置同步密码（检查 *_SYNC_PASSWORD 环境变量）`);
    }
    const response = await fetch(`${config.baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password: config.password }),
        cache: "no-store",
    });
    if (!response.ok) {
        throw new Error(`${config.label} 登录失败 HTTP ${response.status}（连续失败会触发 15 分钟限流，请确认密码正确）`);
    }
    const cookie = String(response.headers.get("set-cookie") || "").split(";")[0];
    if (!cookie) {
        throw new Error(`${config.label} 登录响应缺少会话 Cookie`);
    }
    sessionCookies.set(project, cookie);
    return cookie;
}

async function requestUpstream(
    project: UpstreamProject,
    method: string,
    path: string,
    body?: unknown,
    allowRetry = true,
): Promise<unknown> {
    const config = projectConfig(project);
    const cookie = sessionCookies.get(project) || (await loginUpstream(project));
    const response = await fetch(`${config.baseUrl}${path}`, {
        method,
        headers: {
            cookie,
            ...(body !== undefined ? { "content-type": "application/json" } : {}),
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
        cache: "no-store",
    });

    if (response.status === 401 && allowRetry) {
        sessionCookies.delete(project);
        return requestUpstream(project, method, path, body, false);
    }

    const payload = (await response.json().catch(() => null)) as
        | ({ error?: string } & Record<string, unknown>)
        | null;
    if (!response.ok) {
        throw new Error(`${config.label} ${method} ${path} 失败 HTTP ${response.status}：${payload?.error || "未知错误"}`);
    }
    if (payload && typeof payload === "object" && typeof payload.error === "string") {
        throw new Error(`${config.label}：${payload.error}`);
    }
    return payload;
}

function isWriteMethod(method: string): boolean {
    return method !== "GET" && method !== "HEAD";
}

export async function callUpstream(
    project: UpstreamProject,
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
    path: string,
    body?: unknown,
): Promise<unknown> {
    const result = await requestUpstream(project, method, path, body);
    if (isWriteMethod(method)) {
        invalidateExternalSyncCaches();
    }
    return result;
}

export async function getUpstreamState(project: UpstreamProject): Promise<Record<string, unknown>> {
    const config = projectConfig(project);
    const payload = await callUpstream(project, "GET", config.statePath);
    if (!payload || typeof payload !== "object") {
        throw new Error(`${config.label} 状态返回为空`);
    }
    return payload as Record<string, unknown>;
}

function pickDefined<T extends Record<string, unknown>>(input: T, keys: string[]): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    for (const key of keys) {
        if (input[key] !== undefined) out[key] = input[key];
    }
    return out;
}

export function findEntity(
    state: Record<string, unknown>,
    collectionKey: string,
    id: string,
    projectLabel: string,
): Record<string, unknown> {
    const collection = state[collectionKey];
    const list = Array.isArray(collection) ? collection : [];
    const found = list.find(
        (item) => item && typeof item === "object" && String((item as Record<string, unknown>).id) === id,
    );
    if (!found) {
        throw new Error(`${projectLabel} 找不到 id=${id} 的 ${collectionKey} 记录`);
    }
    return found as Record<string, unknown>;
}

export function mergeForReplace(
    existing: Record<string, unknown>,
    patch: Record<string, unknown>,
    keys: string[],
): Record<string, unknown> {
    const merged = pickDefined(existing, keys);
    for (const key of keys) {
        if (patch[key] !== undefined) merged[key] = patch[key];
    }
    return merged;
}

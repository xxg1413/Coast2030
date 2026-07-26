"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bot,
  Check,
  Clipboard,
  KeyRound,
  Link2,
  Loader2,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";
import type { OperatorAccessToken } from "@/lib/operator-auth";
import type { OperatorActionRequest } from "@/lib/operator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function formatTime(value: string): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

async function copyText(value: string): Promise<void> {
  await navigator.clipboard.writeText(value);
}

export function OperatorConnectPanel({
  initialTokens,
  initialActions,
}: {
  initialTokens: OperatorAccessToken[];
  initialActions: OperatorActionRequest[];
}) {
  const [endpoint, setEndpoint] = useState("/mcp");
  const [tokens, setTokens] = useState(initialTokens);
  const [actions, setActions] = useState(initialActions);
  const [newToken, setNewToken] = useState("");
  const [busy, setBusy] = useState("");
  const [copied, setCopied] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setEndpoint(`${window.location.origin}/mcp`);
  }, []);

  const connectCommand = useMemo(() => {
    if (!newToken) return "";
    return [
      `export COAST_OPERATOR_TOKEN='${newToken}'`,
      `codex mcp add coast-operator --url ${endpoint} --bearer-token-env-var COAST_OPERATOR_TOKEN`,
    ].join("\n");
  }, [endpoint, newToken]);

  const copy = async (key: string, value: string) => {
    await copyText(value);
    setCopied(key);
    window.setTimeout(() => setCopied(""), 1600);
  };

  const createToken = async () => {
    setBusy("create-token");
    setError("");
    try {
      const response = await fetch("/api/operator/tokens", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ label: "Codex" }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Token 创建失败");
      setNewToken(payload.token);
      setTokens((current) => [payload.record, ...current]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Token 创建失败");
    } finally {
      setBusy("");
    }
  };

  const revokeToken = async (id: string) => {
    setBusy(`token:${id}`);
    setError("");
    try {
      const response = await fetch("/api/operator/tokens/revoke", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Token 撤销失败");
      setTokens((current) =>
        current.map((token) =>
          token.id === id ? { ...token, revokedAt: new Date().toISOString() } : token,
        ),
      );
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Token 撤销失败");
    } finally {
      setBusy("");
    }
  };

  const decideAction = async (id: string, decision: "approve" | "reject") => {
    setBusy(`action:${id}`);
    setError("");
    try {
      const response = await fetch("/api/operator/actions/decision", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id, decision }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "审批失败");
      setActions((current) =>
        current.map((action) => (action.id === id ? payload.request : action)),
      );
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "审批失败");
    } finally {
      setBusy("");
    }
  };

  return (
    <div className="grid min-w-0 gap-4">
      <Card className="min-w-0 overflow-hidden py-0">
        <CardHeader className="border-b border-stone-200 px-5 py-5 md:px-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800">
                <Bot className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className="text-xl">Codex 连接</CardTitle>
                  <Badge className="bg-emerald-700">Operator 0.3</Badge>
                </div>
                <p className="mt-1 max-w-3xl text-sm leading-6 text-stone-600">
                  模型运行在 Codex，Coast 通过 MCP 提供实时数据、受控工具、人工审批和完整审计。
                </p>
              </div>
            </div>
            <Button type="button" onClick={createToken} disabled={busy === "create-token"}>
              {busy === "create-token" ? (
                <Loader2 className="animate-spin" aria-hidden="true" />
              ) : (
                <KeyRound aria-hidden="true" />
              )}
              创建连接 Token
            </Button>
          </div>
        </CardHeader>

        <CardContent className="min-w-0 space-y-5 px-5 py-5 md:px-6">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                Streamable HTTP MCP
              </p>
              <code className="mt-2 block overflow-x-auto rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-800">
                {endpoint}
              </code>
            </div>
            <Button type="button" variant="outline" onClick={() => copy("endpoint", endpoint)}>
              {copied === "endpoint" ? <Check aria-hidden="true" /> : <Link2 aria-hidden="true" />}
              {copied === "endpoint" ? "已复制" : "复制链接"}
            </Button>
          </div>

          {newToken ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-start gap-2 text-sm text-amber-950">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <p>Token 只显示这一次。复制下面两行到终端，然后重启 Codex。</p>
              </div>
              <pre className="mt-3 max-w-full overflow-x-auto rounded-lg bg-stone-950 p-3 text-xs leading-6 text-stone-100">
                {connectCommand}
              </pre>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button type="button" size="sm" onClick={() => copy("command", connectCommand)}>
                  {copied === "command" ? <Check aria-hidden="true" /> : <Clipboard aria-hidden="true" />}
                  {copied === "command" ? "命令已复制" : "复制连接命令"}
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={() => copy("token", newToken)}>
                  {copied === "token" ? <Check aria-hidden="true" /> : <KeyRound aria-hidden="true" />}
                  {copied === "token" ? "Token 已复制" : "仅复制 Token"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm leading-6 text-stone-600">
              先创建一个连接 Token。Codex 连接后可直接读取经营数据、管理日/周/月任务，并把模型计划提交到
              2026 工作台等待审批。
            </div>
          )}

          <div>
            <h3 className="font-semibold text-stone-950">建议给 Codex 的第一条指令</h3>
            <div className="mt-2 flex items-start gap-3 rounded-xl border border-stone-200 px-4 py-3">
              <p className="min-w-0 flex-1 text-sm leading-6 text-stone-700">
                使用 Coast Operator 读取今天的 2026 工作台和三条业务线进度，去掉已有行动后，生成最多
                3 条最小可验证任务，并提交今日计划等待我审批。
              </p>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() =>
                  copy(
                    "prompt",
                    "使用 Coast Operator 读取今天的 2026 工作台和三条业务线进度，去掉已有行动后，生成最多 3 条最小可验证任务，并提交今日计划等待我审批。",
                  )
                }
              >
                {copied === "prompt" ? <Check aria-hidden="true" /> : <Clipboard aria-hidden="true" />}
                {copied === "prompt" ? "已复制" : "复制"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid min-w-0 gap-4 xl:grid-cols-2">
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>权限边界</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm">
            <div>
              <p className="font-semibold text-emerald-800">可直接执行</p>
              <p className="mt-1 leading-6 text-stone-600">
                读取总览与工作台；创建、修改、完成日任务；创建周焦点和月关键点。
              </p>
            </div>
            <div>
              <p className="font-semibold text-amber-800">必须人工审批</p>
              <p className="mt-1 leading-6 text-stone-600">
                模型日计划；内容发布；漏洞报告提交；部署；收入和资产修改。
              </p>
            </div>
            <div>
              <p className="font-semibold text-stone-800">当前不开放</p>
              <p className="mt-1 leading-6 text-stone-600">
                删除记录、自动付款、绕过审批、把审批状态当作执行结果。
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>连接 Token</CardTitle>
          </CardHeader>
          <CardContent>
            {tokens.length ? (
              <div className="divide-y divide-stone-200">
                {tokens.map((token) => {
                  const active = !token.revokedAt && (!token.expiresAt || token.expiresAt > new Date().toISOString());
                  return (
                    <div key={token.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <strong className="text-sm text-stone-900">{token.label}</strong>
                          <Badge variant={active ? "outline" : "secondary"}>
                            {active ? "有效" : "已失效"}
                          </Badge>
                        </div>
                        <p className="mt-1 truncate font-mono text-xs text-stone-500">
                          {token.tokenPrefix}… · 最近使用 {formatTime(token.lastUsedAt)}
                        </p>
                      </div>
                      {active ? (
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="ghost"
                          aria-label={`撤销 ${token.label} Token`}
                          disabled={busy === `token:${token.id}`}
                          onClick={() => revokeToken(token.id)}
                        >
                          {busy === `token:${token.id}` ? (
                            <Loader2 className="animate-spin" aria-hidden="true" />
                          ) : (
                            <Trash2 aria-hidden="true" />
                          )}
                        </Button>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-stone-500">还没有连接 Token。</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="min-w-0">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle>高风险动作审批</CardTitle>
            <Badge variant="outline">{actions.filter((action) => action.status === "pending").length} 待处理</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {actions.length ? (
            <div className="divide-y divide-stone-200">
              {actions.map((action) => (
                <article
                  key={action.id}
                  className="grid gap-3 py-4 first:pt-0 last:pb-0 lg:grid-cols-[minmax(0,1fr)_auto]"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={action.riskLevel === "critical" ? "destructive" : "outline"}>
                        {action.riskLevel}
                      </Badge>
                      <span className="text-xs font-semibold text-stone-500">{action.actionType}</span>
                      <span className="text-xs text-stone-400">{formatTime(action.createdAt)}</span>
                    </div>
                    <h3 className="mt-2 font-semibold text-stone-950">{action.summary}</h3>
                    <p className="mt-1 text-sm text-stone-600">目标：{action.target}</p>
                    {action.status !== "pending" ? (
                      <p className="mt-2 text-xs font-semibold text-stone-500">
                        状态：{action.status}。批准只代表授权，仍需 Operator 后续回写真实执行证据。
                      </p>
                    ) : null}
                  </div>
                  {action.status === "pending" ? (
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        disabled={busy === `action:${action.id}`}
                        onClick={() => decideAction(action.id, "approve")}
                      >
                        <Check aria-hidden="true" />
                        批准
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={busy === `action:${action.id}`}
                        onClick={() => decideAction(action.id, "reject")}
                      >
                        <X aria-hidden="true" />
                        拒绝
                      </Button>
                    </div>
                  ) : (
                    <Badge variant="secondary">{action.status}</Badge>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <p className="text-sm leading-6 text-stone-500">
              暂无审批请求。Codex 对外发布、提交、部署、收入或资产修改时，只能先在这里排队。
            </p>
          )}
        </CardContent>
      </Card>

      {error ? (
        <p className="text-sm font-medium text-red-700" role="alert" aria-live="polite">
          {error}
        </p>
      ) : null}
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  Bot,
  Check,
  CheckCircle2,
  Clock3,
  Loader2,
  ShieldCheck,
  X,
} from "lucide-react";
import type {
  AgentAdvisorOverview,
  AgentAdvisorWorkItem,
} from "@/lib/agent";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const GOAL_LABELS = {
  Hunter: "Hunter",
  SaaS: "SaaS",
  Media: "Media",
} as const;

const STATE_LABELS = {
  proposed: "待审批",
  approved: "已加入今日任务",
  completed: "今日任务已完成",
  verified: "已验证",
  cancelled: "已忽略",
} as const;

function formatRunTime(value: string): string {
  if (!value) return "";
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

function WorkItemActions({
  item,
  busy,
  onDecision,
}: {
  item: AgentAdvisorWorkItem;
  busy: boolean;
  onDecision: (id: string, decision: "approve" | "reject") => void;
}) {
  if (item.state === "proposed") {
    return (
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          disabled={busy}
          onClick={() => onDecision(item.id, "approve")}
        >
          {busy ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Check aria-hidden="true" />}
          加入今日任务
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={busy}
          onClick={() => onDecision(item.id, "reject")}
        >
          <X aria-hidden="true" />
          忽略
        </Button>
      </div>
    );
  }

  return (
    <div className="inline-flex min-h-8 items-center gap-2 text-sm font-semibold text-stone-600">
      {item.state === "completed" || item.state === "verified" ? (
        <CheckCircle2 className="h-4 w-4 text-emerald-700" aria-hidden="true" />
      ) : item.state === "approved" ? (
        <Clock3 className="h-4 w-4 text-amber-700" aria-hidden="true" />
      ) : (
        <X className="h-4 w-4 text-stone-400" aria-hidden="true" />
      )}
      {STATE_LABELS[item.state]}
    </div>
  );
}

export function AgentControlPanel({ overview }: { overview: AgentAdvisorOverview }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const pendingCount = overview.items.filter((item) => item.state === "proposed").length;
  const approvedCount = overview.items.filter((item) => item.state === "approved").length;
  const completedCount = overview.items.filter((item) =>
    ["completed", "verified"].includes(item.state),
  ).length;

  const decide = async (id: string, decision: "approve" | "reject") => {
    setBusyId(id);
    setError("");
    try {
      const response = await fetch("/api/agent/work-items/decision", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id, decision }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Agent 审批失败");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Agent 审批失败");
    } finally {
      setBusyId("");
    }
  };

  return (
    <Card className="agent-control-panel overflow-hidden py-0">
      <CardHeader className="border-b border-stone-200 px-5 py-4 md:px-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800">
              <Bot className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="text-xl">Coast Operator</CardTitle>
                <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-800">
                  0.3 · {overview.run?.source === "operator" ? "Codex 驱动" : "MCP Operator"}
                </Badge>
              </div>
              <p className="mt-1 text-sm leading-6 text-stone-600">
                Codex 通过 MCP 读取实时经营数据、生成计划并管理内部任务；高风险动作继续由你审批。
              </p>
            </div>
          </div>

          {overview.run ? (
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <strong className="block text-lg text-stone-950">{pendingCount}</strong>
                <span className="text-xs text-stone-500">待审批</span>
              </div>
              <div>
                <strong className="block text-lg text-stone-950">{approvedCount}</strong>
                <span className="text-xs text-stone-500">执行中</span>
              </div>
              <div>
                <strong className="block text-lg text-stone-950">{completedCount}</strong>
                <span className="text-xs text-stone-500">已完成</span>
              </div>
            </div>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="space-y-4 px-5 py-5 md:px-6">
        {!overview.run ? (
          <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="font-semibold text-stone-950">今天还没有 Codex 计划</p>
              <p className="mt-1 max-w-3xl text-sm leading-6 text-stone-600">
                连接 Coast Operator 后，让 Codex 读取当前工作台、判断缺口并提交最多三条可验证行动。
              </p>
            </div>
            <Button asChild>
              <Link href="/operator">
                连接 Codex
                <ArrowUpRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <p className="font-medium text-stone-700">{overview.run.summary}</p>
              <p className="text-stone-500">生成于 {formatRunTime(overview.run.createdAt)}</p>
            </div>

            {overview.items.length ? (
              <div className="divide-y divide-stone-200 border-y border-stone-200">
                {overview.items.map((item) => (
                  <article
                    key={item.id}
                    className="grid gap-4 py-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={item.priority === "P0" ? "default" : "secondary"}>
                          {item.priority}
                        </Badge>
                        <Badge variant="outline">{GOAL_LABELS[item.goalArea]}</Badge>
                        <span className="text-xs font-medium text-stone-500">{item.project}</span>
                      </div>
                      <h3 className="mt-2 text-base font-bold leading-6 text-stone-950">{item.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-stone-600">{item.rationale}</p>
                      <dl className="mt-3 grid gap-2 text-sm md:grid-cols-2">
                        <div>
                          <dt className="font-semibold text-stone-800">完成定义</dt>
                          <dd className="mt-1 leading-6 text-stone-600">{item.definitionOfDone}</dd>
                        </div>
                        <div>
                          <dt className="font-semibold text-stone-800">所需证据</dt>
                          <dd className="mt-1 leading-6 text-stone-600">{item.evidenceRequired}</dd>
                        </div>
                      </dl>
                    </div>
                    <WorkItemActions item={item} busy={busyId === item.id} onDecision={decide} />
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                三条主线今天都已有行动，Agent 没有重复创建建议。
              </div>
            )}
          </>
        )}

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-stone-200 pt-4 text-xs text-stone-500">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-700" aria-hidden="true" />
            模型计划审批后才写入 Coast 今日任务
          </span>
          <span>外部发布、提交、部署、收入和资产修改必须单独排队审批</span>
        </div>

        {error ? (
          <p className="text-sm font-medium text-red-700" role="alert" aria-live="polite">
            {error}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

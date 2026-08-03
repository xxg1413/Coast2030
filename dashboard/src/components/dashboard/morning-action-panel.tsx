/* Hallmark · component: morning action panel · genre: modern-minimal · theme: Coast existing
 * states: default · hover · focus · active · disabled · loading · error · success
 * contrast: inherited from Coast OKLCH tokens
 * Hallmark · pre-emit critique: P5 H5 E4 S5 R5 V4
 */
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Check, Loader2, Plus, Sunrise, Timer } from "lucide-react";
import type { MorningLog, MorningLogItem, PomodoroEntry } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { PomodoroTimer } from "@/components/dashboard/pomodoro-timer";

const CORE_DEFINITIONS = [
  {
    key: "aibounty",
    goal: "AIBounty",
    actionPlaceholder: "复现租户越权并保存请求/响应",
    resultPlaceholder: "已保存 HAR / 未复现：原因…",
  },
  {
    key: "saas",
    goal: "SaaS",
    actionPlaceholder: "完成一次可验证的获客、交付或产品推进",
    resultPlaceholder: "已完成：证据链接 / 未完成：阻塞原因",
  },
  {
    key: "ai_notes",
    goal: "AI Notes",
    actionPlaceholder: "完成选题、制作或发布中的一个可验证动作",
    resultPlaceholder: "已发布 / 已存草稿 / 未做：原因",
  },
] as const;

const HABIT_DEFINITIONS = [
  { key: "wake_early", label: "早起" },
  { key: "run", label: "跑步" },
  { key: "daily_input", label: "每日输入" },
  { key: "daily_review", label: "每日复盘" },
] as const;

const LEGACY_CORE_LABELS = new Set(["AIBounty", "SaaS", "AINotes", "AI Notes"]);

function updateItem(items: MorningLogItem[], key: string, patch: Partial<MorningLogItem>) {
  return items.map((item) => (item.key === key ? { ...item, ...patch } : item));
}

function normalizeInitialItems(items: MorningLogItem[]) {
  return items.map((item) => {
    const isCore = CORE_DEFINITIONS.some((definition) => definition.key === item.key);
    if (isCore && LEGACY_CORE_LABELS.has(item.label.trim())) {
      return { ...item, label: "", result: item.result || "" };
    }
    return { ...item, result: item.result || "" };
  });
}

export function MorningActionPanel({ log }: { log: MorningLog }) {
  const router = useRouter();
  const [items, setItems] = useState(() => normalizeInitialItems(log.items));
  const [customItems, setCustomItems] = useState(() =>
    log.customItems.map((item) => ({ ...item, result: item.result || "" })),
  );
  const [pomodoros, setPomodoros] = useState<PomodoroEntry[]>(log.pomodoros);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);
  const [activePomodoroKey, setActivePomodoroKey] = useState<string | null>(null);
  const [lockedPomodoroKey, setLockedPomodoroKey] = useState<string | null>(null);
  const [draftCustomKey, setDraftCustomKey] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastQueuedPayloadRef = useRef(
    JSON.stringify({
      items: normalizeInitialItems(log.items),
      customItems: log.customItems.map((item) => ({ ...item, result: item.result || "" })),
    }),
  );

  const coreItems = useMemo(
    () => CORE_DEFINITIONS.map((definition) => ({
      ...definition,
      item: items.find((item) => item.key === definition.key) || {
        key: definition.key,
        label: "",
        result: "",
        completed: false,
      },
    })),
    [items],
  );

  const habitItems = useMemo(
    () => HABIT_DEFINITIONS.map((definition) => ({
      ...definition,
      item: items.find((item) => item.key === definition.key) || {
        key: definition.key,
        label: definition.label,
        result: "",
        completed: false,
      },
    })),
    [items],
  );

  const visibleCustomItems = useMemo(
    () => customItems.filter((item) => item.label.trim() || item.result.trim() || item.key === draftCustomKey),
    [customItems, draftCustomKey],
  );

  const coreCompleted = coreItems.filter(({ item }) => item.completed && item.label.trim()).length;
  const coreWithResult = coreItems.filter(({ item }) => item.label.trim() && item.result.trim()).length;
  const habitCompleted = habitItems.filter(({ item }) => item.completed && item.label.trim()).length;
  const pomodoroMinutes = useMemo(
    () => Math.round(pomodoros.reduce((sum, entry) => sum + entry.duration, 0) / 60),
    [pomodoros],
  );

  // 主 CTA「下一项」只从核心 → 补充行动取，永不落到习惯。
  const focusTarget = useMemo(() => {
    const pendingCore = coreItems.find(({ item }) => item.label.trim() && !item.completed);
    if (pendingCore) return { key: pendingCore.item.key, label: pendingCore.item.label };
    const pendingCustom = customItems.find((item) => item.label.trim() && !item.completed);
    if (pendingCustom) return { key: pendingCustom.key, label: pendingCustom.label };
    const completedCore = coreItems.find(({ item }) => item.label.trim());
    if (completedCore) return { key: completedCore.item.key, label: completedCore.item.label };
    const completedCustom = customItems.find((item) => item.label.trim());
    return completedCustom ? { key: completedCustom.key, label: completedCustom.label } : null;
  }, [coreItems, customItems]);

  const activeFocusItem = useMemo(() => {
    if (!activePomodoroKey) return null;
    const item = [...items, ...customItems].find((entry) => entry.key === activePomodoroKey);
    return item?.label.trim() ? item : null;
  }, [activePomodoroKey, customItems, items]);

  const recordPomodoro = useCallback(
    async (key: string, label: string) => {
      const optimistic: PomodoroEntry = {
        key,
        label,
        duration: 30 * 60,
        completedAt: new Date().toISOString(),
      };
      setPomodoros((current) => [...current, optimistic]);
      try {
        const response = await fetch("/api/morning-log/pomodoro/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date: log.date, key, label }),
        });
        if (!response.ok) throw new Error(`Pomodoro add failed: ${response.status}`);
      } catch {
        setPomodoros((current) => current.filter((entry) => entry !== optimistic));
        setError(true);
        window.setTimeout(() => setError(false), 3000);
      }
    },
    [log.date],
  );

  const completeFocusItem = useCallback((key: string) => {
    if (items.some((item) => item.key === key)) {
      setItems((current) => updateItem(current, key, { completed: true }));
      return;
    }
    setCustomItems((current) => updateItem(current, key, { completed: true }));
  }, [items]);

  const save = useCallback(async () => {
    setSaving(true);
    setError(false);
    try {
      const response = await fetch("/api/morning-log/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: log.date, items, customItems }),
      });
      if (!response.ok) throw new Error(`Save failed: ${response.status}`);
      router.refresh();
    } catch {
      setError(true);
      window.setTimeout(() => setError(false), 3000);
    } finally {
      setSaving(false);
    }
  }, [customItems, items, log.date, router]);

  useEffect(() => {
    const nextPayload = JSON.stringify({ items, customItems });
    if (nextPayload === lastQueuedPayloadRef.current) return;
    lastQueuedPayloadRef.current = nextPayload;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void save();
    }, 800);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [items, customItems, save]);

  const addCustomItem = () => {
    const empty = customItems.find((item) => !item.label.trim() && !item.result.trim());
    if (empty) setDraftCustomKey(empty.key);
  };

  const toggleFocusPanel = () => {
    if (lockedPomodoroKey) return;
    setActivePomodoroKey((current) => (current ? null : focusTarget?.key || null));
  };

  const selectFocusItem = (key: string) => {
    if (lockedPomodoroKey) return;
    setActivePomodoroKey((current) => (current === key ? null : key));
  };

  const hasUnusedCustomSlot = customItems.some((item) => !item.label.trim() && !item.result.trim());

  return (
    <Card className="glass-panel py-0">
      <CardHeader className="pb-3 pt-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <CardTitle className="flex min-w-0 items-center gap-2 text-xl font-bold">
              <Sunrise className="h-5 w-5 shrink-0 text-amber-600" />
              晨间作战
            </CardTitle>
            <p className="mt-1 text-sm text-stone-500">
              {log.date} · 先写下今天可验证的动作，收工前补结果
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap items-center gap-3 rounded-lg border border-stone-200 bg-stone-50/70 px-3 py-2 text-xs text-stone-600 tabular-nums">
              <span><strong className="text-stone-900">{coreCompleted}/3</strong> 核心推进</span>
              <span><strong className="text-stone-900">{coreWithResult}/3</strong> 已记结果</span>
              <span><strong className="text-stone-900">{habitCompleted}/4</strong> 基础习惯</span>
              <span><strong className="text-stone-900">{pomodoroMinutes}</strong> 分钟专注</span>
            </div>
            <Button
              type="button"
              className="h-11 whitespace-nowrap bg-stone-900 px-4 text-stone-50 hover:bg-stone-800 active:translate-y-px"
              onClick={toggleFocusPanel}
              disabled={!focusTarget || Boolean(lockedPomodoroKey)}
              aria-expanded={Boolean(activePomodoroKey)}
              aria-controls="morning-focus-panel"
              title={!focusTarget ? "先填写一条核心推进" : undefined}
            >
              <Timer className="h-4 w-4" />
              {activePomodoroKey ? "收起专注" : "开始专注"}
            </Button>
          </div>
        </div>

        <div className="flex min-h-5 items-center justify-between gap-3 text-xs text-stone-500" aria-live="polite">
          <span>{focusTarget ? `下一项：${focusTarget.label}` : "先填写一条核心推进，再开始专注。"}</span>
          <span className="inline-flex shrink-0 items-center gap-1.5">
            {saving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                保存中
              </>
            ) : error ? (
              <>
                <AlertCircle className="h-3.5 w-3.5 text-red-600" />
                <span className="text-red-700">保存失败，将在下次编辑时重试</span>
              </>
            ) : (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                自动保存
              </>
            )}
          </span>
        </div>
      </CardHeader>

      <CardContent className="pb-5">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.6fr)]">
          <section aria-labelledby="core-progress-heading" className="min-w-0">
            <div className="mb-2">
              <h3 id="core-progress-heading" className="font-semibold text-stone-900">今日核心推进</h3>
              <p className="mt-0.5 text-sm text-stone-500">每条写成今天可以验证的最小动作；收工前补实际结果。</p>
            </div>

            <div className="divide-y divide-stone-200 border-y border-stone-200">
              {coreItems.map(({ item, goal, actionPlaceholder, resultPlaceholder }) => {
                const actionId = `morning-core-action-${item.key}`;
                const resultId = `morning-core-result-${item.key}`;
                return (
                  <div key={item.key} className="grid min-w-0 gap-2 py-3 sm:grid-cols-[7rem_minmax(0,1fr)] sm:items-start">
                    <label htmlFor={actionId} className="flex min-h-11 items-center gap-3 font-semibold text-stone-800">
                      <Checkbox
                        checked={item.completed}
                        disabled={!item.label.trim()}
                        onCheckedChange={(checked) => setItems((current) => updateItem(current, item.key, { completed: Boolean(checked) }))}
                        aria-label={`${goal} 完成状态`}
                        className="data-[state=checked]:border-emerald-600 data-[state=checked]:bg-emerald-600"
                      />
                      <span>{goal}</span>
                    </label>
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <label htmlFor={actionId} className="text-xs font-medium text-stone-500">动作</label>
                        <Input
                          id={actionId}
                          value={item.label}
                          placeholder={actionPlaceholder}
                          onChange={(event) => setItems((current) => updateItem(current, item.key, {
                            label: event.target.value,
                            completed: event.target.value.trim() ? item.completed : false,
                          }))}
                          className="h-11 border-stone-200 bg-stone-50/70 px-3 text-sm shadow-none hover:bg-stone-100/70 focus-visible:bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label htmlFor={resultId} className="text-xs font-medium text-stone-500">结果</label>
                        <Input
                          id={resultId}
                          value={item.result}
                          placeholder={resultPlaceholder}
                          onChange={(event) => setItems((current) => updateItem(current, item.key, {
                            result: event.target.value,
                          }))}
                          className="h-11 border-stone-200 bg-white px-3 text-sm shadow-none hover:bg-stone-50 focus-visible:bg-white"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-3 space-y-3">
              {visibleCustomItems.map((item) => {
                const actionId = `morning-custom-action-${item.key}`;
                const resultId = `morning-custom-result-${item.key}`;
                return (
                  <div key={item.key} className="grid min-w-0 gap-2 sm:grid-cols-[7rem_minmax(0,1fr)] sm:items-start">
                    <label htmlFor={actionId} className="flex min-h-11 items-center gap-3 text-sm font-medium text-stone-600">
                      <Checkbox
                        checked={item.completed}
                        disabled={!item.label.trim()}
                        onCheckedChange={(checked) => setCustomItems((current) => updateItem(current, item.key, { completed: Boolean(checked) }))}
                        aria-label="补充行动完成状态"
                        className="data-[state=checked]:border-cyan-600 data-[state=checked]:bg-cyan-600"
                      />
                      <span>补充行动</span>
                    </label>
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <label htmlFor={actionId} className="text-xs font-medium text-stone-500">动作</label>
                        <Input
                          id={actionId}
                          value={item.label}
                          placeholder="一次性可验证行动"
                          onBlur={() => {
                            if (!item.label.trim() && !item.result.trim()) setDraftCustomKey(null);
                          }}
                          onChange={(event) => setCustomItems((current) => updateItem(current, item.key, {
                            label: event.target.value,
                            completed: event.target.value.trim() ? item.completed : false,
                          }))}
                          className="h-11 border-stone-200 bg-white px-3 text-sm shadow-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label htmlFor={resultId} className="text-xs font-medium text-stone-500">结果</label>
                        <Input
                          id={resultId}
                          value={item.result}
                          placeholder="实际结果或未完成原因"
                          onBlur={() => {
                            if (!item.label.trim() && !item.result.trim()) setDraftCustomKey(null);
                          }}
                          onChange={(event) => setCustomItems((current) => updateItem(current, item.key, {
                            result: event.target.value,
                          }))}
                          className="h-11 border-stone-200 bg-white px-3 text-sm shadow-none"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}

              {hasUnusedCustomSlot && !draftCustomKey && (
                <Button type="button" variant="ghost" className="h-11 whitespace-nowrap px-2 text-stone-600" onClick={addCustomItem}>
                  <Plus className="h-4 w-4" />
                  添加今日行动
                </Button>
              )}
            </div>
          </section>

          <section aria-labelledby="habit-heading" className="min-w-0 border-stone-200 lg:border-l lg:pl-6">
            <div className="mb-2">
              <h3 id="habit-heading" className="font-semibold text-stone-900">基础习惯</h3>
              <p className="mt-0.5 text-sm text-stone-500">支撑状态；不占用主线专注入口。</p>
            </div>
            <div className="grid gap-x-4 sm:grid-cols-2 lg:grid-cols-1">
              {habitItems.map(({ item, label }) => {
                const inputId = `morning-habit-${item.key}`;
                return (
                  <div
                    key={item.key}
                    className="grid min-h-14 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 border-b border-stone-200 py-2"
                  >
                    <Checkbox
                      checked={item.completed}
                      disabled={!item.label.trim()}
                      onCheckedChange={(checked) => setItems((current) => updateItem(current, item.key, { completed: Boolean(checked) }))}
                      aria-label={`${item.label || label}完成状态`}
                      className="data-[state=checked]:border-emerald-600 data-[state=checked]:bg-emerald-600"
                    />
                    <Input
                      id={inputId}
                      value={item.label}
                      placeholder={label}
                      aria-label={`修改${label}`}
                      onChange={(event) => setItems((current) => updateItem(current, item.key, {
                        label: event.target.value,
                        completed: event.target.value.trim() ? item.completed : false,
                        result: "",
                      }))}
                      className={`h-10 border-transparent bg-transparent px-2 text-sm font-medium shadow-none hover:border-stone-200 hover:bg-stone-50 focus-visible:border-stone-300 focus-visible:bg-white ${
                        item.completed ? "text-stone-400 line-through" : "text-stone-700"
                      }`}
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant={activePomodoroKey === item.key ? "secondary" : "ghost"}
                      className="h-9 w-9 text-stone-600"
                      onClick={() => selectFocusItem(item.key)}
                      disabled={!item.label.trim() || Boolean(lockedPomodoroKey)}
                      aria-label={`为${item.label || label}使用番茄钟`}
                      aria-pressed={activePomodoroKey === item.key}
                      title={item.label.trim() ? `为${item.label}使用番茄钟` : "先填写习惯名称"}
                    >
                      <Timer className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {activeFocusItem && (
          <div id="morning-focus-panel" className="mt-4">
            <PomodoroTimer
              key={activeFocusItem.key}
              label={activeFocusItem.label}
              onLockChange={(locked) => setLockedPomodoroKey(locked ? activeFocusItem.key : null)}
              onClose={() => setActivePomodoroKey(null)}
              onFocusCompleted={() => void recordPomodoro(activeFocusItem.key, activeFocusItem.label)}
              onCompleted={() => completeFocusItem(activeFocusItem.key)}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

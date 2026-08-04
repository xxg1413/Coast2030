/* Hallmark · component: morning action panel · genre: modern-minimal · theme: Coast existing
 * states: default · hover · focus · active · disabled · loading · error · success
 * contrast: inherited from Coast OKLCH tokens
 * Hallmark · pre-emit critique: P5 H5 E4 S5 R5 V4
 */
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Check, Loader2, Plus, Sunrise, Timer } from "lucide-react";
import type { MorningLog, MorningLogItem } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { usePomodoroSession } from "@/components/dashboard/task-pomodoro";
import {
  DAILY_CORE_POMODORO_TARGET_2026,
  MORNING_CORE_POMODORO_TARGETS,
  getMorningCorePomodoroCountsByKey,
  isMorningCoreFocusKey,
} from "@/lib/targets";

const CORE_DEFINITIONS = [
  {
    key: "saas",
    goal: "SaaS · 5 个番茄钟",
    targetPomodoros: MORNING_CORE_POMODORO_TARGETS.saas,
    taskPlaceholder: "今天要推进的可验证任务",
    resultPlaceholder: "已完成：证据链接 / 未完成：阻塞原因",
  },
  {
    key: "ai_notes",
    goal: "AI Notes · 2 个番茄钟",
    targetPomodoros: MORNING_CORE_POMODORO_TARGETS.ai_notes,
    taskPlaceholder: "今天的选题、制作或发布任务",
    resultPlaceholder: "已发布 / 已存草稿 / 未做：原因",
  },
  {
    key: "aibounty",
    goal: "AIBounty · 1 个番茄钟",
    targetPomodoros: MORNING_CORE_POMODORO_TARGETS.aibounty,
    taskPlaceholder: "今天要复现的攻击图或排查点",
    resultPlaceholder: "已保存证据 / Blocked / 完整排除：原因…",
  },
  {
    key: "work",
    goal: "Work · 4 个番茄钟",
    targetPomodoros: MORNING_CORE_POMODORO_TARGETS.work,
    taskPlaceholder: "今天要完成的可验证工作",
    resultPlaceholder: "已完成：交付或证据 / 未完成：阻塞原因",
  },
] as const;

const HABIT_DEFINITIONS = [
  { key: "wake_early", label: "早起" },
  { key: "morning_journal", label: "晨间日志" },
  { key: "run", label: "跑步" },
  { key: "daily_input", label: "每日输入" },
  { key: "daily_output", label: "每日输出" },
  { key: "daily_acquisition", label: "每日获客" },
  { key: "daily_review", label: "晚间复盘" },
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
  const pomodoroSession = usePomodoroSession();
  const [items, setItems] = useState(() => normalizeInitialItems(log.items));
  const [customItems, setCustomItems] = useState(() =>
    log.customItems.map((item) => ({ ...item, result: item.result || "" })),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);
  const [draftCustomKey, setDraftCustomKey] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastQueuedPayloadRef = useRef(
    JSON.stringify({
      items: normalizeInitialItems(log.items),
      customItems: log.customItems.map((item) => ({ ...item, result: item.result || "" })),
    }),
  );

  const pomodoros = pomodoroSession?.pomodoros ?? log.pomodoros;
  const activePomodoroKey = pomodoroSession?.activeKey ?? null;
  const lockedPomodoro = Boolean(pomodoroSession?.locked);

  const pomodoroCountsByKey = useMemo(
    () => getMorningCorePomodoroCountsByKey(pomodoros),
    [pomodoros],
  );

  const coreItems = useMemo(
    () => CORE_DEFINITIONS.map((definition) => {
      const pomodoroCount = pomodoroCountsByKey[definition.key] || 0;
      return {
        ...definition,
        item: items.find((item) => item.key === definition.key) || {
          key: definition.key,
          label: "",
          result: "",
          completed: false,
        },
        pomodoroCount,
        focusCompleted: pomodoroCount >= definition.targetPomodoros,
        focusProgress: Math.min((pomodoroCount / definition.targetPomodoros) * 100, 100),
      };
    }),
    [items, pomodoroCountsByKey],
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

  const coreCompleted = coreItems.filter(({ item, focusCompleted }) => focusCompleted && item.label.trim()).length;
  const coreWithResult = coreItems.filter(({ item }) => item.label.trim() && item.result.trim()).length;
  const habitCompleted = habitItems.filter(({ item }) => item.completed && item.label.trim()).length;
  const classifiedPomodoroCount = coreItems.reduce((sum, entry) => sum + entry.pomodoroCount, 0);

  // 主 CTA「下一项」只从核心 → 补充行动取，永不落到习惯。
  const focusTarget = useMemo(() => {
    const pendingCore = coreItems.find(({ item, focusCompleted }) => item.label.trim() && !focusCompleted);
    if (pendingCore) return { key: pendingCore.item.key, label: pendingCore.item.label };
    const pendingCustom = customItems.find((item) => item.label.trim() && !item.completed);
    if (pendingCustom) return { key: pendingCustom.key, label: pendingCustom.label };
    const completedCore = coreItems.find(({ item }) => item.label.trim());
    if (completedCore) return { key: completedCore.item.key, label: completedCore.item.label };
    const completedCustom = customItems.find((item) => item.label.trim());
    return completedCustom ? { key: completedCustom.key, label: completedCustom.label } : null;
  }, [coreItems, customItems]);

  const completeFocusItem = useCallback((key: string) => {
    if (isMorningCoreFocusKey(key)) return;
    if (items.some((item) => item.key === key)) {
      setItems((current) => updateItem(current, key, { completed: true }));
      return;
    }
    setCustomItems((current) => updateItem(current, key, { completed: true }));
  }, [items]);

  const startPomodoroForKey = useCallback(
    (key: string, label: string) => {
      if (!pomodoroSession || !label.trim()) return;
      pomodoroSession.start(key, label, {
        onCompleted: isMorningCoreFocusKey(key) ? undefined : () => completeFocusItem(key),
      });
    },
    [completeFocusItem, pomodoroSession],
  );

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
    if (!focusTarget) return;
    if (lockedPomodoro) {
      pomodoroSession?.openDialog();
      return;
    }
    startPomodoroForKey(focusTarget.key, focusTarget.label);
  };

  const selectFocusItem = (key: string) => {
    const item = [...items, ...customItems].find((entry) => entry.key === key);
    if (!item?.label.trim()) return;
    if (lockedPomodoro) {
      if (activePomodoroKey === key) pomodoroSession?.openDialog();
      return;
    }
    startPomodoroForKey(key, item.label);
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
              {log.date} · 先写下今天的任务，番茄钟达标后再补结果
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap items-center gap-3 rounded-lg border border-stone-200 bg-stone-50/70 px-3 py-2 text-xs text-stone-600 tabular-nums">
              <span><strong className="text-stone-900">{coreCompleted}/{CORE_DEFINITIONS.length}</strong> 核心推进</span>
              <span><strong className="text-stone-900">{coreWithResult}/{CORE_DEFINITIONS.length}</strong> 已记结果</span>
              <span><strong className="text-stone-900">{habitCompleted}/{HABIT_DEFINITIONS.length}</strong> 基础习惯</span>
              <span><strong className="text-stone-900">{classifiedPomodoroCount}</strong> / {DAILY_CORE_POMODORO_TARGET_2026} 个分类番茄钟</span>
            </div>
            <Button
              type="button"
              className="h-11 whitespace-nowrap bg-stone-900 px-4 text-stone-50 hover:bg-stone-800 active:translate-y-px"
              onClick={toggleFocusPanel}
              disabled={!focusTarget && !lockedPomodoro}
              aria-expanded={Boolean(pomodoroSession?.open)}
              title={!focusTarget ? "先填写一条核心推进" : undefined}
            >
              <Timer className="h-4 w-4" />
              {lockedPomodoro || activePomodoroKey ? "打开专注" : "开始专注"}
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
              <p className="mt-0.5 text-sm text-stone-500">先写今天的任务；分类番茄累计达标后，再填写结果。</p>
            </div>

            <div className="divide-y divide-stone-200 border-y border-stone-200">
              {coreItems.map(({ item, goal, targetPomodoros, pomodoroCount, focusCompleted, focusProgress, taskPlaceholder, resultPlaceholder }) => {
                const taskId = `morning-core-task-${item.key}`;
                const resultId = `morning-core-result-${item.key}`;
                const showResult = focusCompleted || Boolean(item.result.trim());
                return (
                  <div key={item.key} className="grid min-w-0 gap-2 py-3 sm:grid-cols-[13rem_minmax(0,1fr)] sm:items-start">
                    <div className="flex min-h-11 items-center gap-2">
                      <Checkbox
                        checked={focusCompleted}
                        disabled
                        aria-label={`${goal} 番茄钟达标状态`}
                        className="data-[state=checked]:border-emerald-600 data-[state=checked]:bg-emerald-600"
                      />
                      <label htmlFor={taskId} className="min-w-0 flex-1 font-semibold text-stone-800">
                        <span className="block">{goal}</span>
                        <span className="mt-1 block text-xs font-medium tabular-nums text-stone-500">
                          {pomodoroCount} / {targetPomodoros} 个番茄钟
                        </span>
                        <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-stone-200" aria-hidden="true">
                          <span className="block h-full rounded-full bg-emerald-600 transition-[width]" style={{ width: `${focusProgress}%` }} />
                        </span>
                      </label>
                      <Button
                        type="button"
                        size="icon"
                        variant={activePomodoroKey === item.key ? "secondary" : "ghost"}
                        className="h-9 w-9 shrink-0 text-stone-600"
                        onClick={() => selectFocusItem(item.key)}
                        disabled={!item.label.trim() || (lockedPomodoro && activePomodoroKey !== item.key)}
                        aria-label={`为${goal}分类开始番茄钟`}
                        aria-pressed={activePomodoroKey === item.key}
                        title={item.label.trim() ? `计入 ${goal}` : "先填写今日任务"}
                      >
                        <Timer className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <label htmlFor={taskId} className="text-xs font-medium text-stone-500">任务</label>
                        <Input
                          id={taskId}
                          value={item.label}
                          placeholder={taskPlaceholder}
                          onChange={(event) => setItems((current) => updateItem(current, item.key, {
                            label: event.target.value,
                            completed: event.target.value.trim() ? item.completed : false,
                          }))}
                          className="h-11 border-stone-200 bg-stone-50/70 px-3 text-sm shadow-none hover:bg-stone-100/70 focus-visible:bg-white"
                        />
                      </div>
                      {showResult && (
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
                      )}
                    </div>
                  </div>
                );
              })}

            </div>

            <div className="mt-3 space-y-3">
              {visibleCustomItems.map((item) => {
                const taskId = `morning-custom-task-${item.key}`;
                const resultId = `morning-custom-result-${item.key}`;
                const showResult = item.completed || Boolean(item.result.trim());
                return (
                  <div key={item.key} className="grid min-w-0 gap-2 sm:grid-cols-[7rem_minmax(0,1fr)] sm:items-start">
                    <label htmlFor={taskId} className="flex min-h-11 items-center gap-3 text-sm font-medium text-stone-600">
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
                        <label htmlFor={taskId} className="text-xs font-medium text-stone-500">任务</label>
                        <Input
                          id={taskId}
                          value={item.label}
                          placeholder="一次性可验证任务"
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
                      {showResult && (
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
                      )}
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
                      disabled={!item.label.trim() || (lockedPomodoro && activePomodoroKey !== item.key)}
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
      </CardContent>
    </Card>
  );
}

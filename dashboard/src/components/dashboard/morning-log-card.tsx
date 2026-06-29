"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Sunrise, Timer } from "lucide-react";
import type { MorningLog, MorningLogItem, PomodoroEntry } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { PomodoroTimer } from "@/components/dashboard/pomodoro-timer";

function updateItem(items: MorningLogItem[], key: string, patch: Partial<MorningLogItem>) {
  return items.map((item) => (item.key === key ? { ...item, ...patch } : item));
}

export function MorningLogCard({ log }: { log: MorningLog }) {
  const router = useRouter();
  const [items, setItems] = useState(log.items);
  const [customItems, setCustomItems] = useState(log.customItems);
  const [pomodoros, setPomodoros] = useState<PomodoroEntry[]>(log.pomodoros);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(false);
  const [activePomodoroKey, setActivePomodoroKey] = useState<string | null>(null);
  // 当前正在进行（无法被收起）的番茄钟 key；为 null 表示没有锁定的番茄钟。
  const [lockedPomodoroKey, setLockedPomodoroKey] = useState<string | null>(null);
  const mountedRef = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const completedCount = useMemo(
    () => [...items, ...customItems.filter((item) => item.label.trim())].filter((item) => item.completed).length,
    [items, customItems],
  );
  const totalCount = useMemo(
    () => items.length + customItems.filter((item) => item.label.trim()).length,
    [items, customItems],
  );

  // 当日番茄钟汇总：完成个数 + 累计专注分钟。
  const pomodoroCount = pomodoros.length;
  const pomodoroMinutes = useMemo(
    () => Math.round(pomodoros.reduce((sum, entry) => sum + entry.duration, 0) / 60),
    [pomodoros],
  );

  /**
   * 专注完成时记录一个番茄：先乐观追加到本地状态，再通过独立接口原子持久化。
   * 番茄记录不参与防抖 save（save 不触碰 pomodoro_json），从根本上避免被覆盖。
   */
  const recordPomodoro = useCallback(
    async (key: string, label: string) => {
      // 乐观更新：UI 立即反映新增的番茄。
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
        // 持久化失败时回滚本地乐观追加。
        setPomodoros((current) => current.filter((entry) => entry !== optimistic));
      }
    },
    [log.date],
  );

  /**
   * 切换某个晨间项的番茄钟面板：若该项番茄钟正在进行（已锁定），则禁止收起。
   */
  const togglePomodoro = useCallback(
    (key: string) => {
      if (lockedPomodoroKey && lockedPomodoroKey !== key) return; // 已有其他番茄钟锁定
      setActivePomodoroKey((current) => (current === key ? null : key));
    },
    [lockedPomodoroKey],
  );

  const save = async () => {
    setSaving(true);
    setSaved(false);
    setError(false);
    try {
      const response = await fetch("/api/morning-log/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: log.date, items, customItems }),
      });
      if (!response.ok) {
        throw new Error(`Save failed: ${response.status}`);
      }
      setSaved(true);
      router.refresh();
      window.setTimeout(() => setSaved(false), 1400);
    } catch {
      setError(true);
      window.setTimeout(() => setError(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  // items / customItems 变化后自动防抖保存；番茄记录走独立追加接口，不在此处保存。
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      void save();
    }, 800);
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [items, customItems]);

  return (
    <Card className="glass-panel py-0">
      <CardHeader className="pb-3 pt-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-stone-500">晨间日志</p>
            <CardTitle className="mt-1 flex items-center gap-2 text-xl font-bold">
              <Sunrise className="h-5 w-5 text-amber-600" />
              每天先确认状态
            </CardTitle>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-stone-500">
              <span>{log.date} · {completedCount}/{totalCount || items.length} 已完成</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                <Timer className="h-3 w-3" />
                今日 {pomodoroCount} 个番茄 · {pomodoroMinutes} 分钟专注
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-stone-500">
            {saving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                保存中
              </>
            ) : error ? (
              <span className="text-red-600">保存失败</span>
            ) : saved ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                已自动保存
              </>
            ) : (
              <>
                <Check className="h-3.5 w-3.5 text-stone-300" />
                自动保存
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-5">
        <div className="grid gap-2 md:grid-cols-4">
          {items.map((item) => (
            <div key={item.key} className="contents">
              <div className="flex items-center gap-2 rounded-lg border border-stone-200 bg-stone-50/70 px-3 py-2">
                <Checkbox
                  checked={item.completed}
                  onCheckedChange={(checked) => setItems((current) => updateItem(current, item.key, { completed: Boolean(checked) }))}
                  className="data-[state=checked]:border-emerald-600 data-[state=checked]:bg-emerald-600"
                />
                <Input
                  value={item.label}
                  onChange={(event) => setItems((current) => updateItem(current, item.key, { label: event.target.value }))}
                  className="h-8 border-transparent bg-transparent px-1 text-sm font-medium shadow-none focus-visible:ring-1"
                />
                <Button
                  size="icon-sm"
                  variant={activePomodoroKey === item.key ? "default" : "ghost"}
                  className={activePomodoroKey === item.key ? "shrink-0 bg-amber-600 hover:bg-amber-600/90" : "shrink-0 text-amber-600 hover:bg-amber-50"}
                  onClick={() => togglePomodoro(item.key)}
                  aria-label="番茄钟"
                  title="番茄钟"
                >
                  <Timer className="h-4 w-4" />
                </Button>
              </div>
              {activePomodoroKey === item.key && (
                <div className="md:col-span-4">
                  <PomodoroTimer
                    key={item.key}
                    label={item.label || "晨间项"}
                    onLockChange={(locked) => setLockedPomodoroKey(locked ? item.key : null)}
                    onClose={() => setActivePomodoroKey(null)}
                    onFocusCompleted={() => void recordPomodoro(item.key, item.label)}
                    onCompleted={() => setItems((current) => updateItem(current, item.key, { completed: true }))}
                  />
                </div>
              )}
            </div>
          ))}
          {customItems.map((item, index) => (
            <div key={item.key} className="contents">
              <div className="flex items-center gap-2 rounded-lg border border-dashed border-stone-300 bg-white/70 px-3 py-2">
                <Checkbox
                  checked={item.completed}
                  onCheckedChange={(checked) => setCustomItems((current) => updateItem(current, item.key, { completed: Boolean(checked) }))}
                  disabled={!item.label.trim()}
                  className="data-[state=checked]:border-cyan-600 data-[state=checked]:bg-cyan-600"
                />
                <Input
                  value={item.label}
                  placeholder={`自定义 ${index + 1}`}
                  onChange={(event) => setCustomItems((current) => updateItem(current, item.key, { label: event.target.value }))}
                  className="h-8 border-transparent bg-transparent px-1 text-sm shadow-none focus-visible:ring-1"
                />
                <Button
                  size="icon-sm"
                  variant={activePomodoroKey === item.key ? "default" : "ghost"}
                  disabled={!item.label.trim()}
                  className={activePomodoroKey === item.key ? "shrink-0 bg-amber-600 hover:bg-amber-600/90" : "shrink-0 text-amber-600 hover:bg-amber-50"}
                  onClick={() => togglePomodoro(item.key)}
                  aria-label="番茄钟"
                  title="番茄钟"
                >
                  <Timer className="h-4 w-4" />
                </Button>
              </div>
              {activePomodoroKey === item.key && (
                <div className="md:col-span-4">
                  <PomodoroTimer
                    key={item.key}
                    label={item.label || "晨间项"}
                    onLockChange={(locked) => setLockedPomodoroKey(locked ? item.key : null)}
                    onClose={() => setActivePomodoroKey(null)}
                    onFocusCompleted={() => void recordPomodoro(item.key, item.label)}
                    onCompleted={() => setCustomItems((current) => updateItem(current, item.key, { completed: true }))}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

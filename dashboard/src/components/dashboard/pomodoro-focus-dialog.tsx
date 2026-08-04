"use client";

import { Timer } from "lucide-react";
import type { PomodoroEntry } from "@/lib/api";
import { PomodoroTimer } from "@/components/dashboard/pomodoro-timer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function formatCompletedAt(value: string) {
  if (!value) return "刚刚";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function formatDuration(seconds: number) {
  const safe = Math.max(0, Math.round(seconds / 60));
  return `${safe || 1} 分钟`;
}

interface PomodoroFocusDialogProps {
  open: boolean;
  locked: boolean;
  focusDate: string;
  active: { key: string; label: string } | null;
  pomodoros: PomodoroEntry[];
  onOpenChange: (open: boolean) => void;
  onLockChange: (locked: boolean) => void;
  onFocusCompleted: (key: string, label: string) => void;
  onCompleted?: (key: string) => void;
}

export function PomodoroFocusDialog({
  open,
  locked,
  focusDate,
  active,
  pomodoros,
  onOpenChange,
  onLockChange,
  onFocusCompleted,
  onCompleted,
}: PomodoroFocusDialogProps) {
  const history = [...pomodoros].reverse();

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && locked) return;
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent
        showCloseButton={!locked}
        className="max-h-[min(90vh,720px)] gap-0 overflow-hidden p-0 sm:max-w-xl"
        onPointerDownOutside={(event) => {
          if (locked) event.preventDefault();
        }}
        onEscapeKeyDown={(event) => {
          if (locked) event.preventDefault();
        }}
      >
        <DialogHeader className="border-b border-stone-200 px-6 py-4 text-left">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Timer className="h-5 w-5 text-amber-600" />
            番茄钟
          </DialogTitle>
          <DialogDescription>
            {focusDate} · 今日已完成 {pomodoros.length} 个
            {locked ? " · 专注进行中，完成后可关闭" : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[min(70vh,560px)] space-y-4 overflow-y-auto px-6 py-4">
          {active ? (
            <div className="[&_.coast-pomodoro]:mt-0">
              <PomodoroTimer
                key={active.key}
                label={active.label}
                onLockChange={onLockChange}
                onFocusCompleted={() => onFocusCompleted(active.key, active.label)}
                onCompleted={onCompleted ? () => onCompleted(active.key) : undefined}
              />
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-stone-200 bg-stone-50 px-4 py-8 text-center text-sm text-stone-500">
              从任务或晨间行动点番茄钟图标开始专注。
            </div>
          )}

          <section aria-labelledby="pomodoro-history-heading" className="space-y-2">
            <div className="flex items-baseline justify-between gap-2">
              <h3 id="pomodoro-history-heading" className="text-sm font-semibold text-stone-900">
                今日记录
              </h3>
              <span className="text-xs tabular-nums text-stone-500">{history.length} 条</span>
            </div>

            {history.length === 0 ? (
              <p className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-4 text-sm text-stone-500">
                今天还没有完成的番茄钟。
              </p>
            ) : (
              <ul className="divide-y divide-stone-200 rounded-lg border border-stone-200 bg-stone-50/70">
                {history.map((entry, index) => (
                  <li
                    key={`${entry.completedAt}-${entry.key}-${index}`}
                    className="flex items-start justify-between gap-3 px-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-stone-900">
                        {entry.label.trim() || entry.key}
                      </p>
                      <p className="mt-0.5 text-xs text-stone-500">
                        {formatCompletedAt(entry.completedAt)} · {formatDuration(entry.duration)}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-800">
                      +1
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}

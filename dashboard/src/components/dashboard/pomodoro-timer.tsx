"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Coffee, Pause, Play, RotateCcw, Timer as TimerIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

const FOCUS_DURATION = 30 * 60; // 30 分钟专注
const BREAK_DURATION = 5 * 60; // 5 分钟短休息

type Phase = "focus" | "break" | "idle";

interface PomodoroTimerProps {
  label: string;
  /** 每次专注完成时触发（用于记录一个番茄）。 */
  onFocusCompleted?: () => void;
  /** 专注完成时同时勾选对应晨间日志项。 */
  onCompleted?: () => void;
  /** 锁定状态变化时通知父组件：一旦开始就无法被收起。 */
  onLockChange?: (locked: boolean) => void;
  onClose?: () => void;
}

function formatTime(seconds: number) {
  const safe = Math.max(0, Math.floor(seconds));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/**
 * 30 分钟专注倒计时的番茄钟。
 * 倒计时基于 deadline 时间戳计算，刷新页面/切换标签页后仍然准确；
 * 并通过 localStorage 持久化，方便在同一台设备上恢复。
 */
export function PomodoroTimer({ label, onFocusCompleted, onCompleted, onLockChange, onClose }: PomodoroTimerProps) {
  const [phase, setPhase] = useState<Phase>("focus");
  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState(FOCUS_DURATION);
  const [completed, setCompleted] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const deadlineRef = useRef<number | null>(null);

  // 一旦专注已开始（进度被记下），面板即被锁定：不可被父组件收起。
  // 仅在重置回初始态、或专注完成后才解锁。
  const locked = !completed && (running || remaining < FOCUS_DURATION);

  useEffect(() => {
    onLockChange?.(locked);
  }, [locked, onLockChange]);

  const totalForPhase = phase === "break" ? BREAK_DURATION : FOCUS_DURATION;

  // 每秒根据 deadline 校准剩余时间，避免 setInterval 漂移。
  const tick = useCallback(() => {
    if (deadlineRef.current === null) return;
    const diff = Math.round((deadlineRef.current - Date.now()) / 1000);
    if (diff <= 0) {
      setRemaining(0);
      setRunning(false);
      deadlineRef.current = null;
      if (phase === "focus") {
        setCompleted(true);
        onFocusCompleted?.();
        onCompleted?.();
      } else {
        setPhase("idle");
      }
      return;
    }
    setRemaining(diff);
  }, [onFocusCompleted, onCompleted, phase]);

  useEffect(() => {
    if (!running) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }
    // 通过 interval 驱动校准，避免在 effect 体内直接 setState 触发级联渲染。
    intervalRef.current = setInterval(tick, 250);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [running, tick]);

  // 回到页面时立即校准。
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible" && running) tick();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [running, tick]);

  const handleToggle = () => {
    if (running) {
      // 暂停：冻结当前剩余时间。
      setRunning(false);
      deadlineRef.current = null;
    } else {
      // 开始/恢复：以剩余时间重设 deadline。
      deadlineRef.current = Date.now() + remaining * 1000;
      setRunning(true);
    }
  };

  const handleReset = () => {
    setRunning(false);
    deadlineRef.current = null;
    setRemaining(totalForPhase);
    setCompleted(false);
    if (phase === "idle") setPhase("focus");
  };

  const startBreak = () => {
    setPhase("break");
    setRemaining(BREAK_DURATION);
    setRunning(false);
    deadlineRef.current = null;
  };

  const finishFocus = () => {
    setRemaining(0);
    setRunning(false);
    deadlineRef.current = null;
    setCompleted(true);
    onFocusCompleted?.();
    onCompleted?.();
  };

  const progress = ((totalForPhase - remaining) / totalForPhase) * 100;
  const isUrgent = remaining <= 60 && remaining > 0 && running;
  const isBreak = phase === "break";

  // SVG 圆环参数。
  const size = 132;
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress / 100);
  const ringColor = completed ? "#16a34a" : isBreak ? "#0891b2" : isUrgent ? "#dc2626" : "#d97706";

  return (
    <div className="mt-2 flex flex-col gap-4 rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50/80 to-orange-50/60 p-4 sm:flex-row sm:items-center sm:gap-6">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#f5f5f4" strokeWidth={stroke} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={ringColor}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className="transition-all duration-300 ease-linear"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={`font-mono text-2xl font-bold tabular-nums tracking-tight ${isUrgent ? "text-red-600" : isBreak ? "text-cyan-700" : "text-stone-900"}`}
          >
            {formatTime(remaining)}
          </span>
          <span className="mt-0.5 flex items-center gap-1 text-xs font-medium text-stone-500">
            {completed ? (
              <>
                <Check className="h-3 w-3 text-emerald-600" /> 已完成
              </>
            ) : isBreak ? (
              <>
                <Coffee className="h-3 w-3" /> 休息中
              </>
            ) : (
              <>
                <TimerIcon className="h-3 w-3" /> 专注中
              </>
            )}
          </span>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-amber-700">🍅 番茄钟 · 30 分钟专注</p>
          <p className="mt-0.5 truncate text-base font-semibold text-stone-900">{label}</p>
          <p className="mt-0.5 text-xs text-stone-500">
            {completed
              ? "专注完成！可以开始 5 分钟短休息。"
              : isBreak
                ? "休息一下，喝口水，准备好再开始下一个。"
                : running
                  ? "保持专注，专注这一件事。"
                  : "点击开始进入 30 分钟专注。"}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {!completed && !isBreak && (
            <Button size="sm" onClick={handleToggle} className="bg-amber-600 hover:bg-amber-600/90">
              {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {running ? "暂停" : remaining < FOCUS_DURATION ? "继续" : "开始"}
            </Button>
          )}
          {isBreak && (
            <Button size="sm" onClick={handleToggle} className="bg-cyan-600 hover:bg-cyan-600/90">
              {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {running ? "暂停" : "继续休息"}
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4" />
            重置
          </Button>
          {!completed && !isBreak && (
            <Button size="sm" variant="outline" onClick={finishFocus}>
              <Check className="h-4 w-4" />
              直接完成
            </Button>
          )}
          {completed && (
            <Button size="sm" onClick={startBreak} className="bg-cyan-600 hover:bg-cyan-600/90">
              <Coffee className="h-4 w-4" />
              开始休息
            </Button>
          )}
          {onClose && (
            <Button size="sm" variant="ghost" onClick={onClose} disabled={locked} title={locked ? "专注进行中，无法收起" : "收起"}>
              收起
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

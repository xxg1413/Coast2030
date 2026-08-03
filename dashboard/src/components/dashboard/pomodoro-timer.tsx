"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bell, BellOff, Check, Coffee, Pause, Play, RotateCcw, Timer as TimerIcon, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const FOCUS_DURATION = 30 * 60; // 30 分钟专注
const BREAK_DURATION = 5 * 60; // 5 分钟短休息
const BROWSER_REMINDER_STORAGE_KEY = "coast-pomodoro-browser-reminder";

type Phase = "focus" | "break" | "idle";
type ReminderPhase = Exclude<Phase, "idle">;
type NotificationState = NotificationPermission | "unsupported";

type WindowWithWebkitAudio = Window & {
  webkitAudioContext?: typeof AudioContext;
};

interface PomodoroTimerProps {
  label: string;
  /** 每次专注完成时触发（用于记录一个番茄）。 */
  onFocusCompleted?: () => void;
  /** 非核心项目可在单次专注完成后同步勾选；核心项目由分类累计时长判定。 */
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
  const [browserReminderEnabled, setBrowserReminderEnabled] = useState(false);
  const [notificationState, setNotificationState] = useState<NotificationState>("default");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const deadlineRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const initializeReminder = window.setTimeout(() => {
      if (!("Notification" in window)) {
        setNotificationState("unsupported");
        return;
      }

      setNotificationState(Notification.permission);
      try {
        setBrowserReminderEnabled(
          Notification.permission === "granted"
          && window.localStorage.getItem(BROWSER_REMINDER_STORAGE_KEY) === "enabled",
        );
      } catch {
        setBrowserReminderEnabled(false);
      }
    }, 0);

    return () => window.clearTimeout(initializeReminder);
  }, []);

  const getAudioContext = useCallback(async () => {
    const AudioContextConstructor = window.AudioContext
      || (window as WindowWithWebkitAudio).webkitAudioContext;
    if (!AudioContextConstructor) return null;

    const context = audioContextRef.current || new AudioContextConstructor();
    audioContextRef.current = context;
    if (context.state === "suspended") {
      try {
        await context.resume();
      } catch {
        return null;
      }
    }
    return context;
  }, []);

  const playCompletionSound = useCallback(async (completedPhase: ReminderPhase) => {
    const context = await getAudioContext();
    if (!context) return;

    const frequencies = completedPhase === "focus" ? [784, 988, 1175] : [660, 523];
    const now = context.currentTime;
    frequencies.forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const startAt = now + index * 0.16;
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, startAt);
      gain.gain.setValueAtTime(0.0001, startAt);
      gain.gain.exponentialRampToValueAtTime(0.18, startAt + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.2);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(startAt);
      oscillator.stop(startAt + 0.22);
    });
  }, [getAudioContext]);

  const announceCompletion = useCallback((completedPhase: ReminderPhase) => {
    void playCompletionSound(completedPhase);
    if (!browserReminderEnabled || !("Notification" in window) || Notification.permission !== "granted") return;

    try {
      const isFocus = completedPhase === "focus";
      new Notification(isFocus ? "番茄钟完成" : "休息结束", {
        body: isFocus ? `${label} · 已完成 30 分钟专注` : "可以开始下一轮专注了。",
        icon: "/icon.svg",
        tag: `coast-pomodoro-${completedPhase}`,
      });
    } catch {
      // 系统通知失败时仍保留声音和页面内完成状态。
    }
  }, [browserReminderEnabled, label, playCompletionSound]);

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
        announceCompletion("focus");
      } else {
        setPhase("focus");
        setRemaining(FOCUS_DURATION);
        announceCompletion("break");
      }
      return;
    }
    setRemaining(diff);
  }, [announceCompletion, onFocusCompleted, onCompleted, phase]);

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
      void getAudioContext();
      deadlineRef.current = Date.now() + remaining * 1000;
      setRunning(true);
    }
  };

  const toggleBrowserReminder = async () => {
    if (!("Notification" in window)) {
      setNotificationState("unsupported");
      return;
    }

    if (browserReminderEnabled) {
      setBrowserReminderEnabled(false);
      try {
        window.localStorage.removeItem(BROWSER_REMINDER_STORAGE_KEY);
      } catch {
        // 本地设置不可写时只保留当前页面状态。
      }
      return;
    }

    const permission = Notification.permission === "granted"
      ? "granted"
      : await Notification.requestPermission();
    setNotificationState(permission);
    if (permission !== "granted") return;

    setBrowserReminderEnabled(true);
    try {
      window.localStorage.setItem(BROWSER_REMINDER_STORAGE_KEY, "enabled");
    } catch {
      // 本地设置不可写时仍在当前页面开启提醒。
    }
    void playCompletionSound("focus");
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
    setCompleted(false);
    setRunning(false);
    deadlineRef.current = null;
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
  const ringColor = completed
    ? "var(--color-success)"
    : isBreak
      ? "var(--color-accent)"
      : isUrgent
        ? "var(--color-danger)"
        : "var(--color-warning)";

  return (
    <div className="coast-pomodoro mt-2 flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center sm:gap-6">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--color-rule)" strokeWidth={stroke} />
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
          <p className="text-xs font-medium text-amber-700">番茄钟 · 30 分钟专注</p>
          <p className="mt-0.5 truncate text-base font-semibold text-stone-900">{label}</p>
          <p className="mt-0.5 text-xs text-stone-500">
            {completed
              ? "专注完成。可以开始 5 分钟短休息。"
              : isBreak
                ? "休息一下，喝口水，准备好再开始下一个。"
                : running
                  ? "保持专注，专注这一件事。"
                  : "点击开始进入 30 分钟专注。"}
          </p>
          <p className="mt-1 inline-flex items-center gap-1 text-xs text-stone-500">
            <Volume2 className="h-3.5 w-3.5" />
            完成时响铃{browserReminderEnabled ? "并发送浏览器通知" : ""}
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
          <Button
            size="sm"
            variant="outline"
            onClick={() => void toggleBrowserReminder()}
            disabled={notificationState === "denied" || notificationState === "unsupported"}
            title={notificationState === "denied"
              ? "浏览器已阻止通知，请在站点设置中手动允许"
              : notificationState === "unsupported"
                ? "当前浏览器不支持系统通知"
                : browserReminderEnabled
                  ? "关闭浏览器系统通知"
                  : "开启浏览器系统通知"}
          >
            {browserReminderEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
            {browserReminderEnabled
              ? "浏览器提醒已开启"
              : notificationState === "denied"
                ? "通知已被阻止"
                : notificationState === "unsupported"
                  ? "不支持通知"
                  : "开启浏览器提醒"}
          </Button>
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

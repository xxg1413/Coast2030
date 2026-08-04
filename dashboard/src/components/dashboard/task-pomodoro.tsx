"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Timer } from "lucide-react";
import type { PomodoroEntry } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { PomodoroFocusDialog } from "@/components/dashboard/pomodoro-focus-dialog";

interface ActivePomodoro {
  key: string;
  label: string;
}

interface StartOptions {
  onCompleted?: () => void;
}

interface PomodoroSessionContextValue {
  activeKey: string | null;
  locked: boolean;
  open: boolean;
  pomodoros: PomodoroEntry[];
  start: (key: string, label: string, options?: StartOptions) => void;
  openDialog: () => void;
}

const PomodoroSessionContext = createContext<PomodoroSessionContextValue | null>(null);

export function usePomodoroSession() {
  return useContext(PomodoroSessionContext);
}

export function PomodoroSessionProvider({
  focusDate,
  initialPomodoros,
  children,
}: {
  focusDate: string;
  initialPomodoros: PomodoroEntry[];
  children: React.ReactNode;
}) {
  const [active, setActive] = useState<ActivePomodoro | null>(null);
  const [open, setOpen] = useState(false);
  const [locked, setLocked] = useState(false);
  const [pomodoros, setPomodoros] = useState<PomodoroEntry[]>(initialPomodoros);
  const onCompletedRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    setPomodoros(initialPomodoros);
  }, [focusDate]); // eslint-disable-line react-hooks/exhaustive-deps -- 仅换日时重置，避免 refresh 冲掉进行中的乐观更新

  const start = useCallback(
    (key: string, label: string, options?: StartOptions) => {
      const trimmed = label.trim();
      if (!trimmed) return;

      if (locked) {
        if (active?.key === key) setOpen(true);
        return;
      }

      if (active?.key === key && open) {
        setOpen(false);
        setActive(null);
        onCompletedRef.current = null;
        return;
      }

      onCompletedRef.current = options?.onCompleted ?? null;
      setActive({ key, label: trimmed });
      setOpen(true);
    },
    [active?.key, locked, open],
  );

  const openDialog = useCallback(() => {
    setOpen(true);
  }, []);

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
          body: JSON.stringify({ date: focusDate, key, label }),
        });
        if (!response.ok) throw new Error(`Pomodoro add failed: ${response.status}`);
      } catch (error) {
        console.error(error);
        setPomodoros((current) => current.filter((entry) => entry !== optimistic));
      }
    },
    [focusDate],
  );

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen && locked) return;
      setOpen(nextOpen);
      if (!nextOpen && !locked) {
        setActive(null);
        onCompletedRef.current = null;
      }
    },
    [locked],
  );

  const value = useMemo(
    () => ({
      activeKey: active?.key ?? null,
      locked,
      open,
      pomodoros,
      start,
      openDialog,
    }),
    [active?.key, locked, open, openDialog, pomodoros, start],
  );

  return (
    <PomodoroSessionContext.Provider value={value}>
      {children}
      <PomodoroFocusDialog
        open={open}
        locked={locked}
        focusDate={focusDate}
        active={active}
        pomodoros={pomodoros}
        onOpenChange={handleOpenChange}
        onLockChange={setLocked}
        onFocusCompleted={(key, label) => void recordPomodoro(key, label)}
        onCompleted={() => onCompletedRef.current?.()}
      />
    </PomodoroSessionContext.Provider>
  );
}

/** @deprecated Use PomodoroSessionProvider */
export const TaskPomodoroProvider = PomodoroSessionProvider;

export function TaskPomodoroButton({
  taskKey,
  label,
  className = "",
  onCompleted,
}: {
  taskKey: string;
  label: string;
  className?: string;
  onCompleted?: () => void;
}) {
  const context = usePomodoroSession();
  if (!context) return null;

  const active = context.activeKey === taskKey;
  const disabled = !label.trim() || (context.locked && !active);

  return (
    <Button
      type="button"
      size="icon"
      variant={active ? "secondary" : "ghost"}
      className={`h-7 w-7 shrink-0 text-stone-600 ${className}`}
      onClick={() => context.start(taskKey, label, { onCompleted })}
      disabled={disabled}
      aria-label={`为${label.trim() || "任务"}使用番茄钟`}
      aria-pressed={active}
      title={disabled && context.locked ? "当前专注进行中" : `为${label.trim() || "任务"}使用番茄钟`}
    >
      <Timer className="h-3.5 w-3.5" />
    </Button>
  );
}

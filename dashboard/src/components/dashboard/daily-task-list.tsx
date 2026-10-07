"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarX2, Check, ListChecks, Loader2, Pencil, Plus, Repeat, Trash2, X } from "lucide-react";
import { EmptyState } from "./empty-state";
import { TaskPomodoroButton } from "./task-pomodoro";
import type { TaskRepeatMode } from "@/lib/api";

interface DailyTask {
  id: string;
  text: string;
  completed: boolean;
  date: string;
  goalArea: GoalArea;
  repeat: TaskRepeatMode;
  seriesId: string | null;
}

type GoalArea = "Overall" | "Hunter" | "SaaS" | "Media";
const GOAL_LABELS: Record<GoalArea, string> = {
  Overall: "总目标",
  Hunter: "Hunter",
  SaaS: "SaaS",
  Media: "Media",
};
/** Hunter is retired — keep labels for existing tasks, omit from new-choice dropdown. */
const GOAL_OPTIONS: GoalArea[] = ["Overall", "SaaS", "Media"];

const REPEAT_LABELS: Record<TaskRepeatMode, string> = {
  none: "不重复",
  daily: "每天",
  weekly: "每周",
  monthly: "每月",
};
const REPEAT_OPTIONS = Object.keys(REPEAT_LABELS) as TaskRepeatMode[];

interface DailyTaskListProps {
  date: string;
  tasks: DailyTask[];
}

export function DailyTaskList({ date, tasks }: DailyTaskListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [newTask, setNewTask] = useState("");
  const [goalArea, setGoalArea] = useState<GoalArea>("Overall");
  const [newRepeat, setNewRepeat] = useState<TaskRepeatMode>("none");
  const [adding, setAdding] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [updating, setUpdating] = useState(false);

  const completedCount = useMemo(() => tasks.filter((task) => task.completed).length, [tasks]);

  const handleDateChange = (value: string) => {
    if (!value) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("day", value);
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleAdd = async () => {
    if (!newTask.trim()) return;
    setAdding(true);
    try {
      await fetch("/api/tasks/daily/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newTask, date, goalArea, repeat: newRepeat }),
      });
      setNewTask("");
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setAdding(false);
    }
  };

  const handleToggle = async (task: DailyTask) => {
    setTogglingId(task.id);
    try {
      await fetch("/api/tasks/daily/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: task.id, completed: !task.completed }),
      });
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (taskId: string, series = false) => {
    setDeletingId(taskId);
    try {
      await fetch("/api/tasks/daily/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: taskId, series }),
      });
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setDeletingId(null);
    }
  };

  const startEdit = (task: DailyTask) => {
    setEditingId(task.id);
    setEditingText(task.text);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingText("");
  };

  const saveEdit = async () => {
    if (!editingId || !editingText.trim()) return;
    setUpdating(true);
    try {
      await fetch("/api/tasks/daily/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, text: editingText }),
      });
      cancelEdit();
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Card className="glass-panel flex h-full w-full flex-col">
      <CardHeader className="space-y-3 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <ListChecks className="h-4 w-4 text-cyan-700" aria-hidden="true" />
            每日任务
          </CardTitle>
          <div className="text-xs text-stone-500">
            {completedCount}/{tasks.length} 完成
          </div>
        </div>
        <Input
          type="date"
          value={date}
          onChange={(event) => handleDateChange(event.target.value)}
          className="w-full max-w-[220px] bg-white border-stone-200"
        />
      </CardHeader>
      <CardContent className="flex flex-1 flex-col space-y-3">
        <div className="flex-1 space-y-2">
          {tasks.length === 0 && (
            <EmptyState message="当天还没有任务，先加一条吧。" />
          )}

          {tasks.map((task) => {
            const inEdit = editingId === task.id;
            const disabled = togglingId === task.id || deletingId === task.id || updating;

            return (
              <div
                key={task.id}
                className="rounded-md border border-stone-200 bg-stone-50 px-3 py-2.5"
              >
                <div className="flex items-start gap-2.5">
                  <Checkbox
                    id={`daily-${task.id}`}
                    checked={task.completed}
                    onCheckedChange={() => handleToggle(task)}
                    disabled={disabled}
                    className="mt-0.5 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                  />

                  <div className="flex-1 min-w-0 space-y-2">
                    {inEdit ? (
                      <Input
                        value={editingText}
                        onChange={(event) => setEditingText(event.target.value)}
                        className="h-8 bg-white border-stone-200"
                      />
                    ) : (
                      <label
                        htmlFor={`daily-${task.id}`}
                        className={`block text-sm leading-relaxed ${
                          task.completed ? "line-through text-stone-400" : "text-stone-900"
                        }`}
                      >
                        {task.text}
                      </label>
                    )}

                    <div className="flex items-center gap-0.5">
                      <span className="mr-1 rounded-full border border-stone-200 bg-white px-2 py-0.5 text-[11px] font-medium text-stone-600">
                        {GOAL_LABELS[task.goalArea]}
                      </span>
                      {task.repeat !== "none" && (
                        <span className="mr-1 inline-flex items-center gap-0.5 rounded-full border border-cyan-200 bg-cyan-50 px-2 py-0.5 text-[11px] font-medium text-cyan-700">
                          <Repeat className="h-3 w-3" aria-hidden="true" />
                          {REPEAT_LABELS[task.repeat]}
                        </span>
                      )}
                      {inEdit ? (
                        <>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={saveEdit}
                            disabled={updating}
                          >
                            {updating ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Check className="h-3.5 w-3.5" />
                            )}
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={cancelEdit}
                            disabled={updating}
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <TaskPomodoroButton taskKey={`daily:${task.id}`} label={task.text} />
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-stone-500 hover:text-stone-700"
                            onClick={() => startEdit(task)}
                            disabled={disabled}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      )}

                      {task.repeat !== "none" && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-stone-500 hover:text-destructive hover:bg-destructive/10"
                          title="删除整个重复系列（所有日期）"
                          onClick={() => {
                            if (window.confirm("删除整个重复系列？所有日期的这条任务都会被删除。")) {
                              handleDelete(task.id, true);
                            }
                          }}
                          disabled={disabled}
                        >
                          <CalendarX2 className="h-3.5 w-3.5" />
                        </Button>
                      )}

                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-destructive hover:bg-destructive/10"
                        title={task.repeat !== "none" ? "只删除当天这一条" : "删除任务"}
                        onClick={() => handleDelete(task.id)}
                        disabled={disabled}
                      >
                        {deletingId === task.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-[86px_82px_1fr_auto] items-center gap-2 pt-3 border-t border-stone-100">
          <select
            value={goalArea}
            onChange={(event) => setGoalArea(event.target.value as GoalArea)}
            className="h-9 rounded-md border border-stone-200 bg-white px-2 text-xs"
            aria-label="目标线"
          >
            {GOAL_OPTIONS.map((value) => (
              <option key={value} value={value}>{GOAL_LABELS[value]}</option>
            ))}
          </select>
          <select
            value={newRepeat}
            onChange={(event) => setNewRepeat(event.target.value as TaskRepeatMode)}
            className="h-9 rounded-md border border-stone-200 bg-white px-2 text-xs"
            aria-label="重复"
          >
            {REPEAT_OPTIONS.map((value) => (
              <option key={value} value={value}>{REPEAT_LABELS[value]}</option>
            ))}
          </select>
          <Input
            value={newTask}
            onChange={(event) => setNewTask(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && handleAdd()}
            className="bg-white border-stone-200"
            placeholder="新增每日任务…"
          />
          <Button size="icon" onClick={handleAdd} disabled={adding}>
            {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

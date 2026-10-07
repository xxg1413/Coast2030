"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CalendarX2, Check, Crosshair, Loader2, Plus, Repeat, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { EmptyState } from "./empty-state";
import { TaskPomodoroButton } from "./task-pomodoro";
import type { TaskRepeatMode } from "@/lib/api";

interface WeeklyFocusTask {
  id: string;
  text: string;
  completed: boolean;
  goalArea: GoalArea;
  repeat: TaskRepeatMode;
  seriesId: string | null;
  seriesAnchor: string;
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

const WEEKLY_REPEAT_OPTIONS: Array<TaskRepeatMode> = ["none", "weekly"];
const WEEKLY_REPEAT_LABELS: Record<TaskRepeatMode, string> = {
  none: "不重复",
  weekly: "每周",
  daily: "每天",
  monthly: "每月",
};

export function WeeklyFocusList({ tasks, title = "本周焦点" }: { tasks: WeeklyFocusTask[]; title?: string }) {
  const router = useRouter();
  const [newTask, setNewTask] = useState("");
  const [goalArea, setGoalArea] = useState<GoalArea>("Overall");
  const [adding, setAdding] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [repeatEditId, setRepeatEditId] = useState<string | null>(null);
  const [repeatMode, setRepeatMode] = useState<TaskRepeatMode>("none");
  const [repeatAnchor, setRepeatAnchor] = useState("");
  const [savingRepeat, setSavingRepeat] = useState(false);
  const completedCount = tasks.filter((task) => task.completed).length;

  const handleToggle = async (task: WeeklyFocusTask) => {
    setToggling(task.id);
    try {
      await fetch("/api/tasks/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: task.id, completed: !task.completed }),
      });
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setToggling(null);
    }
  };

  const handleAdd = async () => {
    if (!newTask.trim()) return;
    setAdding(true);
    try {
      await fetch("/api/tasks/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newTask, goalArea }),
      });
      setNewTask("");
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (taskId: string, series = false) => {
    setDeleting(taskId);
    try {
      await fetch("/api/tasks/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: taskId, series }),
      });
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setDeleting(null);
    }
  };

  const openRepeatEdit = (task: WeeklyFocusTask) => {
    setRepeatMode(task.repeat === "weekly" ? "weekly" : "none");
    setRepeatAnchor(task.seriesAnchor || "");
    setRepeatEditId(task.id);
  };

  const saveRepeatEdit = async () => {
    if (!repeatEditId) return;
    setSavingRepeat(true);
    try {
      await fetch("/api/tasks/repeat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: repeatEditId, repeat: repeatMode, anchorWeek: repeatAnchor }),
      });
      setRepeatEditId(null);
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setSavingRepeat(false);
    }
  };

  return (
    <Card className="glass-panel flex h-full w-full flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Crosshair className="h-4 w-4 text-cyan-700" aria-hidden="true" />
            {title}
          </CardTitle>
          <div className="text-xs text-stone-500">
            {completedCount}/{tasks.length} 完成
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col space-y-3">
        <div className="flex-1 space-y-2">
          {tasks.length === 0 && (
            <EmptyState message="本周焦点还是空的，先定 3-5 个最重要动作。" />
          )}

          {tasks.map((task) => {
            const disabled = toggling === task.id || deleting === task.id;
            const inRepeatEdit = repeatEditId === task.id;

            return (
              <div
                key={task.id}
                className="rounded-md border border-stone-200 bg-stone-50 px-3 py-2.5 group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <Checkbox
                      id={`weekly-${task.id}`}
                      checked={task.completed}
                      onCheckedChange={() => handleToggle(task)}
                      disabled={disabled}
                      className="mt-0.5 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    />
                    <div className="min-w-0 space-y-2">
                      <label
                        htmlFor={`weekly-${task.id}`}
                        className={`block text-sm leading-relaxed ${
                          task.completed ? "line-through text-stone-400" : "text-stone-900"
                        }`}
                      >
                        {task.text}
                      </label>
                      <div className="flex items-center gap-0.5">
                        <span className="mr-1 rounded-full border border-stone-200 bg-white px-2 py-0.5 text-[11px] font-medium text-stone-600">
                          {GOAL_LABELS[task.goalArea]}
                        </span>
                        {task.repeat === "weekly" && (
                          <span className="mr-1 inline-flex items-center gap-0.5 rounded-full border border-cyan-200 bg-cyan-50 px-2 py-0.5 text-[11px] font-medium text-cyan-700">
                            <Repeat className="h-3 w-3" aria-hidden="true" />
                            每周{task.seriesAnchor ? `·从${task.seriesAnchor}` : ""}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-0.5">
                    <TaskPomodoroButton taskKey={`weekly:${task.id}`} label={task.text} />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-stone-500 hover:text-cyan-700 hover:bg-cyan-50"
                      title="设置重复（每周 + 起始周）"
                      onClick={() => (inRepeatEdit ? setRepeatEditId(null) : openRepeatEdit(task))}
                      disabled={disabled || savingRepeat}
                    >
                      <Repeat className="h-3.5 w-3.5" />
                    </Button>
                    {task.repeat === "weekly" && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-stone-500 hover:text-destructive hover:bg-destructive/10"
                        title="删除整个重复系列（所有周）"
                        onClick={() => {
                          if (window.confirm("删除整个重复系列？所有周的这条任务都会被删除。")) {
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
                      title={task.repeat === "weekly" ? "只删除本周这一条" : "删除任务"}
                      onClick={() => handleDelete(task.id)}
                      disabled={disabled}
                    >
                      {deleting === task.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                </div>

                {inRepeatEdit && (
                  <div className="mt-2 flex flex-wrap items-center gap-2 rounded-md border border-cyan-100 bg-cyan-50/60 px-2 py-2">
                    <select
                      value={repeatMode}
                      onChange={(event) => setRepeatMode(event.target.value as TaskRepeatMode)}
                      className="h-8 rounded-md border border-stone-200 bg-white px-2 text-xs"
                      aria-label="重复方式"
                    >
                      {WEEKLY_REPEAT_OPTIONS.map((value) => (
                        <option key={value} value={value}>{WEEKLY_REPEAT_LABELS[value]}</option>
                      ))}
                    </select>
                    <Input
                      value={repeatAnchor}
                      onChange={(event) => setRepeatAnchor(event.target.value)}
                      placeholder="起始周，如 2026-W41（留空=从本周起）"
                      className="h-8 w-[220px] bg-white border-stone-200"
                      aria-label="起始周"
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={saveRepeatEdit}
                      disabled={savingRepeat}
                    >
                      {savingRepeat ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Check className="h-3.5 w-3.5" />
                      )}
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => setRepeatEditId(null)}
                      disabled={savingRepeat}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-[110px_1fr_auto] items-center gap-2 pt-3 border-t border-stone-100">
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
          <Input
            value={newTask}
            onChange={(event) => setNewTask(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && handleAdd()}
            className="bg-white border-stone-200"
            placeholder="新增本周焦点…"
          />
          <Button size="icon" onClick={handleAdd} disabled={adding}>
            {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

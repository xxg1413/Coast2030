"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CalendarDays, CalendarX2, Check, Loader2, Plus, Repeat, Trash2, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "./empty-state";
import { TaskPomodoroButton } from "./task-pomodoro";
import type { TaskRepeatMode } from "@/lib/api";

interface TaskItem {
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

const MONTHLY_REPEAT_OPTIONS: Array<TaskRepeatMode> = ["none", "monthly"];
const MONTHLY_REPEAT_LABELS: Record<TaskRepeatMode, string> = {
  none: "不重复",
  monthly: "每月",
  daily: "每天",
  weekly: "每周",
};

export function MonthlyTaskList({ tasks, month, months }: { tasks: TaskItem[]; month: string; months: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [toggling, setToggling] = useState<string | null>(null);
  const [newTask, setNewTask] = useState("");
  const [goalArea, setGoalArea] = useState<GoalArea>("Overall");
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [repeatEditId, setRepeatEditId] = useState<string | null>(null);
  const [repeatMode, setRepeatMode] = useState<TaskRepeatMode>("none");
  const [repeatAnchor, setRepeatAnchor] = useState("");
  const [savingRepeat, setSavingRepeat] = useState(false);
  const isAllMonths = month === "all";

  const handleMonthChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("taskMonth", value);
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleToggle = async (task: TaskItem) => {
    setToggling(task.id);
    try {
      await fetch("/api/tasks/monthly/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: task.id, completed: !task.completed }),
      });
      router.refresh();
    } catch (e) {
      console.error(e);
    } finally {
      setToggling(null);
    }
  };

  const handleAdd = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isAllMonths) return;
    if (!newTask.trim()) return;
    setAdding(true);
    try {
      await fetch("/api/tasks/monthly/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newTask, month, goalArea }),
      });
      setNewTask("");
      router.refresh();
    } catch (e) {
      console.error(e);
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (taskId: string, series = false) => {
    setDeleting(taskId);
    try {
      await fetch("/api/tasks/monthly/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: taskId, series }),
      });
      router.refresh();
    } catch (e) {
      console.error(e);
    } finally {
      setDeleting(null);
    }
  };

  const openRepeatEdit = (task: TaskItem) => {
    setRepeatMode(task.repeat === "monthly" ? "monthly" : "none");
    setRepeatAnchor(task.seriesAnchor || "");
    setRepeatEditId(task.id);
  };

  const saveRepeatEdit = async () => {
    if (!repeatEditId) return;
    setSavingRepeat(true);
    try {
      await fetch("/api/tasks/monthly/repeat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: repeatEditId, repeat: repeatMode, anchorMonth: repeatAnchor }),
      });
      setRepeatEditId(null);
      router.refresh();
    } catch (e) {
      console.error(e);
    } finally {
      setSavingRepeat(false);
    }
  };

  return (
    <Card className="glass-panel flex h-full w-full flex-col">
      <CardHeader className="space-y-3 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarDays className="h-4 w-4 text-cyan-700" aria-hidden="true" />
            本月关键点
          </CardTitle>
        </div>
        <Select value={month} onValueChange={handleMonthChange}>
          <SelectTrigger className="w-full max-w-[220px] h-9 bg-white border-stone-200">
            <SelectValue placeholder="选择月份" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部月份</SelectItem>
            {months.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="space-y-2 flex-1">
          {tasks.length === 0 && (
            <EmptyState message={isAllMonths ? "暂无任务记录。" : "本月暂无关键点。"} />
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
                      id={`monthly-${task.id}`}
                      checked={task.completed}
                      onCheckedChange={() => handleToggle(task)}
                      disabled={disabled}
                      className="mt-0.5 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    />
                    <div className="min-w-0 space-y-2">
                      <label
                        htmlFor={`monthly-${task.id}`}
                        className={`block text-sm leading-relaxed peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
                          task.completed ? "line-through text-stone-400" : "text-stone-900"
                        }`}
                      >
                        {task.text}
                      </label>
                      <div className="flex items-center gap-0.5">
                        <span className="mr-1 shrink-0 rounded-full border border-stone-200 bg-white px-2 py-0.5 text-[11px] font-medium text-stone-600">
                          {GOAL_LABELS[task.goalArea]}
                        </span>
                        {task.repeat === "monthly" && (
                          <span className="inline-flex items-center gap-0.5 rounded-full border border-cyan-200 bg-cyan-50 px-2 py-0.5 text-[11px] font-medium text-cyan-700">
                            <Repeat className="h-3 w-3" aria-hidden="true" />
                            每月{task.seriesAnchor ? `·从${task.seriesAnchor}` : ""}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-0.5">
                    <TaskPomodoroButton taskKey={`monthly:${task.id}`} label={task.text} />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-stone-500 hover:text-cyan-700 hover:bg-cyan-50"
                      title="设置重复（每月 + 起始月）"
                      onClick={() => (inRepeatEdit ? setRepeatEditId(null) : openRepeatEdit(task))}
                      disabled={disabled || savingRepeat}
                    >
                      <Repeat className="h-3.5 w-3.5" />
                    </Button>
                    {task.repeat === "monthly" && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-stone-500 hover:text-destructive hover:bg-destructive/10"
                        title="删除整个重复系列（所有月）"
                        onClick={() => {
                          if (window.confirm("删除整个重复系列？所有月的这条任务都会被删除。")) {
                            handleDelete(task.id, true);
                          }
                        }}
                        disabled={disabled}
                      >
                        <CalendarX2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                      title={task.repeat === "monthly" ? "只删除本月这一条" : "删除任务"}
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
                      {MONTHLY_REPEAT_OPTIONS.map((value) => (
                        <option key={value} value={value}>{MONTHLY_REPEAT_LABELS[value]}</option>
                      ))}
                    </select>
                    <Input
                      type="month"
                      value={repeatAnchor}
                      onChange={(event) => setRepeatAnchor(event.target.value)}
                      className="h-8 w-[160px] bg-white border-stone-200"
                      aria-label="起始月"
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

        <form onSubmit={handleAdd} className="mt-4 grid grid-cols-[110px_1fr_auto] gap-2 pt-3 border-t border-stone-100">
          <select
            value={goalArea}
            onChange={(event) => setGoalArea(event.target.value as GoalArea)}
            className="h-9 rounded-md border border-stone-200 bg-white px-2 text-xs"
            disabled={isAllMonths}
            aria-label="目标线"
          >
            {Object.entries(GOAL_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <Input
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            className="bg-white border-stone-200"
            disabled={isAllMonths}
            placeholder={isAllMonths ? "请先选择具体月份再新增" : "新增关键点…"}
          />
          <Button type="submit" size="icon" disabled={adding || isAllMonths}>
            {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

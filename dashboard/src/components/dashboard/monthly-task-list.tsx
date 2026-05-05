"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "./empty-state";

interface TaskItem {
  id: string;
  text: string;
  completed: boolean;
}

export function MonthlyTaskList({ tasks, month, months }: { tasks: TaskItem[]; month: string; months: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [toggling, setToggling] = useState<string | null>(null);
  const [newTask, setNewTask] = useState("");
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
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
        body: JSON.stringify({ text: newTask, month }),
      });
      setNewTask("");
      router.refresh();
    } catch (e) {
      console.error(e);
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (task: TaskItem) => {
    setDeleting(task.id);
    try {
      await fetch("/api/tasks/monthly/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: task.id }),
      });
      router.refresh();
    } catch (e) {
      console.error(e);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <Card className="w-full h-full flex flex-col border-stone-200 bg-white/78 shadow-[0_8px_30px_rgba(84,61,31,0.06)]">
      <CardHeader className="space-y-3 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">📅 本月关键点</CardTitle>
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

            return (
              <div
                key={task.id}
                className="flex items-start justify-between gap-3 rounded-md border border-stone-200 bg-stone-50 px-3 py-2.5 group"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <Checkbox
                    id={`monthly-${task.id}`}
                    checked={task.completed}
                    onCheckedChange={() => handleToggle(task)}
                    disabled={disabled}
                    className="mt-0.5 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                  <label
                    htmlFor={`monthly-${task.id}`}
                    className={`text-sm leading-relaxed peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
                      task.completed ? "line-through text-stone-400" : "text-stone-900"
                    }`}
                  >
                    {task.text}
                  </label>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive/90 hover:bg-destructive/10 shrink-0"
                  onClick={() => handleDelete(task)}
                  disabled={deleting === task.id}
                >
                  {deleting === task.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
            );
          })}
        </div>

        <form onSubmit={handleAdd} className="mt-4 flex gap-2 pt-3 border-t border-stone-100">
          <Input
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            className="bg-white border-stone-200"
            disabled={isAllMonths}
            placeholder={isAllMonths ? "请先选择具体月份再新增" : "新增关键点..."}
          />
          <Button type="submit" size="icon" disabled={adding || isAllMonths}>
            {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

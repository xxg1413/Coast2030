"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

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
        // User requested no system dialog. Direct delete.
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
        <Card className="w-full h-full flex flex-col border-stone-200 bg-white/78 shadow-[0_12px_40px_rgba(84,61,31,0.08)]">
            <CardHeader className="space-y-3">
                <CardTitle>📅 本月关键点</CardTitle>
                <select
                    value={month}
                    onChange={(event) => handleMonthChange(event.target.value)}
                    className="h-9 w-full max-w-[220px] rounded-md border border-stone-200 bg-white px-3 text-sm text-stone-900 outline-none focus:ring-2 focus:ring-stone-300"
                >
                    <option value="all">全部月份</option>
                    {months.map((item) => (
                        <option key={item} value={item}>
                            {item}
                        </option>
                    ))}
                </select>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
                <div className="space-y-4 flex-1">
                    {tasks.map((task) => (
                        <div key={task.id} className="flex items-center justify-between group">
                            <div className="flex items-start space-x-3">
                                <Checkbox
                                    id={`monthly-${task.id}`}
                                    checked={task.completed}
                                    onCheckedChange={() => handleToggle(task)}
                                    disabled={toggling === task.id || deleting === task.id}
                                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 mt-0.5"
                                />
                                <label
                                    htmlFor={`monthly-${task.id}`}
                                    className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${task.completed ? "line-through text-stone-400" : "text-stone-900"
                                        }`}
                                >
                                    {task.text}
                                </label>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                                onClick={() => handleDelete(task)}
                                disabled={deleting === task.id}
                            >
                                {deleting === task.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                            </Button>
                        </div>
                    ))}
                    {tasks.length === 0 && (
                        <p className="text-sm text-stone-500">本月暂无关键点。</p>
                    )}
                </div>

                <form onSubmit={handleAdd} className="mt-6 flex gap-2">
                    <Input
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        className="bg-white"
                        disabled={isAllMonths}
                        placeholder={isAllMonths ? "请先选择具体月份再新增" : ""}
                    />
                    <Button type="submit" size="icon" disabled={adding || isAllMonths}>
                        {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

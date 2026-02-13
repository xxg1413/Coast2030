"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Check, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";

interface DailyTask {
    id: string;
    text: string;
    completed: boolean;
    date: string;
}

interface DailyTaskListProps {
    date: string;
    tasks: DailyTask[];
}

export function DailyTaskList({ date, tasks }: DailyTaskListProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [newTask, setNewTask] = useState("");
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
                body: JSON.stringify({ text: newTask, date }),
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

    const handleDelete = async (taskId: string) => {
        setDeletingId(taskId);
        try {
            await fetch("/api/tasks/daily/delete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: taskId }),
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
        <Card className="w-full border-zinc-800 bg-zinc-900/70">
            <CardHeader className="space-y-3">
                <div className="flex items-center justify-between">
                    <CardTitle>✅ 每日任务</CardTitle>
                    <div className="text-xs text-zinc-400">
                        {completedCount}/{tasks.length} 完成
                    </div>
                </div>
                <Input
                    type="date"
                    value={date}
                    onChange={(event) => handleDateChange(event.target.value)}
                    className="w-full max-w-[220px] bg-zinc-950/60 border-zinc-700"
                />
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="space-y-2">
                    {tasks.length === 0 && (
                        <div className="rounded-md border border-dashed border-zinc-700 px-3 py-5 text-center text-sm text-zinc-400">
                            当天还没有任务，先加一条吧。
                        </div>
                    )}

                    {tasks.map((task) => {
                        const inEdit = editingId === task.id;
                        const disabled = togglingId === task.id || deletingId === task.id || updating;

                        return (
                            <div key={task.id} className="rounded-md border border-zinc-800 bg-zinc-950/40 px-3 py-2">
                                <div className="flex items-start gap-2">
                                    <Checkbox
                                        id={`daily-${task.id}`}
                                        checked={task.completed}
                                        onCheckedChange={() => handleToggle(task)}
                                        disabled={disabled}
                                        className="mt-1 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                                    />

                                    <div className="flex-1 space-y-2">
                                        {inEdit ? (
                                            <Input
                                                value={editingText}
                                                onChange={(event) => setEditingText(event.target.value)}
                                                className="h-8 bg-zinc-900"
                                            />
                                        ) : (
                                            <label
                                                htmlFor={`daily-${task.id}`}
                                                className={`block text-sm ${task.completed ? "line-through text-zinc-500" : "text-zinc-100"}`}
                                            >
                                                {task.text}
                                            </label>
                                        )}

                                        <div className="flex gap-1">
                                            {inEdit ? (
                                                <>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-7 w-7"
                                                        onClick={saveEdit}
                                                        disabled={updating}
                                                    >
                                                        {updating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                                                    </Button>
                                                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={cancelEdit} disabled={updating}>
                                                        <X className="h-3.5 w-3.5" />
                                                    </Button>
                                                </>
                                            ) : (
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-7 w-7"
                                                    onClick={() => startEdit(task)}
                                                    disabled={disabled}
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </Button>
                                            )}

                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-7 w-7 text-destructive hover:bg-destructive/10"
                                                onClick={() => handleDelete(task.id)}
                                                disabled={disabled}
                                            >
                                                {deletingId === task.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-zinc-800">
                    <Input
                        value={newTask}
                        onChange={(event) => setNewTask(event.target.value)}
                        onKeyDown={(event) => event.key === "Enter" && handleAdd()}
                        className="bg-zinc-950/60"
                    />
                    <Button size="icon" onClick={handleAdd} disabled={adding}>
                        {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

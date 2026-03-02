"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface WeeklyFocusTask {
    id: string;
    text: string;
    completed: boolean;
}

export function WeeklyFocusList({ tasks }: { tasks: WeeklyFocusTask[] }) {
    const router = useRouter();
    const [newTask, setNewTask] = useState("");
    const [adding, setAdding] = useState(false);
    const [toggling, setToggling] = useState<string | null>(null);
    const [deleting, setDeleting] = useState<string | null>(null);
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
                body: JSON.stringify({ text: newTask }),
            });
            setNewTask("");
            router.refresh();
        } catch (error) {
            console.error(error);
        } finally {
            setAdding(false);
        }
    };

    const handleDelete = async (taskId: string) => {
        setDeleting(taskId);
        try {
            await fetch("/api/tasks/delete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: taskId }),
            });
            router.refresh();
        } catch (error) {
            console.error(error);
        } finally {
            setDeleting(null);
        }
    };

    return (
        <Card className="flex h-full w-full flex-col border-zinc-800 bg-zinc-900/70">
            <CardHeader className="space-y-3">
                <div className="flex items-center justify-between">
                    <CardTitle>🎯 本周焦点</CardTitle>
                    <div className="text-xs text-zinc-400">
                        {completedCount}/{tasks.length} 完成
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col space-y-3">
                <div className="flex-1 space-y-2">
                    {tasks.length === 0 && (
                        <div className="rounded-md border border-dashed border-zinc-700 px-3 py-5 text-center text-sm text-zinc-400">
                            本周焦点还是空的，先定 3-5 个最重要动作。
                        </div>
                    )}

                    {tasks.map((task) => {
                        const disabled = toggling === task.id || deleting === task.id;

                        return (
                            <div key={task.id} className="flex items-start justify-between gap-3 rounded-md border border-zinc-800 bg-zinc-950/40 px-3 py-2">
                                <div className="flex items-start gap-2">
                                    <Checkbox
                                        id={`weekly-${task.id}`}
                                        checked={task.completed}
                                        onCheckedChange={() => handleToggle(task)}
                                        disabled={disabled}
                                        className="mt-0.5 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                    />
                                    <label
                                        htmlFor={`weekly-${task.id}`}
                                        className={`text-sm ${task.completed ? "line-through text-zinc-500" : "text-zinc-100"}`}
                                    >
                                        {task.text}
                                    </label>
                                </div>

                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7 text-destructive hover:bg-destructive/10"
                                    onClick={() => handleDelete(task.id)}
                                    disabled={disabled}
                                >
                                    {deleting === task.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                                </Button>
                            </div>
                        );
                    })}
                </div>

                <div className="flex items-center gap-2 border-t border-zinc-800 pt-2">
                    <Input
                        value={newTask}
                        onChange={(event) => setNewTask(event.target.value)}
                        onKeyDown={(event) => event.key === "Enter" && handleAdd()}
                        className="bg-zinc-950/60"
                        placeholder="新增本周焦点"
                    />
                    <Button size="icon" onClick={handleAdd} disabled={adding}>
                        {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

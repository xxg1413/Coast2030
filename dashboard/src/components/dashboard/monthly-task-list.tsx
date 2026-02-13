"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface TaskItem {
    id: string;
    text: string;
    completed: boolean;
}

export function MonthlyTaskList({ tasks }: { tasks: TaskItem[] }) {
    const router = useRouter();
    const [toggling, setToggling] = useState<string | null>(null);
    const [newTask, setNewTask] = useState("");
    const [adding, setAdding] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);

    const handleToggle = async (task: TaskItem) => {
        setToggling(task.id);
        try {
            await fetch("/api/tasks/monthly/toggle", {
                method: "POST",
                body: JSON.stringify({ text: task.text, completed: !task.completed }),
            });
            router.refresh();
        } catch (e) {
            console.error(e);
        } finally {
            setToggling(null);
        }
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTask.trim()) return;
        setAdding(true);
        try {
            await fetch("/api/tasks/monthly/add", {
                method: "POST",
                body: JSON.stringify({ text: newTask }),
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
        <Card className="w-full h-full flex flex-col">
            <CardHeader>
                <CardTitle>📅 本月里程碑 (关键战役)</CardTitle>
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
                                    className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${task.completed ? "line-through text-muted-foreground" : ""
                                        }`}
                                >
                                    {task.text}
                                </label>
                            </div>
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
                    <p className="text-sm text-muted-foreground">本月暂无里程碑。</p>
                )}
            </div>

            <form onSubmit={handleAdd} className="mt-6 flex gap-2">
                <Input
                    placeholder="新增里程碑..."
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    className="bg-zinc-950/50"
                />
                <Button type="submit" size="icon" disabled={adding}>
                    {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                </Button>
            </form>
        </CardContent>
        </Card >
    );
}

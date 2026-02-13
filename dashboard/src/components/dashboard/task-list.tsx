"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface TaskItem {
    id: string;
    text: string;
    completed: boolean;
}

export function TaskList({ title, tasks }: { title: string, tasks: TaskItem[] }) {
    const router = useRouter();
    const [newTask, setNewTask] = useState("");
    const [loading, setLoading] = useState(false);
    const [toggling, setToggling] = useState<string | null>(null);

    const handleToggle = async (task: TaskItem) => {
        setToggling(task.id);
        try {
            await fetch("/api/tasks/toggle", {
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

    const handleAdd = async () => {
        if (!newTask.trim()) return;
        setLoading(true);
        try {
            await fetch("/api/tasks/add", {
                method: "POST",
                body: JSON.stringify({ text: newTask }),
            });
            setNewTask("");
            router.refresh();
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>📅 {title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {tasks.map((task) => (
                        <div key={task.id} className="flex items-start space-x-3">
                            <Checkbox
                                id={task.id}
                                checked={task.completed}
                                onCheckedChange={() => handleToggle(task)}
                                disabled={toggling === task.id}
                            />
                            <label
                                htmlFor={task.id}
                                className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${task.completed ? "line-through text-muted-foreground" : ""
                                    }`}
                            >
                                {task.text}
                            </label>
                        </div>
                    ))}

                    <div className="flex items-center space-x-2 pt-4 border-t border-zinc-800">
                        <Input
                            placeholder="新增任务..."
                            value={newTask}
                            onChange={(e) => setNewTask(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                        />
                        <Button size="icon" onClick={handleAdd} disabled={loading}>
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

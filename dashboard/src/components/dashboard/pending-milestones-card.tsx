import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TaskItem {
    id: string;
    text: string;
    completed: boolean;
}

export function PendingMilestonesCard({ month, tasks }: { month: string; tasks: TaskItem[] }) {
    const pending = tasks.filter((task) => !task.completed).slice(0, 5);

    return (
        <Card className="border-zinc-800 bg-zinc-900/60">
            <CardHeader className="pb-2">
                <CardTitle className="text-base">{month} 待收口事项</CardTitle>
            </CardHeader>
            <CardContent>
                {pending.length === 0 ? (
                    <div className="text-sm text-zinc-400">当前月份没有待收口事项。</div>
                ) : (
                    <div className="space-y-2">
                        {pending.map((task) => (
                            <div key={task.id} className="rounded-md border border-zinc-800 bg-zinc-950/50 px-3 py-2 text-sm text-zinc-200">
                                {task.text}
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

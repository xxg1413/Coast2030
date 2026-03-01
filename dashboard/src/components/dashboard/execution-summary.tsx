import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface SummaryItem {
    label: string;
    completed: number;
    total: number;
    accentClassName: string;
}

function getProgress(completed: number, total: number): number {
    if (total <= 0) return 0;
    return Math.round((completed / total) * 100);
}

function getStatusLabel(completed: number, total: number): string {
    if (total === 0) return "待建立";
    if (completed >= total) return "已完成";
    if (completed > 0) return "推进中";
    return "未开始";
}

export function ExecutionSummary({
    weekly,
    monthly,
    daily,
}: {
    weekly: SummaryItem;
    monthly: SummaryItem;
    daily: SummaryItem;
}) {
    const items = [weekly, monthly, daily];

    return (
        <Card className="border-zinc-800 bg-zinc-900/60">
            <CardHeader className="pb-2">
                <CardTitle className="text-base">执行概览</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {items.map((item) => {
                    const progress = getProgress(item.completed, item.total);

                    return (
                        <div key={item.label} className="space-y-2 rounded-lg border border-zinc-800 bg-zinc-950/50 p-3">
                            <div className="flex items-center justify-between gap-2">
                                <div>
                                    <div className="text-sm font-medium text-zinc-100">{item.label}</div>
                                    <div className="text-xs text-zinc-400">
                                        {item.completed}/{item.total} 完成
                                    </div>
                                </div>
                                <Badge variant="outline" className="border-zinc-700 text-zinc-300">
                                    {getStatusLabel(item.completed, item.total)}
                                </Badge>
                            </div>

                            <Progress
                                value={progress}
                                className="h-2 bg-zinc-800"
                                indicatorClassName={item.accentClassName}
                            />
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}

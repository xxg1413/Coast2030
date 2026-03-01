import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface Metric {
    label: string;
    monthly: number;
    yearToDate: number;
    yearlyTarget: number;
    progress: number;
    trend?: string;
}

function formatMoney(value: number) {
    return `¥${value.toLocaleString("zh-CN", { maximumFractionDigits: 2 })}`;
}

export function CoreMetricsGrid({ metrics }: { metrics: Metric[] }) {
    return (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => (
                <Card key={metric.label} className="border-zinc-800 bg-zinc-900/60">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">{metric.label}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-end justify-between gap-3">
                            <div>
                                <div className="text-xs text-zinc-500">本月</div>
                                <div className="mt-1 text-lg font-semibold text-zinc-100">{formatMoney(metric.monthly)}</div>
                            </div>
                            <div className="rounded-full border border-zinc-700 bg-zinc-950/70 px-2.5 py-1 text-xs text-zinc-300">
                                {metric.trend || "0%"}
                            </div>
                        </div>
                        <div className="text-xs text-zinc-400">
                            年累计 {formatMoney(metric.yearToDate)} / 目标 {formatMoney(metric.yearlyTarget)}
                        </div>
                        <Progress
                            value={Math.min(metric.progress, 100)}
                            className="h-2 bg-zinc-800"
                            indicatorClassName="bg-emerald-500"
                        />
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

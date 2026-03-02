import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { YEAR_TARGETS } from "@/lib/targets";

interface RetirementProgressProps {
    year: number;
    yearIncome: number;
}

export function RetirementProgress({ year, yearIncome }: RetirementProgressProps) {
    const yearTarget = YEAR_TARGETS[year] ?? 0;

    const yearPercentage = Math.min((yearIncome / yearTarget) * 100, 100);

    return (
        <Card className="border-zinc-800 bg-gradient-to-br from-zinc-900/90 via-zinc-900/70 to-zinc-950/80">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-sm text-zinc-400">{year} 年目标进度</p>
                        <p className="text-xl font-semibold mt-1">年累计 ¥{yearIncome.toLocaleString()}</p>
                    </div>
                    <div className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs text-emerald-300">
                        年目标 ¥{yearTarget.toLocaleString()}
                    </div>
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-5">
                <div>
                    <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="text-zinc-400">年度目标完成率</span>
                        <span className="font-medium">{yearPercentage.toFixed(2)}%</span>
                    </div>
                    <Progress value={yearPercentage} className="h-3 bg-zinc-800" indicatorClassName="bg-emerald-500" />
                </div>
            </CardContent>
        </Card>
    );
}

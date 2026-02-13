import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RetirementProgressProps {
    year: number;
    yearIncome: number;
    lifetimeIncome: number;
}

export function RetirementProgress({ year, yearIncome, lifetimeIncome }: RetirementProgressProps) {
    const yearTarget = 3000000;
    const coastTarget = 5000000;

    const yearPercentage = Math.min((yearIncome / yearTarget) * 100, 100);
    const coastPercentage = Math.min((lifetimeIncome / coastTarget) * 100, 100);

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

                <div className="border-t border-zinc-800 pt-4">
                    <div className="mb-2 flex items-center justify-between text-xs">
                        <span className="text-zinc-400">Coast 2030 终局目标</span>
                        <span className="text-zinc-300">{coastPercentage.toFixed(2)}%</span>
                    </div>
                    <Progress value={coastPercentage} className="h-1.5 bg-zinc-900" indicatorClassName="bg-blue-500" />
                    <p className="mt-2 text-[11px] text-zinc-500">
                        全部累计 ¥{lifetimeIncome.toLocaleString()} / 目标 ¥{coastTarget.toLocaleString()}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}

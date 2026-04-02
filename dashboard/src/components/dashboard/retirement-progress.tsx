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
        <Card className="border-stone-200 bg-white/78 shadow-[0_12px_40px_rgba(84,61,31,0.08)]">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-sm text-stone-500">{year} 年目标进度</p>
                        <p className="text-xl font-semibold mt-1">年累计 ¥{yearIncome.toLocaleString()}</p>
                    </div>
                    <div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs text-emerald-700">
                        年目标 ¥{yearTarget.toLocaleString()}
                    </div>
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-5">
                <div>
                    <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="text-stone-500">年度目标完成率</span>
                        <span className="font-medium">{yearPercentage.toFixed(2)}%</span>
                    </div>
                    <Progress value={yearPercentage} className="h-3 bg-stone-200" indicatorClassName="bg-emerald-500" />
                </div>
            </CardContent>
        </Card>
    );
}

import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RetirementProgressProps {
    current: number;
}

export function RetirementProgress({ current }: RetirementProgressProps) {
    const target2026 = 3000000; // 300w
    const target2030 = 5000000; // 500w

    const percentage2026 = Math.min((current / target2026) * 100, 100);
    const percentage2030 = Math.min((current / target2030) * 100, 100);

    return (
        <Card className="border-l-4 border-l-emerald-500">
            <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold flex justify-between items-center">
                    <span>🚀 2026 年度目标 (现金流验证)</span>
                    <span className="text-emerald-400">¥{current.toLocaleString()}</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* 2026 Progress */}
                <div>
                    <div className="flex items-center justify-between mb-2 text-sm">
                        <span className="text-zinc-400">目标: ¥{target2026.toLocaleString()}</span>
                        <span className="text-white font-medium">{percentage2026.toFixed(2)}%</span>
                    </div>
                    <Progress value={percentage2026} className="h-3 bg-zinc-800" indicatorClassName="bg-emerald-500" />
                </div>

                {/* 2030 Progress */}
                <div className="pt-2 border-t border-zinc-800">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">🏝️ Coast 2030 退休进度</span>
                        <span className="text-xs text-muted-foreground">{percentage2030.toFixed(4)}%</span>
                    </div>
                    <Progress value={percentage2030} className="h-1.5 bg-zinc-900" indicatorClassName="bg-blue-600" />
                    <p className="text-[10px] text-zinc-600 text-right mt-1">
                        终点: ¥{target2030.toLocaleString()}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}

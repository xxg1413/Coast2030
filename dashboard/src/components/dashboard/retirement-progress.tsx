import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { YEAR_TARGETS } from "@/lib/targets";
import { TrendingUp, Target, Calendar, PiggyBank } from "lucide-react";

interface RetirementProgressProps {
  year: number;
  yearIncome: number;
}

function formatMoney(value: number): string {
  return `¥${value.toLocaleString("zh-CN", { maximumFractionDigits: 0 })}`;
}

export function RetirementProgress({ year, yearIncome }: RetirementProgressProps) {
  const yearTarget = YEAR_TARGETS[year] ?? 0;
  const yearPercentage = Math.min((yearIncome / yearTarget) * 100, 100);
  const gap = Math.max(yearTarget - yearIncome, 0);

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const monthsRemaining = Math.max(12 - currentMonth + 1, 1);
  const monthlyNeeded = gap > 0 ? gap / monthsRemaining : 0;

  const stats = [
    {
      label: "年度目标",
      value: formatMoney(yearTarget),
      icon: Target,
      iconClass: "text-emerald-600",
      bgClass: "bg-emerald-50",
    },
    {
      label: "距离目标",
      value: formatMoney(gap),
      icon: TrendingUp,
      iconClass: "text-blue-600",
      bgClass: "bg-blue-50",
    },
    {
      label: "月均还需",
      value: formatMoney(monthlyNeeded),
      icon: Calendar,
      iconClass: "text-amber-600",
      bgClass: "bg-amber-50",
    },
    {
      label: "当前进度",
      value: `${yearPercentage.toFixed(1)}%`,
      icon: PiggyBank,
      iconClass: "text-stone-600",
      bgClass: "bg-stone-100",
    },
  ];

  return (
    <Card className="border-stone-200 bg-white/78 shadow-[0_8px_30px_rgba(84,61,31,0.06)]">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-stone-500">{year} 年目标进度</p>
            <p className="text-xl font-semibold mt-1">{formatMoney(yearIncome)}</p>
          </div>
          <div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs text-emerald-700">
            年目标 {formatMoney(yearTarget)}
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

        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="flex items-center gap-2.5 rounded-lg border border-stone-200 bg-stone-50 px-3 py-2.5"
              >
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${stat.bgClass}`}>
                  <Icon className={`h-4 w-4 ${stat.iconClass}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-stone-500">{stat.label}</p>
                  <p className="text-sm font-semibold text-stone-900 truncate">{stat.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

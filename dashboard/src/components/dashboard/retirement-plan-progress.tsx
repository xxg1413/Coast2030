import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Calendar } from "lucide-react";
import { formatMoney } from "@/lib/api";

interface RetirementPlanProgressProps {
  years: number[];
  incomes: number[];
  targets: Record<number, number>;
}

export function RetirementPlanProgress({ years, incomes, targets }: RetirementPlanProgressProps) {
  const totalTarget = years.reduce((sum, year) => sum + (targets[year] || 0), 0);
  const totalIncome = incomes.reduce((sum, income) => sum + income, 0);
  const totalProgress = totalTarget > 0 ? Math.min((totalIncome / totalTarget) * 100, 100) : 0;
  const activeYearIndex = years.findIndex((year) => targets[year] > 0 && incomes[years.indexOf(year)] < targets[year]);
  const currentYear = activeYearIndex >= 0 ? years[activeYearIndex] : years[years.length - 1];

  return (
    <Card className="border-stone-200 bg-white/80 shadow-[0_8px_30px_rgba(84,61,31,0.06)]">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">5年退休计划进度</CardTitle>
            <p className="mt-1 text-sm text-stone-500">
              2026-2030 · 总目标 {formatMoney(totalTarget)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-semibold text-stone-900">{totalProgress.toFixed(1)}%</p>
            <p className="text-xs text-stone-500">整体完成度</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-stone-600">5年累计收入</span>
            <span className="font-medium text-stone-900">
              {formatMoney(totalIncome)} / {formatMoney(totalTarget)}
            </span>
          </div>
          <Progress value={totalProgress} className="h-2 bg-stone-200" indicatorClassName="bg-emerald-500" />
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-stone-600">
            <Calendar className="h-4 w-4" />
            <span>年度进度明细</span>
          </div>
          <div className="space-y-2">
            {years.map((year, index) => {
              const income = incomes[index] || 0;
              const target = targets[year] || 0;
              const progress = target > 0 ? Math.min((income / target) * 100, 100) : 0;
              const isCurrentYear = year === currentYear;
              const isCompleted = progress >= 100 && target > 0;
              const isFuture = target === 0;

              return (
                <div key={year} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${isCurrentYear ? "text-emerald-700" : "text-stone-700"}`}>
                        {year}
                      </span>
                      {isCompleted && (
                        <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] text-emerald-700">
                          已达成
                        </span>
                      )}
                      {isCurrentYear && !isCompleted && (
                        <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] text-blue-700">
                          进行中
                        </span>
                      )}
                      {isFuture && (
                        <span className="rounded-full bg-stone-100 px-1.5 py-0.5 text-[10px] text-stone-500">
                          待开启
                        </span>
                      )}
                    </div>
                    <span className="text-stone-500">
                      {formatMoney(income)} / {formatMoney(target)}
                    </span>
                  </div>
                  <div className="relative h-1.5 rounded-full bg-stone-200 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full transition-all ${
                        isCompleted ? "bg-emerald-500" : isCurrentYear ? "bg-blue-500" : "bg-stone-400"
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 pt-2 border-t border-stone-200">
          <div className="text-center">
            <p className="text-xs text-stone-500">已达成年份</p>
            <p className="mt-1 text-lg font-semibold text-emerald-700">
              {years.filter((y, i) => incomes[i] >= (targets[y] || 0) && targets[y] > 0).length} / {years.length}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-stone-500">当前年份</p>
            <p className="mt-1 text-lg font-semibold text-blue-700">{currentYear}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-stone-500">距离总目标</p>
            <p className="mt-1 text-lg font-semibold text-stone-700">
              {formatMoney(Math.max(totalTarget - totalIncome, 0))}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

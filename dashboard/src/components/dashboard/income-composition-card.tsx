import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getIncomeTypeConfig } from "@/lib/income-types";
import type { IncomeCompositionItem } from "@/lib/api";

interface IncomeCompositionCardProps {
  monthlyComposition: IncomeCompositionItem[];
  yearlyComposition: IncomeCompositionItem[];
}

function formatMoney(value: number): string {
  return `¥${value.toLocaleString("zh-CN")}`;
}

export function IncomeCompositionCard({
  monthlyComposition,
  yearlyComposition,
}: IncomeCompositionCardProps) {
  const monthlyTotal = monthlyComposition.reduce((sum, item) => sum + item.amount, 0);
  const yearlyTotal = yearlyComposition.reduce((sum, item) => sum + item.amount, 0);

  return (
    <Card className="border-stone-200 bg-white/78 shadow-[0_8px_30px_rgba(84,61,31,0.06)]">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">收入来源对比</CardTitle>
        <p className="text-sm text-stone-500">
          本月 {formatMoney(monthlyTotal)} · 年度 {formatMoney(yearlyTotal)}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-medium text-stone-500 mb-2">本月构成</p>
            <div className="space-y-2">
              {monthlyComposition.map((item) => {
                const config = getIncomeTypeConfig(item.type);
                return (
                  <div key={item.type} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className={`h-1.5 w-1.5 rounded-full ${config.dotClass}`} />
                        <span className="text-stone-600">{config.label}</span>
                      </div>
                      <span className="text-stone-500">
                        {formatMoney(item.amount)}
                      </span>
                    </div>
                    <div className="h-1.5 rounded bg-stone-100 overflow-hidden">
                      <div
                        className={`h-1.5 rounded ${config.barClass}`}
                        style={{ width: `${Math.max(item.percentage, 1)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              {monthlyComposition.length === 0 && (
                <p className="text-xs text-stone-400">本月暂无收入</p>
              )}
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-stone-500 mb-2">年度构成</p>
            <div className="space-y-2">
              {yearlyComposition.map((item) => {
                const config = getIncomeTypeConfig(item.type);
                return (
                  <div key={item.type} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className={`h-1.5 w-1.5 rounded-full ${config.dotClass}`} />
                        <span className="text-stone-600">{config.label}</span>
                      </div>
                      <span className="text-stone-500">
                        {formatMoney(item.amount)}
                      </span>
                    </div>
                    <div className="h-1.5 rounded bg-stone-100 overflow-hidden">
                      <div
                        className={`h-1.5 rounded ${config.barClass}`}
                        style={{ width: `${Math.max(item.percentage, 1)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              {yearlyComposition.length === 0 && (
                <p className="text-xs text-stone-400">年度暂无收入</p>
              )}
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-stone-200">
          <p className="text-xs text-stone-500">
            💡 提示：保持收入来源多元化，降低单一渠道风险。
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

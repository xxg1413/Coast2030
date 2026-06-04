import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface YearData {
  year: number;
  target: number;
  income: number;
  progress: number;
  isCompleted: boolean;
  isCurrent: boolean;
  isFuture: boolean;
}

interface FiveYearRoadmapProps {
  yearData: YearData[];
  totalTarget: number;
  totalIncome: number;
  totalProgress: number;
}

function formatMoney(value: number): string {
  if (value >= 10000) {
    return `${(value / 10000).toFixed(0)}万`;
  }
  return `${value.toLocaleString("zh-CN")}`;
}

export function FiveYearRoadmap({ yearData, totalTarget, totalIncome, totalProgress }: FiveYearRoadmapProps) {
  return (
    <Card className="border-stone-200 bg-white/80 shadow-[0_8px_30px_rgba(84,61,31,0.06)]">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">5年收入路线图</CardTitle>
            <p className="mt-1 text-sm text-stone-500">
              2026-2030 · 累计目标 {formatMoney(totalTarget)} · 当前 {formatMoney(totalIncome)}
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
          <Progress value={Math.min(totalProgress, 100)} className="h-2 bg-stone-200" indicatorClassName="bg-blue-500" />
        </div>

        <div className="space-y-3">
          <p className="text-sm text-stone-500">年度目标进度</p>
          <div className="grid grid-cols-5 gap-2">
            {yearData.map((data) => {
              const barHeight = data.target > 0 ? Math.min((data.income / data.target) * 100, 100) : 0;

              return (
                <div key={data.year} className="flex flex-col items-center gap-2">
                  <div className="flex h-32 w-full items-end justify-center rounded-lg bg-stone-100 p-1">
                    <div className="relative w-full rounded bg-stone-200">
                      <div
                        className={`rounded transition-all ${
                          data.isCompleted
                            ? "bg-emerald-500"
                            : data.isCurrent
                              ? "bg-blue-500"
                              : "bg-stone-300"
                        }`}
                        style={{ height: `${Math.max(barHeight, data.target > 0 ? 2 : 0)}%` }}
                      />
                      {data.isCompleted && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs font-semibold text-white">✓</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="w-full text-center">
                    <p className="text-xs font-semibold text-stone-700">{data.year}</p>
                    <p className="text-[10px] text-stone-500">{formatMoney(data.target)}</p>
                    {data.isCurrent && data.progress > 0 && (
                      <p className="text-[10px] text-blue-600">{data.progress.toFixed(0)}%</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-stone-500 border-t border-stone-200 pt-3">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              已达成
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              进行中
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-stone-300" />
              待开启
            </span>
          </div>
          <span>
            已完成 {yearData.filter((d) => d.isCompleted).length} / {yearData.length} 年
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

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
    <Card className="border-stone-200 bg-white/80 py-0 shadow-[0_8px_30px_rgba(84,61,31,0.06)]">
      <CardHeader className="pb-4 pt-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl">5 年收入路线图</CardTitle>
            <p className="text-sm text-stone-500">
              2026-2030 · 当前 {formatMoney(totalIncome)} / 累计目标 {formatMoney(totalTarget)}
            </p>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 md:text-right">
            <p className="text-2xl font-semibold text-stone-950">{totalProgress.toFixed(1)}%</p>
            <p className="text-sm text-stone-500">累计完成度</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-stone-600">5 年累计收入</span>
            <span className="font-medium text-stone-900">
              {formatMoney(totalIncome)} / {formatMoney(totalTarget)}
            </span>
          </div>
          <Progress value={Math.min(totalProgress, 100)} className="h-2 bg-stone-200" indicatorClassName="bg-emerald-600" />
        </div>

        <div className="rounded-2xl border border-stone-200 bg-stone-50/80 p-4">
          <div className="relative hidden md:block">
            <div className="absolute left-[10%] right-[10%] top-4 h-px bg-stone-300" />
            <div className="grid grid-cols-5 gap-3">
              {yearData.map((data) => {
                const markerClassName = data.isCompleted
                  ? "border-emerald-600 bg-emerald-600"
                  : data.isCurrent
                    ? "border-emerald-600 bg-white"
                    : "border-stone-300 bg-white";

                return (
                  <div key={data.year} className="relative">
                    <div className="mx-auto h-8 w-8 rounded-full border-4 border-stone-50 bg-stone-50">
                      <div className={`h-full w-full rounded-full border-2 ${markerClassName}`} />
                    </div>
                    <div className="mt-4 rounded-xl border border-stone-200 bg-white p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-stone-950">{data.year}</p>
                        <p className={`text-xs ${data.isCurrent ? "text-emerald-700" : "text-stone-500"}`}>
                          {data.isCompleted ? "已达成" : data.isCurrent ? "进行中" : "待开启"}
                        </p>
                      </div>
                      <p className="mt-3 text-lg font-semibold text-stone-950">{formatMoney(data.income)}</p>
                      <p className="mt-1 text-xs text-stone-500">目标 {formatMoney(data.target)}</p>
                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-stone-200">
                        <div
                          className={`h-full rounded-full ${data.isFuture ? "bg-stone-300" : "bg-emerald-600"}`}
                          style={{ width: `${Math.min(data.progress, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-3 md:hidden">
            {yearData.map((data) => (
              <div key={data.year} className="rounded-xl border border-stone-200 bg-white p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-stone-950">{data.year}</p>
                    <p className="mt-1 text-sm text-stone-500">{formatMoney(data.income)} / {formatMoney(data.target)}</p>
                  </div>
                  <p className="text-sm font-semibold text-stone-900">{data.progress.toFixed(1)}%</p>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-stone-200">
                  <div
                    className={`h-full rounded-full ${data.isFuture ? "bg-stone-300" : "bg-emerald-600"}`}
                    style={{ width: `${Math.min(data.progress, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-200 pb-5 pt-3 text-xs text-stone-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-600" />
              已达成 / 进行中
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

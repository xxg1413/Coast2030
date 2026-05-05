import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";

interface SummaryItem {
  label: string;
  completed: number;
  total: number;
  accentClassName: string;
}

function getProgress(completed: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((completed / total) * 100);
}

function getStatusLabel(completed: number, total: number): string {
  if (total === 0) return "待建立";
  if (completed >= total) return "已完成";
  if (completed > 0) return "推进中";
  return "未开始";
}

function getStatusIcon(completed: number, total: number) {
  if (total === 0) return <Circle className="h-3.5 w-3.5 text-stone-400" />;
  if (completed >= total) return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />;
  if (completed > 0) return <Loader2 className="h-3.5 w-3.5 text-amber-600" />;
  return <Circle className="h-3.5 w-3.5 text-stone-400" />;
}

export function ExecutionSummary({
  weekly,
  monthly,
  daily,
}: {
  weekly: SummaryItem;
  monthly: SummaryItem;
  daily: SummaryItem;
}) {
  const items = [weekly, monthly, daily];

  return (
    <Card className="border-stone-200 bg-white/78 shadow-[0_8px_30px_rgba(84,61,31,0.06)]">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">执行概览</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-3">
        {items.map((item) => {
          const progress = getProgress(item.completed, item.total);

          return (
            <div key={item.label} className="space-y-2 rounded-lg border border-stone-200 bg-stone-50 p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-stone-900">{item.label}</div>
                  <div className="text-xs text-stone-500">
                    {item.completed}/{item.total} 完成
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className="border-stone-200 bg-white text-stone-600 gap-1 shrink-0"
                >
                  {getStatusIcon(item.completed, item.total)}
                  {getStatusLabel(item.completed, item.total)}
                </Badge>
              </div>

              <Progress
                value={progress}
                className="h-2 bg-stone-200"
                indicatorClassName={item.accentClassName}
              />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

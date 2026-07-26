"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, PlusCircle, TrendingUp, TrendingDown, Wallet, Landmark, CreditCard, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "./empty-state";
import type { AssetSnapshot } from "@/lib/api";

interface AssetProgressCardProps {
  snapshots: AssetSnapshot[];
  target: number;
  defaultDate: string;
  milestones?: Record<number, number>;
}

interface ChartPoint {
  id: string;
  label: string;
  value: number;
}

function formatMoney(value: number): string {
  return `¥${value.toLocaleString("zh-CN", { maximumFractionDigits: 2 })}`;
}

function formatChartLabel(date: string): string {
  const [, month = "--", day = "--"] = date.split("-");
  return `${month}/${day}`;
}

function buildNetWorthChartPoints(snapshots: AssetSnapshot[]): ChartPoint[] {
  return [...snapshots]
    .slice(0, 6)
    .reverse()
    .map((snapshot) => ({
      id: snapshot.id,
      label: formatChartLabel(snapshot.snapshotDate),
      value: snapshot.netWorth,
    }));
}

export function AssetProgressCard({ snapshots, target, defaultDate, milestones }: AssetProgressCardProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snapshotDate, setSnapshotDate] = useState(defaultDate);
  const [totalAssets, setTotalAssets] = useState("");
  const [totalLiabilities, setTotalLiabilities] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState(false);

  const latest = snapshots[0];
  const previous = snapshots[1];
  const currentNetWorth = latest?.netWorth || 0;
  const currentAssets = latest?.totalAssets || 0;
  const currentLiabilities = latest?.totalLiabilities || 0;
  const progress = target > 0 ? Math.min(Math.max((currentNetWorth / target) * 100, 0), 100) : 0;
  const gap = Math.max(target - currentNetWorth, 0);
  const delta = latest && previous ? latest.netWorth - previous.netWorth : 0;
  const chartPoints = buildNetWorthChartPoints(snapshots);
  const minValue = chartPoints.length ? Math.min(...chartPoints.map((point) => point.value)) : 0;
  const maxValue = chartPoints.length ? Math.max(...chartPoints.map((point) => point.value)) : 0;
  const valueRange = Math.max(maxValue - minValue, 1);
  const chartWidth = 520;
  const chartHeight = 180;
  const paddingBottom = 12;

  const chartCoordinates = chartPoints.map((point, index) => {
    const x = chartPoints.length === 1 ? chartWidth / 2 : (index / (chartPoints.length - 1)) * chartWidth;
    const normalizedY = (point.value - minValue) / valueRange;
    const y = chartHeight - normalizedY * (chartHeight - paddingBottom * 2) - paddingBottom;
    return { ...point, x, y };
  });

  // Line path
  const chartPath = chartCoordinates
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(" ");

  // Area fill path (line + bottom corners)
  const areaPath =
    chartCoordinates.length > 0
      ? `${chartPath} L ${chartCoordinates[chartCoordinates.length - 1].x.toFixed(2)} ${chartHeight} L ${chartCoordinates[0].x.toFixed(2)} ${chartHeight} Z`
      : "";

  const handleSave = async () => {
    const assetsValue = Number(totalAssets || 0);
    const liabilitiesValue = Number(totalLiabilities || 0);
    const netWorth = assetsValue - liabilitiesValue;

    if (!snapshotDate || totalAssets === "" || !Number.isFinite(assetsValue) || !Number.isFinite(liabilitiesValue)) {
      setError(true);
      return;
    }

    setLoading(true);
    setError(false);
    try {
      const response = await fetch("/api/assets/snapshot/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          snapshotDate,
          totalAssets: assetsValue,
          totalLiabilities: liabilitiesValue,
          netWorth,
          notes: notes.trim(),
        }),
      });
      if (!response.ok) {
        throw new Error(`Asset snapshot save failed: ${response.status}`);
      }

      setOpen(false);
      setSnapshotDate(defaultDate);
      setTotalAssets("");
      setTotalLiabilities("");
      setNotes("");
      router.refresh();
    } catch (error) {
      console.error(error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const statItems = [
    { label: "当前净资产", value: formatMoney(currentNetWorth), icon: Wallet },
    { label: "总资产", value: formatMoney(currentAssets), icon: Landmark },
    { label: "总负债", value: formatMoney(currentLiabilities), icon: CreditCard },
    { label: "距离目标", value: formatMoney(gap), icon: Target },
  ];

  return (
    <Card className="glass-panel py-0">
      <CardHeader className="pb-2">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm text-stone-500">2030 资产目标进度</p>
            <CardTitle className="mt-1 text-xl">{formatMoney(currentNetWorth)}</CardTitle>
            <p className="mt-2 text-sm text-stone-500">
              {latest ? `最新快照 ${latest.snapshotDate}` : "还没有资产快照，先录入第一条。"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="coast-status coast-status--strong">
              目标 {formatMoney(target)}
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <PlusCircle className="h-4 w-4" />
                  录入快照
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[520px]">
                <DialogHeader>
                  <DialogTitle>录入资产快照</DialogTitle>
                  <DialogDescription>
                    每月记录一次总资产、总负债和备注，用净资产跟踪 2030 年 500 万目标。
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="snapshot-date">日期</Label>
                    <Input
                      id="snapshot-date"
                      type="date"
                      value={snapshotDate}
                      onChange={(event) => setSnapshotDate(event.target.value)}
                      aria-invalid={error && !snapshotDate}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="total-assets">总资产</Label>
                    <Input
                      id="total-assets"
                      type="number"
                      min="0"
                      step="1000"
                      value={totalAssets}
                      onChange={(event) => setTotalAssets(event.target.value)}
                      placeholder="例如：150000"
                      aria-invalid={error && totalAssets === ""}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="total-liabilities">总负债</Label>
                    <Input
                      id="total-liabilities"
                      type="number"
                      min="0"
                      step="1000"
                      value={totalLiabilities}
                      onChange={(event) => setTotalLiabilities(event.target.value)}
                      placeholder="例如：20000"
                    />
                  </div>
                  <div className="coast-asset-preview">
                    当前净资产预览：{formatMoney(Number(totalAssets || 0) - Number(totalLiabilities || 0))}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="asset-notes">备注</Label>
                    <Textarea
                      id="asset-notes"
                      value={notes}
                      onChange={(event) => setNotes(event.target.value)}
                      placeholder="例如：本月新加仓 ETF，信用卡已还清。"
                      rows={4}
                    />
                  </div>
                  <p className="min-h-5 text-sm text-red-700" role="alert" aria-live="polite">
                    {error ? "资产快照未保存。请检查金额和日期后重试。" : ""}
                  </p>
                </div>
                <DialogFooter>
                  <Button
                    onClick={handleSave}
                    disabled={loading || !snapshotDate || totalAssets === "" || Number(totalAssets || 0) < 0 || Number(totalLiabilities || 0) < 0}
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    保存快照
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="coast-asset-stats">
          {statItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="coast-asset-stat"
              >
                <div>
                  <Icon />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-stone-500">{item.label}</p>
                  <p className="text-sm font-semibold text-stone-900 truncate">{item.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-stone-500">目标完成率</span>
            <span className="font-medium">{progress.toFixed(2)}%</span>
          </div>
          <Progress value={progress} className="h-3 bg-stone-200" indicatorClassName="bg-cyan-700" />
        </div>

        {milestones && (
          <div className="coast-asset-milestones">
            <p className="text-sm font-medium text-stone-900 mb-3">年度净资产里程碑</p>
            <div className="grid grid-cols-5 gap-2">
              {Object.entries(milestones).map(([year, milestone]) => {
                const currentYear = new Date().getFullYear();
                const isCurrent = Number(year) === currentYear;
                const achieved = currentNetWorth >= milestone;

                return (
                  <div key={year} className="text-center">
                    <p className="text-xs text-stone-500">{year}</p>
                    <p className={`text-sm font-semibold ${
                      achieved ? "text-emerald-600" : isCurrent ? "text-blue-600" : "text-stone-700"
                    }`}>
                      {milestone >= 10000 ? `${milestone / 10000}万` : milestone}
                    </p>
                    <div className={`mt-1 h-1 rounded-full ${
                      achieved ? "bg-emerald-500" : isCurrent ? "bg-blue-500" : "bg-stone-300"
                    }`} />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="coast-asset-grid">
          <div className="coast-asset-panel">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-stone-900">净资产趋势</p>
              <span className={`flex items-center gap-1 text-sm ${delta >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                {delta >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                {latest && previous ? `${delta >= 0 ? "+" : ""}${formatMoney(delta)}` : "暂无对比"}
              </span>
            </div>
            <div className="mt-4">
              {chartCoordinates.length >= 2 ? (
                <div className="space-y-3">
                  <div className="coast-asset-chart">
                    <svg
                      viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                      className="h-40 w-full overflow-visible"
                      role="img"
                      aria-label="最近六次净资产快照趋势"
                    >
                      <line x1="0" y1={chartHeight - paddingBottom} x2={chartWidth} y2={chartHeight - paddingBottom} stroke="var(--color-rule)" strokeWidth="1" />
                      {areaPath && (
                        <path d={areaPath} fill="var(--color-accent-soft)" />
                      )}
                      <path
                        d={chartPath}
                        fill="none"
                        stroke="var(--color-accent)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {chartCoordinates.map((point) => (
                        <g key={point.id}>
                          <circle cx={point.x} cy={point.y} r="4.5" fill="var(--color-paper-2)" stroke="var(--color-accent)" strokeWidth="2" />
                        </g>
                      ))}
                    </svg>
                  </div>
                  <div className="flex items-start justify-between gap-2 text-xs text-stone-500">
                    {chartCoordinates.map((point) => (
                      <div key={point.id} className="min-w-0 flex-1 text-center">
                        <div>{point.label}</div>
                        <div className="mt-1 text-stone-700">{formatMoney(point.value)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <EmptyState message="至少需要两条资产快照，才能显示净资产趋势。" />
              )}
            </div>
          </div>

          <div className="coast-asset-panel">
            <p className="text-sm font-medium text-stone-900">最近快照</p>
            <div className="mt-3 space-y-2">
              {snapshots.length ? (
                snapshots.map((snapshot) => (
                  <div key={snapshot.id} className="coast-snapshot-row">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-stone-700">{snapshot.snapshotDate}</span>
                      <span className="font-medium text-stone-900">{formatMoney(snapshot.netWorth)}</span>
                    </div>
                    {snapshot.notes ? (
                      <div className="mt-1 line-clamp-2 text-xs text-stone-500">{snapshot.notes}</div>
                    ) : null}
                  </div>
                ))
              ) : (
                <EmptyState message="还没有资产快照。" />
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, PlusCircle } from "lucide-react";
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
import type { AssetSnapshot } from "@/lib/api";

interface AssetProgressCardProps {
    snapshots: AssetSnapshot[];
    target: number;
    defaultDate: string;
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

export function AssetProgressCard({ snapshots, target, defaultDate }: AssetProgressCardProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [snapshotDate, setSnapshotDate] = useState(defaultDate);
    const [totalAssets, setTotalAssets] = useState("");
    const [totalLiabilities, setTotalLiabilities] = useState("");
    const [notes, setNotes] = useState("");

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
    const chartPath = chartPoints
        .map((point, index) => {
            const x = chartPoints.length === 1 ? chartWidth / 2 : (index / (chartPoints.length - 1)) * chartWidth;
            const normalizedY = (point.value - minValue) / valueRange;
            const y = chartHeight - normalizedY * (chartHeight - 24) - 12;
            return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
        })
        .join(" ");
    const chartCoordinates = chartPoints.map((point, index) => {
        const x = chartPoints.length === 1 ? chartWidth / 2 : (index / (chartPoints.length - 1)) * chartWidth;
        const normalizedY = (point.value - minValue) / valueRange;
        const y = chartHeight - normalizedY * (chartHeight - 24) - 12;
        return { ...point, x, y };
    });

    const handleSave = async () => {
        const assetsValue = Number(totalAssets || 0);
        const liabilitiesValue = Number(totalLiabilities || 0);
        const netWorth = assetsValue - liabilitiesValue;

        if (!snapshotDate || totalAssets === "" || !Number.isFinite(assetsValue) || !Number.isFinite(liabilitiesValue)) {
            return;
        }

        setLoading(true);
        try {
            await fetch("/api/assets/snapshot/add", {
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

            setOpen(false);
            setSnapshotDate(defaultDate);
            setTotalAssets("");
            setTotalLiabilities("");
            setNotes("");
            router.refresh();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="border-stone-200 bg-white/80 shadow-[0_18px_50px_rgba(84,61,31,0.10)]">
            <CardHeader className="pb-3">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                        <p className="text-sm text-stone-500">2030 资产目标进度</p>
                        <CardTitle className="mt-1 text-2xl">{formatMoney(currentNetWorth)}</CardTitle>
                        <p className="mt-2 text-sm text-stone-500">
                            {latest ? `最新快照 ${latest.snapshotDate}` : "还没有资产快照，先录入第一条。"}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs text-blue-700">
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
                                        每月记录一次总资产、总负债和备注，用净资产跟踪 2030 年 1000 万目标。
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="snapshot-date" className="text-right">日期</Label>
                                        <Input
                                            id="snapshot-date"
                                            type="date"
                                            value={snapshotDate}
                                            onChange={(event) => setSnapshotDate(event.target.value)}
                                            className="col-span-3"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="total-assets" className="text-right">总资产</Label>
                                        <Input
                                            id="total-assets"
                                            type="number"
                                            min="0"
                                            step="1000"
                                            value={totalAssets}
                                            onChange={(event) => setTotalAssets(event.target.value)}
                                            className="col-span-3"
                                            placeholder="例如：150000"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="total-liabilities" className="text-right">总负债</Label>
                                        <Input
                                            id="total-liabilities"
                                            type="number"
                                            min="0"
                                            step="1000"
                                            value={totalLiabilities}
                                            onChange={(event) => setTotalLiabilities(event.target.value)}
                                            className="col-span-3"
                                            placeholder="例如：20000"
                                        />
                                    </div>
                                    <div className="rounded-lg border border-stone-200 bg-[#fffaf1] p-3 text-sm text-stone-700">
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
            <CardContent className="space-y-5">
                <div className="grid gap-3 md:grid-cols-4">
                    <div className="rounded-md border border-stone-200 bg-[#fffaf1] p-3">
                        <p className="text-xs text-stone-500">当前净资产</p>
                        <p className="mt-1 text-lg font-semibold">{formatMoney(currentNetWorth)}</p>
                    </div>
                    <div className="rounded-md border border-stone-200 bg-[#fffaf1] p-3">
                        <p className="text-xs text-stone-500">总资产</p>
                        <p className="mt-1 text-lg font-semibold">{formatMoney(currentAssets)}</p>
                    </div>
                    <div className="rounded-md border border-stone-200 bg-[#fffaf1] p-3">
                        <p className="text-xs text-stone-500">总负债</p>
                        <p className="mt-1 text-lg font-semibold">{formatMoney(currentLiabilities)}</p>
                    </div>
                    <div className="rounded-md border border-stone-200 bg-[#fffaf1] p-3">
                        <p className="text-xs text-stone-500">距离目标</p>
                        <p className="mt-1 text-lg font-semibold">{formatMoney(gap)}</p>
                    </div>
                </div>

                <div>
                    <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="text-stone-500">目标完成率</span>
                        <span className="font-medium">{progress.toFixed(2)}%</span>
                    </div>
                    <Progress value={progress} className="h-3 bg-stone-200" indicatorClassName="bg-blue-500" />
                </div>

                <div className="grid gap-3 md:grid-cols-[1.2fr_0.8fr]">
                    <div className="rounded-lg border border-stone-200 bg-[#fffaf1] p-4">
                        <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-medium text-stone-900">净资产趋势</p>
                            <span className={`text-sm ${delta >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                                {latest && previous ? `${delta >= 0 ? "+" : ""}${formatMoney(delta)}` : "暂无对比"}
                            </span>
                        </div>
                        <div className="mt-4">
                            {chartCoordinates.length >= 2 ? (
                                <div className="space-y-3">
                                    <div className="rounded-lg border border-stone-200 bg-white p-3">
                                        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="h-44 w-full overflow-visible">
                                            <defs>
                                                <linearGradient id="net-worth-line" x1="0%" y1="0%" x2="100%" y2="0%">
                                                    <stop offset="0%" stopColor="#60a5fa" />
                                                    <stop offset="100%" stopColor="#34d399" />
                                                </linearGradient>
                                            </defs>
                                            <line x1="0" y1={chartHeight - 12} x2={chartWidth} y2={chartHeight - 12} stroke="#d6cec2" strokeWidth="1" />
                                            <path
                                                d={chartPath}
                                                fill="none"
                                                stroke="url(#net-worth-line)"
                                                strokeWidth="3"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                            {chartCoordinates.map((point) => (
                                                <g key={point.id}>
                                                    <circle cx={point.x} cy={point.y} r="4.5" fill="#fffaf1" stroke="#60a5fa" strokeWidth="2" />
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
                                <div className="rounded-md border border-dashed border-stone-300 px-3 py-10 text-sm text-stone-500">
                                    至少需要两条资产快照，才能显示净资产趋势。
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="rounded-lg border border-stone-200 bg-[#fffaf1] p-4">
                        <p className="text-sm font-medium text-stone-900">最近快照</p>
                        <div className="mt-3 space-y-2">
                            {snapshots.length ? (
                                snapshots.map((snapshot) => (
                                    <div key={snapshot.id} className="rounded-md border border-stone-200 bg-white px-3 py-2 text-sm">
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
                                <div className="rounded-md border border-dashed border-stone-300 px-3 py-6 text-sm text-stone-500">
                                    还没有资产快照。
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

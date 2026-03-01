import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface HunterTarget {
    id: string;
    priority: string;
    status: string;
    lastActionDate: string;
}

function daysSince(dateText: string, today: Date): number | null {
    if (!dateText) return null;
    const date = new Date(`${dateText}T00:00:00`);
    if (Number.isNaN(date.getTime())) return null;
    return Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
}

export function HunterPipelineSummary({ targets }: { targets: HunterTarget[] }) {
    const today = new Date();
    const active = targets.filter((target) => target.status === "active").length;
    const followUp = targets.filter((target) => target.status === "follow_up").length;
    const submitted = targets.filter((target) => target.status === "submitted").length;
    const p0 = targets.filter((target) => target.priority === "P0").length;
    const stale = targets.filter((target) => {
        const days = daysSince(target.lastActionDate, today);
        return days !== null && days > 7 && target.status !== "submitted" && target.status !== "parked";
    }).length;

    const items = [
        { label: "总目标", value: targets.length, className: "border-zinc-700 text-zinc-300" },
        { label: "主攻", value: active, className: "border-blue-500/40 text-blue-300" },
        { label: "跟进", value: followUp, className: "border-amber-500/40 text-amber-300" },
        { label: "已提交", value: submitted, className: "border-emerald-500/40 text-emerald-300" },
        { label: "P0", value: p0, className: "border-red-500/40 text-red-300" },
        { label: "超 7 天未推进", value: stale, className: "border-orange-500/40 text-orange-300" },
    ];

    return (
        <Card className="border-zinc-800 bg-zinc-900/60">
            <CardHeader className="pb-2">
                <CardTitle className="text-base">Hunter 管道概览</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
                {items.map((item) => (
                    <Badge key={item.label} variant="outline" className={item.className}>
                        {item.label} {item.value}
                    </Badge>
                ))}
            </CardContent>
        </Card>
    );
}

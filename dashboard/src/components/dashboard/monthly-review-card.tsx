"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Save, Sparkles } from "lucide-react";

interface MonthlyReviewCardProps {
    month: string;
    review: {
        wins: string;
        losses: string;
        blockers: string;
        nextSteps: string;
    };
}

export function MonthlyReviewCard({ month, review }: MonthlyReviewCardProps) {
    const router = useRouter();
    const [wins, setWins] = useState(review.wins);
    const [losses, setLosses] = useState(review.losses);
    const [blockers, setBlockers] = useState(review.blockers);
    const [nextSteps, setNextSteps] = useState(review.nextSteps);
    const [saving, setSaving] = useState(false);
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        setWins(review.wins);
        setLosses(review.losses);
        setBlockers(review.blockers);
        setNextSteps(review.nextSteps);
    }, [review]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await fetch("/api/review", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    month,
                    wins,
                    losses,
                    blockers,
                    nextSteps,
                }),
            });
            router.refresh();
        } catch (error) {
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const handleGenerateDraft = async () => {
        setGenerating(true);
        try {
            const response = await fetch("/api/review/draft", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ month }),
            });

            const data = await response.json();
            if (!response.ok || !data?.draft) return;

            setWins(data.draft.wins || "");
            setLosses(data.draft.losses || "");
            setBlockers(data.draft.blockers || "");
            setNextSteps(data.draft.nextSteps || "");
        } catch (error) {
            console.error(error);
        } finally {
            setGenerating(false);
        }
    };

    return (
        <Card className="border-zinc-800 bg-zinc-900/70">
            <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                    <CardTitle>月度复盘</CardTitle>
                    <CardDescription>{month} 的复盘结论和下月输入都记录在数据库里。</CardDescription>
                </div>
                <div className="flex gap-2 self-start">
                    <Button onClick={handleGenerateDraft} disabled={generating || saving} variant="outline" className="gap-2">
                        {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                        生成初稿
                    </Button>
                    <Button onClick={handleSave} disabled={saving || generating} className="gap-2">
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        保存复盘
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <div className="text-sm font-medium text-zinc-200">Wins</div>
                    <Textarea
                        value={wins}
                        onChange={(event) => setWins(event.target.value)}
                        className="min-h-32 bg-zinc-950/60"
                        placeholder="本月最有效的动作、结果和正反馈。"
                    />
                </div>
                <div className="space-y-2">
                    <div className="text-sm font-medium text-zinc-200">Losses</div>
                    <Textarea
                        value={losses}
                        onChange={(event) => setLosses(event.target.value)}
                        className="min-h-32 bg-zinc-950/60"
                        placeholder="本月判断失误、浪费动作或没有跑通的尝试。"
                    />
                </div>
                <div className="space-y-2">
                    <div className="text-sm font-medium text-zinc-200">Blockers</div>
                    <Textarea
                        value={blockers}
                        onChange={(event) => setBlockers(event.target.value)}
                        className="min-h-32 bg-zinc-950/60"
                        placeholder="当前主要阻塞项：资源、节奏、渠道、判断等。"
                    />
                </div>
                <div className="space-y-2">
                    <div className="text-sm font-medium text-zinc-200">Next Steps</div>
                    <Textarea
                        value={nextSteps}
                        onChange={(event) => setNextSteps(event.target.value)}
                        className="min-h-32 bg-zinc-950/60"
                        placeholder="下个月唯一应该延续和加码的动作。"
                    />
                </div>
            </CardContent>
        </Card>
    );
}

"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Crosshair, Loader2, Pencil, PlusCircle, Trash2 } from "lucide-react";

interface HunterTarget {
    id: string;
    name: string;
    platform: string;
    url: string;
    priority: string;
    status: string;
    bountyEstimate: number;
    thesis: string;
    oddsNote: string;
    lastAction: string;
    lastActionDate: string;
    nextStep: string;
    notes: string;
}

interface TargetFormState {
    name: string;
    platform: string;
    url: string;
    priority: string;
    status: string;
    bountyEstimate: string;
    thesis: string;
    oddsNote: string;
    lastAction: string;
    lastActionDate: string;
    nextStep: string;
    notes: string;
}

const DEFAULT_FORM: TargetFormState = {
    name: "",
    platform: "",
    url: "",
    priority: "P1",
    status: "watch",
    bountyEstimate: "",
    thesis: "",
    oddsNote: "",
    lastAction: "",
    lastActionDate: "",
    nextStep: "",
    notes: "",
};

function statusLabel(status: string): string {
    switch (status) {
        case "active":
            return "主攻";
        case "follow_up":
            return "跟进";
        case "submitted":
            return "已提交";
        case "parked":
            return "已搁置";
        default:
            return "观察中";
    }
}

function statusClass(status: string): string {
    switch (status) {
        case "active":
            return "border-blue-500/40 bg-blue-500/10 text-blue-300";
        case "follow_up":
            return "border-amber-500/40 bg-amber-500/10 text-amber-300";
        case "submitted":
            return "border-emerald-500/40 bg-emerald-500/10 text-emerald-300";
        case "parked":
            return "border-zinc-600 bg-zinc-800/80 text-zinc-300";
        default:
            return "border-zinc-700 bg-zinc-900 text-zinc-300";
    }
}

function priorityClass(priority: string): string {
    switch (priority) {
        case "P0":
            return "border-red-500/40 bg-red-500/10 text-red-300";
        case "P1":
            return "border-orange-500/40 bg-orange-500/10 text-orange-300";
        default:
            return "border-zinc-700 bg-zinc-900 text-zinc-300";
    }
}

function toFormState(target?: HunterTarget): TargetFormState {
    if (!target) return DEFAULT_FORM;
    return {
        name: target.name,
        platform: target.platform,
        url: target.url,
        priority: target.priority,
        status: target.status,
        bountyEstimate: target.bountyEstimate > 0 ? String(target.bountyEstimate) : "",
        thesis: target.thesis,
        oddsNote: target.oddsNote,
        lastAction: target.lastAction,
        lastActionDate: target.lastActionDate,
        nextStep: target.nextStep,
        notes: target.notes,
    };
}

export function HunterTargetPool({ targets }: { targets: HunterTarget[] }) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState<TargetFormState>(DEFAULT_FORM);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const stats = useMemo(() => {
        const active = targets.filter((target) => target.status === "active").length;
        const followUp = targets.filter((target) => target.status === "follow_up").length;
        const submitted = targets.filter((target) => target.status === "submitted").length;
        const p0 = targets.filter((target) => target.priority === "P0").length;

        return { active, followUp, submitted, p0 };
    }, [targets]);

    const openCreate = () => {
        setEditingId(null);
        setForm(DEFAULT_FORM);
        setOpen(true);
    };

    const openEdit = (target: HunterTarget) => {
        setEditingId(target.id);
        setForm(toFormState(target));
        setOpen(true);
    };

    const handleSave = async () => {
        if (!form.name.trim()) return;
        setSaving(true);
        try {
            const payload = {
                ...form,
                bountyEstimate: Number(form.bountyEstimate || 0),
                id: editingId,
            };
            const endpoint = editingId ? "/api/hunter-targets/update" : "/api/hunter-targets/add";
            await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            setOpen(false);
            setEditingId(null);
            setForm(DEFAULT_FORM);
            router.refresh();
        } catch (error) {
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        setDeletingId(id);
        try {
            await fetch("/api/hunter-targets/delete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });
            router.refresh();
        } catch (error) {
            console.error(error);
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <Card className="border-zinc-800 bg-zinc-900/60">
            <CardHeader className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                        <Crosshair className="h-5 w-5 text-blue-300" />
                        Hunter 目标池
                    </CardTitle>
                    <CardDescription>管理 AI 漏洞目标、赔率判断、当前状态和最后动作时间。</CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="border-zinc-700 text-zinc-300">总数 {targets.length}</Badge>
                    <Badge variant="outline" className="border-blue-500/40 text-blue-300">主攻 {stats.active}</Badge>
                    <Badge variant="outline" className="border-amber-500/40 text-amber-300">跟进 {stats.followUp}</Badge>
                    <Badge variant="outline" className="border-emerald-500/40 text-emerald-300">已提交 {stats.submitted}</Badge>
                    <Badge variant="outline" className="border-red-500/40 text-red-300">P0 {stats.p0}</Badge>
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={openCreate} className="gap-2">
                                <PlusCircle className="h-4 w-4" />
                                新增目标
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-3xl">
                            <DialogHeader>
                                <DialogTitle>{editingId ? "编辑 Hunter 目标" : "新增 Hunter 目标"}</DialogTitle>
                                <DialogDescription>记录目标、赔率判断、最后动作和下一步，不要把高价值目标留在脑子里。</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-2 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="target-name">目标名称</Label>
                                    <Input id="target-name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="target-platform">平台 / 公司</Label>
                                    <Input id="target-platform" value={form.platform} onChange={(event) => setForm({ ...form, platform: event.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="target-url">URL</Label>
                                    <Input id="target-url" value={form.url} onChange={(event) => setForm({ ...form, url: event.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="target-bounty">预期奖金 (¥)</Label>
                                    <Input
                                        id="target-bounty"
                                        type="number"
                                        value={form.bountyEstimate}
                                        onChange={(event) => setForm({ ...form, bountyEstimate: event.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>优先级</Label>
                                    <Select value={form.priority} onValueChange={(value) => setForm({ ...form, priority: value })}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="P0">P0</SelectItem>
                                            <SelectItem value="P1">P1</SelectItem>
                                            <SelectItem value="P2">P2</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>状态</Label>
                                    <Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value })}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="watch">观察中</SelectItem>
                                            <SelectItem value="active">主攻</SelectItem>
                                            <SelectItem value="follow_up">跟进</SelectItem>
                                            <SelectItem value="submitted">已提交</SelectItem>
                                            <SelectItem value="parked">已搁置</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="target-thesis">结构性爆点假设</Label>
                                    <Textarea
                                        id="target-thesis"
                                        value={form.thesis}
                                        onChange={(event) => setForm({ ...form, thesis: event.target.value })}
                                        className="min-h-24 bg-zinc-950/60"
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="target-odds">赔率判断</Label>
                                    <Textarea
                                        id="target-odds"
                                        value={form.oddsNote}
                                        onChange={(event) => setForm({ ...form, oddsNote: event.target.value })}
                                        className="min-h-20 bg-zinc-950/60"
                                        placeholder="为什么值得押，为什么奖金天花板够高。"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="target-last-action-date">最后动作日期</Label>
                                    <Input
                                        id="target-last-action-date"
                                        type="date"
                                        value={form.lastActionDate}
                                        onChange={(event) => setForm({ ...form, lastActionDate: event.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="target-last-action">最后动作</Label>
                                    <Input
                                        id="target-last-action"
                                        value={form.lastAction}
                                        onChange={(event) => setForm({ ...form, lastAction: event.target.value })}
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="target-next-step">下一步</Label>
                                    <Textarea
                                        id="target-next-step"
                                        value={form.nextStep}
                                        onChange={(event) => setForm({ ...form, nextStep: event.target.value })}
                                        className="min-h-20 bg-zinc-950/60"
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="target-notes">备注</Label>
                                    <Textarea
                                        id="target-notes"
                                        value={form.notes}
                                        onChange={(event) => setForm({ ...form, notes: event.target.value })}
                                        className="min-h-20 bg-zinc-950/60"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleSave} disabled={saving || !form.name.trim()} className="gap-2">
                                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                                    保存目标
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>目标</TableHead>
                            <TableHead>优先级</TableHead>
                            <TableHead>状态</TableHead>
                            <TableHead>赔率判断</TableHead>
                            <TableHead>最后动作</TableHead>
                            <TableHead>下一步</TableHead>
                            <TableHead className="text-right">操作</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {targets.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center text-zinc-400">
                                    还没有 Hunter 目标。先把高赔率 AI 标的录进数据库。
                                </TableCell>
                            </TableRow>
                        ) : (
                            targets.map((target) => (
                                <TableRow key={target.id}>
                                    <TableCell className="min-w-[220px] align-top whitespace-normal">
                                        <div className="space-y-1">
                                            <div className="font-medium text-zinc-100">{target.name}</div>
                                            <div className="text-xs text-zinc-400">{target.platform || "未标注平台"}</div>
                                            {target.url ? (
                                                <a href={target.url} target="_blank" rel="noreferrer" className="text-xs text-blue-300 underline underline-offset-4">
                                                    打开目标
                                                </a>
                                            ) : null}
                                            {target.bountyEstimate > 0 ? (
                                                <div className="text-xs text-zinc-300">预期奖金 ¥{target.bountyEstimate.toLocaleString("zh-CN")}</div>
                                            ) : null}
                                        </div>
                                    </TableCell>
                                    <TableCell className="align-top">
                                        <Badge variant="outline" className={priorityClass(target.priority)}>{target.priority}</Badge>
                                    </TableCell>
                                    <TableCell className="align-top">
                                        <Badge variant="outline" className={statusClass(target.status)}>{statusLabel(target.status)}</Badge>
                                    </TableCell>
                                    <TableCell className="min-w-[260px] align-top whitespace-normal text-sm text-zinc-300">
                                        <div>{target.oddsNote || target.thesis || "未填写"}</div>
                                    </TableCell>
                                    <TableCell className="min-w-[220px] align-top whitespace-normal text-sm text-zinc-300">
                                        <div>{target.lastAction || "未记录"}</div>
                                        <div className="text-xs text-zinc-500">{target.lastActionDate || "无日期"}</div>
                                    </TableCell>
                                    <TableCell className="min-w-[220px] align-top whitespace-normal text-sm text-zinc-300">
                                        {target.nextStep || "未填写"}
                                    </TableCell>
                                    <TableCell className="align-top text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(target)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                                onClick={() => handleDelete(target.id)}
                                                disabled={deletingId === target.id}
                                            >
                                                {deletingId === target.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

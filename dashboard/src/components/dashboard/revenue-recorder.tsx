"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { PlusCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function RevenueRecorder() {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [type, setType] = useState<string>("SaaS");
    const [project, setProject] = useState("");
    const [amount, setAmount] = useState("");
    const [memo, setMemo] = useState("");

    const handleSave = async () => {
        const trimmedProject = project.trim();
        const trimmedMemo = memo.trim();

        if (!amount || !trimmedProject) return;
        setLoading(true);
        try {
            await fetch("/api/revenue/add", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    date: new Date().toISOString().split('T')[0],
                    type,
                    project: trimmedProject,
                    amount: parseFloat(amount),
                    memo: trimmedMemo
                }),
            });

            setOpen(false);
            setProject("");
            setAmount("");
            setMemo("");
            router.refresh();
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <PlusCircle className="h-4 w-4" />
                    记一笔
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>录入收入</DialogTitle>
                    <DialogDescription>
                        记录一笔新的收入流水。
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="type" className="text-right">
                            来源
                        </Label>
                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="来源" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="SaaS">SaaS</SelectItem>
                                <SelectItem value="Hunter">Hunter</SelectItem>
                                <SelectItem value="Media">Media</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="project" className="text-right">
                            项目
                        </Label>
                        <Input
                            id="project"
                            value={project}
                            onChange={(e) => setProject(e.target.value)}
                            className="col-span-3"
                            placeholder="例如：漏洞挖掘单 #2026-02"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="amount" className="text-right">
                            金额 (¥)
                        </Label>
                        <Input
                            id="amount"
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="memo" className="text-right">
                            备注
                        </Label>
                        <Input
                            id="memo"
                            value={memo}
                            onChange={(e) => setMemo(e.target.value)}
                            className="col-span-3"
                            placeholder="例如：打款备注/渠道信息"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSave} disabled={loading || !project.trim() || !amount || Number(amount) <= 0}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        确认录入
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

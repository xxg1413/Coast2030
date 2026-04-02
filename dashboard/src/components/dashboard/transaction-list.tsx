"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";

interface Transaction {
    id: string;
    date: string;
    type: string;
    source: string;
    project: string;
    amount: number;
    originalAmount: number;
    currency: "CNY" | "USD";
    fxRate: number;
    memo: string;
    deletable: boolean;
}

function formatOriginalAmount(transaction: Transaction): string {
    const formatter = new Intl.NumberFormat(transaction.currency === "USD" ? "en-US" : "zh-CN", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    });
    return `${transaction.currency === "USD" ? "$" : "¥"}${formatter.format(transaction.originalAmount)}`;
}

function formatConvertedAmount(transaction: Transaction): string | null {
    if (transaction.currency === "CNY") return null;
    return `≈ ¥${transaction.amount.toLocaleString("zh-CN", { maximumFractionDigits: 2 })} · 汇率 ${transaction.fxRate}`;
}

function getTypeBadgeClass(type: string): string {
    switch (type) {
        case "Hunter":
            return "bg-blue-100 text-blue-700";
        case "SaaS":
            return "bg-emerald-100 text-emerald-700";
        case "Media":
            return "bg-amber-100 text-amber-700";
        default:
            return "bg-stone-100 text-stone-600";
    }
}

function getTypeLabel(type: string): string {
    switch (type) {
        case "Hunter":
            return "漏洞挖掘";
        case "SaaS":
            return "SaaS";
        case "Media":
            return "自媒体";
        case "Other":
            return "其他";
        default:
            return type;
    }
}

export function TransactionList({ transactions, month }: { transactions: Transaction[]; month: string }) {
    const router = useRouter();
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleDelete = async (id: string, deletable: boolean) => {
        if (!deletable) return;
        setDeletingId(id);
        try {
            await fetch("/api/revenue/delete", {
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
        <Card className="w-full border-stone-200 bg-white/80 shadow-[0_12px_40px_rgba(84,61,31,0.08)]">
            <CardHeader>
                <CardTitle>💰 {month} 收入明细</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="w-full overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px] text-stone-500">日期</TableHead>
                                <TableHead>类型</TableHead>
                                <TableHead>来源</TableHead>
                                <TableHead>项目</TableHead>
                                <TableHead>备注</TableHead>
                                <TableHead className="text-right text-stone-500">金额</TableHead>
                                <TableHead className="text-right text-stone-500">操作</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center text-stone-500">
                                        {month} 暂无收入 (加油!)
                                    </TableCell>
                                </TableRow>
                            ) : (
                                transactions.map((t) => (
                                    <TableRow key={t.id}>
                                        <TableCell className="font-medium whitespace-nowrap">{t.date}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded text-xs ${getTypeBadgeClass(t.type)}`}>
                                                {getTypeLabel(t.type)}
                                            </span>
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap text-stone-500">{t.source}</TableCell>
                                        <TableCell className="whitespace-nowrap">{t.project}</TableCell>
                                        <TableCell className="min-w-[150px] text-stone-500">{t.memo}</TableCell>
                                        <TableCell className="text-right whitespace-nowrap">
                                            <div className="font-bold text-stone-900">+{formatOriginalAmount(t)}</div>
                                            {formatConvertedAmount(t) ? (
                                                <div className="text-xs font-normal text-stone-500">{formatConvertedAmount(t)}</div>
                                            ) : null}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {t.deletable ? (
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                                    onClick={() => handleDelete(t.id, t.deletable)}
                                                    disabled={deletingId === t.id}
                                                >
                                                    {deletingId === t.id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            ) : (
                                                <span className="text-xs text-stone-500">同步</span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}

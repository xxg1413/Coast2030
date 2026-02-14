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
    id: number;
    date: string;
    type: string;
    project: string;
    amount: number;
    memo: string;
}

function getTypeBadgeClass(type: string): string {
    switch (type) {
        case "Hunter":
            return "bg-blue-500/20 text-blue-400";
        case "SaaS":
            return "bg-emerald-500/20 text-emerald-400";
        case "Media":
            return "bg-amber-500/20 text-amber-400";
        default:
            return "bg-zinc-500/20 text-zinc-300";
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
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const handleDelete = async (id: number) => {
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
        <Card className="w-full">
            <CardHeader>
                <CardTitle>💰 {month} 收入明细</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="w-full overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">日期</TableHead>
                                <TableHead>类型</TableHead>
                                <TableHead>项目</TableHead>
                                <TableHead>备注</TableHead>
                                <TableHead className="text-right">金额</TableHead>
                                <TableHead className="text-right">操作</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground h-24">
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
                                        <TableCell className="whitespace-nowrap">{t.project}</TableCell>
                                        <TableCell className="text-muted-foreground min-w-[150px]">{t.memo}</TableCell>
                                        <TableCell className="text-right font-bold whitespace-nowrap">+¥{t.amount.toLocaleString()}</TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                                onClick={() => handleDelete(t.id)}
                                                disabled={deletingId === t.id}
                                            >
                                                {deletingId === t.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Trash2 className="h-4 w-4" />
                                                )}
                                            </Button>
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

"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Transaction {
    date: string;
    type: string;
    project: string;
    amount: number;
    memo: string;
}

export function TransactionList({ transactions }: { transactions: Transaction[] }) {
    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>💰 本月收入明细</CardTitle>
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
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground h-24">
                                        本月暂无收入 (加油!)
                                    </TableCell>
                                </TableRow>
                            ) : (
                                transactions.map((t, idx) => (
                                    <TableRow key={idx}>
                                        <TableCell className="font-medium whitespace-nowrap">{t.date}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded text-xs ${t.type === 'Hunter' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'
                                                }`}>
                                                {t.type}
                                            </span>
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">{t.project}</TableCell>
                                        <TableCell className="text-muted-foreground min-w-[150px]">{t.memo}</TableCell>
                                        <TableCell className="text-right font-bold whitespace-nowrap">+¥{t.amount.toLocaleString()}</TableCell>
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

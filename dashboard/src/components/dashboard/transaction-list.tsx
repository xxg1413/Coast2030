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
import { Loader2, Trash2, TrendingUp } from "lucide-react";
import { getIncomeTypeConfig } from "@/lib/income-types";
import { EmptyState } from "./empty-state";

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

function TransactionCard({
  transaction,
  onDelete,
  deleting,
}: {
  transaction: Transaction;
  onDelete: (id: string, deletable: boolean) => void;
  deleting: boolean;
}) {
  const config = getIncomeTypeConfig(transaction.type);

  return (
    <div className="rounded-lg border border-stone-200 bg-white p-4 space-y-3 md:hidden">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-stone-900">{transaction.date}</span>
        <span className={`px-2 py-0.5 rounded text-xs ${config.badgeClass}`}>{config.label}</span>
      </div>
      <div className="space-y-1">
        <p className="text-sm text-stone-900">{transaction.project}</p>
        <p className="text-xs text-stone-500">{transaction.source}</p>
        {transaction.memo && <p className="text-xs text-stone-400">{transaction.memo}</p>}
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-stone-100">
        <div>
          <div className="font-bold text-stone-900">+{formatOriginalAmount(transaction)}</div>
          {formatConvertedAmount(transaction) && (
            <div className="text-xs text-stone-500">{formatConvertedAmount(transaction)}</div>
          )}
        </div>
        {transaction.deletable ? (
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-destructive hover:bg-destructive/10"
            onClick={() => onDelete(transaction.id, transaction.deletable)}
            disabled={deleting}
          >
            {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          </Button>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs text-stone-400">
            <TrendingUp className="h-3 w-3" />
            同步
          </span>
        )}
      </div>
    </div>
  );
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
    <Card className="w-full border-stone-200 bg-white/80 shadow-[0_8px_30px_rgba(84,61,31,0.06)]">
      <CardHeader className="pb-4">
        <CardTitle className="text-base">💰 {month} 收入明细</CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <EmptyState message={`${month} 暂无收入记录，加油！`} />
        ) : (
          <>
            {/* Mobile: Card list */}
            <div className="space-y-3 md:hidden">
              {transactions.map((t) => (
                <TransactionCard
                  key={t.id}
                  transaction={t}
                  onDelete={handleDelete}
                  deleting={deletingId === t.id}
                />
              ))}
            </div>

            {/* Desktop: Table */}
            <div className="hidden md:block w-full overflow-x-auto">
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
                  {transactions.map((t) => {
                    const config = getIncomeTypeConfig(t.type);
                    return (
                      <TableRow key={t.id}>
                        <TableCell className="font-medium whitespace-nowrap">{t.date}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs ${config.badgeClass}`}>
                            {config.label}
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
                            <span className="inline-flex items-center gap-1 text-xs text-stone-400">
                              <TrendingUp className="h-3 w-3" />
                              同步
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

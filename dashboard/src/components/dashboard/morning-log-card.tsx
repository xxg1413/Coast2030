"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Sunrise } from "lucide-react";
import type { MorningLog, MorningLogItem } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

function updateItem(items: MorningLogItem[], key: string, patch: Partial<MorningLogItem>) {
  return items.map((item) => (item.key === key ? { ...item, ...patch } : item));
}

export function MorningLogCard({ log }: { log: MorningLog }) {
  const router = useRouter();
  const [items, setItems] = useState(log.items);
  const [customItems, setCustomItems] = useState(log.customItems);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const completedCount = useMemo(
    () => [...items, ...customItems.filter((item) => item.label.trim())].filter((item) => item.completed).length,
    [items, customItems],
  );
  const totalCount = useMemo(
    () => items.length + customItems.filter((item) => item.label.trim()).length,
    [items, customItems],
  );

  const save = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await fetch("/api/morning-log/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: log.date, items, customItems }),
      });
      setSaved(true);
      router.refresh();
      window.setTimeout(() => setSaved(false), 1400);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="glass-panel py-0">
      <CardHeader className="pb-3 pt-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-stone-500">晨间日志</p>
            <CardTitle className="mt-1 flex items-center gap-2 text-xl font-bold">
              <Sunrise className="h-5 w-5 text-amber-600" />
              每天先确认状态
            </CardTitle>
            <p className="mt-1 text-sm text-stone-500">{log.date} · {completedCount}/{totalCount || items.length} 已完成</p>
          </div>
          <Button onClick={save} disabled={saving} className="min-w-[96px]">
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : saved ? <Check className="mr-2 h-4 w-4" /> : null}
            {saved ? "已保存" : "保存"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pb-5">
        <div className="grid gap-2 md:grid-cols-3">
          {items.map((item) => (
            <div key={item.key} className="flex items-center gap-2 rounded-lg border border-stone-200 bg-stone-50/70 px-3 py-2">
              <Checkbox
                checked={item.completed}
                onCheckedChange={(checked) => setItems((current) => updateItem(current, item.key, { completed: Boolean(checked) }))}
                className="data-[state=checked]:border-emerald-600 data-[state=checked]:bg-emerald-600"
              />
              <Input
                value={item.label}
                onChange={(event) => setItems((current) => updateItem(current, item.key, { label: event.target.value }))}
                className="h-8 border-transparent bg-transparent px-1 text-sm font-medium shadow-none focus-visible:ring-1"
              />
            </div>
          ))}
        </div>

        <div className="grid gap-2 md:grid-cols-3">
          {customItems.map((item, index) => (
            <div key={item.key} className="flex items-center gap-2 rounded-lg border border-dashed border-stone-300 bg-white/70 px-3 py-2">
              <Checkbox
                checked={item.completed}
                onCheckedChange={(checked) => setCustomItems((current) => updateItem(current, item.key, { completed: Boolean(checked) }))}
                disabled={!item.label.trim()}
                className="data-[state=checked]:border-cyan-600 data-[state=checked]:bg-cyan-600"
              />
              <Input
                value={item.label}
                placeholder={`自定义 ${index + 1}`}
                onChange={(event) => setCustomItems((current) => updateItem(current, item.key, { label: event.target.value }))}
                className="h-8 border-transparent bg-transparent px-1 text-sm shadow-none focus-visible:ring-1"
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

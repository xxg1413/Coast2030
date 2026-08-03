/* Hallmark · component preview: morning action panel · eight interaction states */

import { AlertCircle, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

const states = [
  { name: "default", inputClass: "", buttonProps: {} },
  { name: "hover", inputClass: "bg-stone-100/70", buttonProps: {} },
  { name: "focus", inputClass: "ring-ring/50 ring-[3px]", buttonProps: {} },
  { name: "active", inputClass: "", buttonProps: { className: "translate-y-px" } },
  { name: "disabled", inputClass: "", buttonProps: { disabled: true } },
] as const;

export function MorningActionPanelPreview() {
  return (
    <div className="space-y-3 bg-background p-6 text-foreground">
      <h1 className="text-xl font-bold">Morning action panel — 8 states</h1>
      {states.map((state) => (
        <div key={state.name} className="grid grid-cols-[6rem_1fr_auto] items-start gap-3">
          <span className="pt-2 text-sm text-stone-500">{state.name}</span>
          <div className="space-y-2">
            <Input
              aria-label={`${state.name} action`}
              defaultValue={state.name === "default" ? "复现租户越权并保存请求/响应" : ""}
              placeholder="复现租户越权并保存请求/响应"
              className={`h-11 ${state.inputClass}`}
              disabled={state.name === "disabled"}
            />
            <Input
              aria-label={`${state.name} result`}
              defaultValue={state.name === "default" ? "已保存 HAR" : ""}
              placeholder="已保存 HAR / 未复现：原因…"
              className={`h-11 ${state.inputClass}`}
              disabled={state.name === "disabled"}
            />
          </div>
          <Button className="h-11" {...state.buttonProps}>开始专注</Button>
        </div>
      ))}
      <div className="grid grid-cols-[6rem_1fr] items-center gap-3">
        <span className="text-sm text-stone-500">loading</span>
        <span className="inline-flex items-center gap-2 text-sm"><Loader2 className="h-4 w-4 animate-spin" />保存中</span>
      </div>
      <div className="grid grid-cols-[6rem_1fr] items-center gap-3">
        <span className="text-sm text-stone-500">error</span>
        <span className="inline-flex items-center gap-2 text-sm text-red-700"><AlertCircle className="h-4 w-4" />保存失败，将在下次编辑时重试</span>
      </div>
      <div className="grid grid-cols-[6rem_1fr] items-center gap-3">
        <span className="text-sm text-stone-500">success</span>
        <span className="inline-flex items-center gap-2 text-sm text-emerald-700"><Check className="h-4 w-4" />自动保存</span>
      </div>
      <div className="flex items-center gap-3">
        <Checkbox checked aria-label="completed preview" />
        <span className="text-sm line-through">基础习惯已完成</span>
      </div>
    </div>
  );
}

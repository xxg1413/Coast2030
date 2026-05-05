export type IncomeType = "Hunter" | "SaaS" | "Media" | "Other";

export interface IncomeTypeConfig {
  label: string;
  barClass: string;
  badgeClass: string;
  dotClass: string;
  lightBg: string;
}

export const INCOME_TYPE_CONFIG: Record<IncomeType, IncomeTypeConfig> = {
  Hunter: {
    label: "漏洞挖掘",
    barClass: "bg-blue-500",
    badgeClass: "bg-blue-100 text-blue-700",
    dotClass: "bg-blue-500",
    lightBg: "bg-blue-50",
  },
  SaaS: {
    label: "SaaS",
    barClass: "bg-emerald-500",
    badgeClass: "bg-emerald-100 text-emerald-700",
    dotClass: "bg-emerald-500",
    lightBg: "bg-emerald-50",
  },
  Media: {
    label: "自媒体",
    barClass: "bg-amber-500",
    badgeClass: "bg-amber-100 text-amber-700",
    dotClass: "bg-amber-500",
    lightBg: "bg-amber-50",
  },
  Other: {
    label: "其他",
    barClass: "bg-zinc-500",
    badgeClass: "bg-stone-100 text-stone-600",
    dotClass: "bg-zinc-500",
    lightBg: "bg-stone-50",
  },
};

export function getIncomeTypeConfig(type: string): IncomeTypeConfig {
  return INCOME_TYPE_CONFIG[type as IncomeType] ?? INCOME_TYPE_CONFIG.Other;
}

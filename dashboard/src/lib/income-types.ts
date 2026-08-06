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
    barClass: "bg-[var(--color-neutral)]",
    badgeClass: "bg-[var(--color-paper-3)] text-[var(--color-ink-2)]",
    dotClass: "bg-[var(--color-neutral)]",
    lightBg: "bg-[var(--color-paper-3)]",
  },
  SaaS: {
    label: "SaaS",
    barClass: "bg-[var(--color-accent)]",
    badgeClass: "bg-[var(--color-accent-soft)] text-[var(--color-accent-strong)]",
    dotClass: "bg-[var(--color-accent)]",
    lightBg: "bg-[var(--color-accent-soft)]",
  },
  Media: {
    label: "自媒体",
    barClass: "bg-[var(--color-warning)]",
    badgeClass: "bg-[var(--color-paper-3)] text-[var(--color-warning)]",
    dotClass: "bg-[var(--color-warning)]",
    lightBg: "bg-[var(--color-paper-3)]",
  },
  Other: {
    label: "其他",
    barClass: "bg-[var(--color-muted)]",
    badgeClass: "bg-[var(--color-paper-3)] text-[var(--color-muted)]",
    dotClass: "bg-[var(--color-muted)]",
    lightBg: "bg-[var(--color-paper-3)]",
  },
};

export function getIncomeTypeConfig(type: string): IncomeTypeConfig {
  return INCOME_TYPE_CONFIG[type as IncomeType] ?? INCOME_TYPE_CONFIG.Other;
}

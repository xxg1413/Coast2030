export const COAST_TARGET = 5000000;
// 终局目标当前值手动维护，不跟随收入流水自动统计。
export const COAST_CURRENT = 1700;
// 2030年净资产目标：5年完成后需要达到的净资产
export const NET_WORTH_TARGET_2030 = 5000000;

// 年度净资产里程碑目标（每年底应该达到的净资产）
export const NET_WORTH_MILESTONES: Record<number, number> = {
  2026: 500000,   // 50万
  2027: 1000000,  // 100万
  2028: 2000000,  // 200万
  2029: 3500000,  // 350万
  2030: 5000000,  // 500万
};

export const YEAR_TARGETS: Record<number, number> = {
  2026: 1000000,  // 100万
  2027: 2000000,  // 200万
  2028: 5000000,
  2029: 10000000,
  2030: 20000000,
};

/**
 * 2026 组合收入分配的唯一代码来源。
 * 各方向 Dashboard 可以保留自己的运营币种与目标，但 Coast 汇总统一使用人民币。
 */
export const BUSINESS_LINE_TARGETS_2026 = {
  Hunter: 0,
  SaaS: 1000000,
  Media: 0,
} as const;

/**
 * 每日 8H 自由时间的唯一分配来源。自媒体只服务 SaaS 获客，
 * Buffer 只用于处理最接近成交的阻塞项。
 */
export const BUSINESS_LINE_DAILY_HOURS_2026 = {
  Hunter: 0,
  SaaS: 5,
  Media: 2,
  Buffer: 1,
} as const;

export const DAILY_ALLOCATED_HOURS_2026 = 8;

/**
 * 晨间日志四个核心分类的每日番茄钟目标。
 * 每完成一次倒计时累计 1 个；达到目标后仍可继续累计，不封顶。
 */
export const MORNING_CORE_POMODORO_TARGETS = {
  saas: 5,
  ai_notes: 2,
  buffer: 1,
  work: 4,
} as const;

export const DAILY_CORE_POMODORO_TARGET_2026 = Object.values(MORNING_CORE_POMODORO_TARGETS)
  .reduce((sum, target) => sum + target, 0);

export type MorningCoreFocusKey = keyof typeof MORNING_CORE_POMODORO_TARGETS;

export function isMorningCoreFocusKey(key: string): key is MorningCoreFocusKey {
  return Object.prototype.hasOwnProperty.call(MORNING_CORE_POMODORO_TARGETS, key);
}

export function getMorningCorePomodoroCountsByKey(
  entries: ReadonlyArray<{ key: string; duration: number }>,
): Record<MorningCoreFocusKey, number> {
  const totals: Record<MorningCoreFocusKey, number> = {
    saas: 0,
    ai_notes: 0,
    buffer: 0,
    work: 0,
  };

  for (const entry of entries) {
    if (!isMorningCoreFocusKey(entry.key)) continue;
    if (!Number.isFinite(entry.duration) || entry.duration <= 0) continue;
    totals[entry.key] += 1;
  }

  return totals;
}

const MONTHLY_TARGET_START_MONTH = 3;
const MONTHLY_TARGET_GROWTH_RATIO = 1.3;
const MONTHLY_TARGET_ROUNDING_UNIT = 1000;
// 2026 年最后四个月按月度成交主攻分配回款目标；DeepFeather 是常驻获客线，不占月份。
const CUSTOM_MONTHLY_TARGETS: Partial<Record<number, number[]>> = {
  2026: [0, 0, 0, 0, 0, 0, 0, 0, 500000, 250000, 150000, 100000],
};

export const SAAS_GROWTH_PORTFOLIO_2026 = [
  {
    key: "deepfeather",
    name: "DeepFeather",
    mode: "always-on",
    focusMonths: [9, 10, 11, 12],
    schedule: "9–12月持续获客",
    revenueTarget: null,
    offer: "Software Replacement Watchlist / Audit",
    customer: "正在削减软件成本并评估 AI 替代方案的团队",
    paidGate: "每月底都用真实对话、报价和付款复盘，不等到 12 月才启动",
    href: "https://deepfeather.com/",
  },
  {
    key: "openbot",
    name: "OpenBot",
    mode: "monthly",
    focusMonths: [9],
    schedule: "9月成交主攻",
    revenueTarget: 500000,
    offer: "Robot Dataset Readiness / Change-Control",
    customer: "机器人数据与 ML 平台团队",
    paidGate: "9 月底前拿到 1 个 $3k–10k 付费 Pilot",
    href: "https://openbot.ai/",
  },
  {
    key: "onebot",
    name: "OneBot",
    mode: "monthly",
    focusMonths: [10],
    schedule: "10月成交主攻",
    revenueTarget: 250000,
    offer: "海外 SaaS 社区获客 Agent",
    customer: "需要稳定获取高意向线索的海外 SaaS Founder",
    paidGate: "10 月底前拿到 1 个 $1k Setup 或 $3k+ 年付",
    href: "https://onebot.ai/",
  },
  {
    key: "koltools",
    name: "KOL.tools",
    mode: "monthly",
    focusMonths: [11],
    schedule: "11月成交主攻",
    revenueTarget: 150000,
    offer: "多客户内容审核与交付 Workspace",
    customer: "服务播客、课程和知识型频道的小型 Agency",
    paidGate: "11 月底前拿到 2 个 $1k–2k 付费 Pilot",
    href: "https://kol.tools/",
  },
  {
    key: "mutnpc",
    name: "MutNPC",
    mode: "monthly",
    focusMonths: [12],
    schedule: "12月成交主攻",
    revenueTarget: 100000,
    offer: "AI NPC Prototype / Playtest Pilot",
    customer: "需要快速验证 AI NPC 互动的海外独立游戏开发者",
    paidGate: "12 月底前拿到 1 个人工签约的付费 Pilot；不能把 Waitlist 当付款",
    href: "https://mutnpc.com/",
  },
] as const;

function buildMonthlyTargets(yearTarget: number): number[] {
  if (yearTarget <= 0) {
    return Array(12).fill(0);
  }

  const activeMonths = 12 - MONTHLY_TARGET_START_MONTH + 1;
  const weights = Array.from({ length: activeMonths }, (_, index) => MONTHLY_TARGET_GROWTH_RATIO ** index);
  const weightSum = weights.reduce((sum, weight) => sum + weight, 0);
  const rawTargets = weights.map((weight) => (yearTarget * weight) / weightSum);
  const roundedTargets = rawTargets.map(
    (value) => Math.floor(value / MONTHLY_TARGET_ROUNDING_UNIT) * MONTHLY_TARGET_ROUNDING_UNIT,
  );

  let remaining = yearTarget - roundedTargets.reduce((sum, value) => sum + value, 0);
  const remainderOrder = rawTargets
    .map((value, index) => ({ index, remainder: value - roundedTargets[index] }))
    .sort((left, right) => right.remainder - left.remainder || right.index - left.index);

  for (let orderIndex = 0; remaining > 0; orderIndex = (orderIndex + 1) % remainderOrder.length) {
    const { index } = remainderOrder[orderIndex];
    roundedTargets[index] += MONTHLY_TARGET_ROUNDING_UNIT;
    remaining -= MONTHLY_TARGET_ROUNDING_UNIT;
  }

  const targets = Array(12).fill(0);
  roundedTargets.forEach((value, index) => {
    targets[MONTHLY_TARGET_START_MONTH - 1 + index] = value;
  });

  return targets;
}

export function getMonthlyTarget(year: number, yearMonth: string): number {
  const monthPart = Number(yearMonth.split("-")[1]);

  if (!Number.isInteger(monthPart) || monthPart < 1 || monthPart > 12) {
    return 0;
  }

  const customTargets = CUSTOM_MONTHLY_TARGETS[year];
  if (customTargets) {
    return customTargets[monthPart - 1] ?? 0;
  }

  const yearTarget = YEAR_TARGETS[year] ?? 0;
  if (yearTarget <= 0) {
    return 0;
  }

  return buildMonthlyTargets(yearTarget)[monthPart - 1] ?? 0;
}

export interface AnnualRecoveryPace {
  remaining: number;
  daysRemaining: number;
  weeksRemaining: number;
  weeklyRequired: number;
  scheduledRemaining: number;
  scheduleGap: number;
}

/**
 * 用已入账收入计算年度追赶节奏。
 * 月度排期只用于暴露旧计划缺口，不会覆盖实际收入或年度剩余目标。
 */
export function getAnnualRecoveryPace(
  year: number,
  currentIncome: number,
  currentDate: string,
): AnnualRecoveryPace {
  const yearTarget = YEAR_TARGETS[year] ?? 0;
  const remaining = Math.max(yearTarget - Math.max(currentIncome, 0), 0);
  const [dateYear, dateMonth, dateDay] = currentDate.split("-").map(Number);
  const validDate =
    Number.isInteger(dateYear) &&
    Number.isInteger(dateMonth) &&
    Number.isInteger(dateDay) &&
    dateMonth >= 1 &&
    dateMonth <= 12 &&
    dateDay >= 1 &&
    dateDay <= 31;

  const currentUtc = validDate
    ? Date.UTC(dateYear, dateMonth - 1, dateDay)
    : Date.UTC(year, 0, 1);
  const endUtc = Date.UTC(year, 11, 31);
  const daysRemaining =
    dateYear > year
      ? 0
      : Math.max(Math.floor((endUtc - currentUtc) / 86400000) + 1, 1);
  const weeksRemaining = daysRemaining > 0 ? daysRemaining / 7 : 0;
  const weeklyRequired =
    remaining > 0 && weeksRemaining > 0
      ? Math.ceil(remaining / weeksRemaining)
      : 0;

  const startMonth = dateYear === year && validDate ? dateMonth : dateYear > year ? 13 : 1;
  const scheduledRemaining = Array.from({ length: 12 - Math.min(startMonth, 12) + 1 }, (_, index) => {
    const month = Math.min(startMonth, 12) + index;
    return startMonth > 12
      ? 0
      : getMonthlyTarget(year, `${year}-${String(month).padStart(2, "0")}`);
  }).reduce((sum, target) => sum + target, 0);

  return {
    remaining,
    daysRemaining,
    weeksRemaining,
    weeklyRequired,
    scheduledRemaining,
    scheduleGap: Math.max(remaining - scheduledRemaining, 0),
  };
}

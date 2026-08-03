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
  Hunter: 150000,
  SaaS: 600000,
  Media: 250000,
} as const;

/**
 * 每日 8H 自由时间的唯一分配来源。这里是日均预算；AIBounty 可把每日 1H
 * 合并为连续深挖块，但周总量不能因此扩大。
 */
export const BUSINESS_LINE_DAILY_HOURS_2026 = {
  Hunter: 1,
  SaaS: 5,
  Media: 2,
} as const;

export const DAILY_ALLOCATED_HOURS_2026 = 8;

/**
 * 晨间日志四个核心分类的每日番茄钟目标。
 * 每完成一次倒计时累计 1 个；达到目标后仍可继续累计，不封顶。
 */
export const MORNING_CORE_POMODORO_TARGETS = {
  saas: 5,
  ai_notes: 2,
  aibounty: 1,
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
    aibounty: 0,
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
// 2026年年度目标100万，按月递增分配（从6月开始）
// 6-12月目标总和：100万
const CUSTOM_MONTHLY_TARGETS: Partial<Record<number, number[]>> = {
  2026: [0, 0, 0, 0, 0, 50000, 70000, 100000, 140000, 180000, 220000, 240000],
};

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

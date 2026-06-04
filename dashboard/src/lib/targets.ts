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
  2026: 200000,
  2027: 1000000,
  2028: 5000000,
  2029: 10000000,
  2030: 20000000,
};

const MONTHLY_TARGET_START_MONTH = 3;
const MONTHLY_TARGET_GROWTH_RATIO = 1.3;
const MONTHLY_TARGET_ROUNDING_UNIT = 1000;
// 2026年年度目标20万，按月递增分配（从6月开始）
// 6-12月目标总和：20万
const CUSTOM_MONTHLY_TARGETS: Partial<Record<number, number[]>> = {
  2026: [0, 0, 0, 0, 0, 10000, 20000, 35000, 45000, 50000, 25000, 15000],
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

export const COAST_TARGET = 5000000;
// 终局目标当前值手动维护，不跟随收入流水自动统计。
export const COAST_CURRENT = 1700;
export const NET_WORTH_TARGET_2030 = 10000000;

export const YEAR_TARGETS: Record<number, number> = {
  2026: 2000000,
  2027: 3000000,
  2028: 5000000,
  2029: 10000000,
  2030: 20000000,
};

const MONTHLY_TARGET_START_MONTH = 3;
const MONTHLY_TARGET_GROWTH_RATIO = 1.3;
const MONTHLY_TARGET_ROUNDING_UNIT = 1000;
const CUSTOM_MONTHLY_TARGETS: Partial<Record<number, number[]>> = {
  2026: [0, 0, 0, 50000, 70000, 80000, 100000, 150000, 180000, 300000, 420000, 650000],
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

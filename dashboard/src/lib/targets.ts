export const COAST_TARGET = 5000000;

export const YEAR_TARGETS: Record<number, number> = {
  2026: 3000000,
  2027: 4000000,
  2028: 8000000,
  2029: 15000000,
  2030: 25000000,
};

const MONTHLY_TARGET_START_MONTH = 3;
const MONTHLY_TARGET_GROWTH_RATIO = 1.3;
const MONTHLY_TARGET_ROUNDING_UNIT = 1000;

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
  const yearTarget = YEAR_TARGETS[year] ?? 0;
  const monthPart = Number(yearMonth.split("-")[1]);

  if (!Number.isInteger(monthPart) || monthPart < 1 || monthPart > 12 || yearTarget <= 0) {
    return 0;
  }

  return buildMonthlyTargets(yearTarget)[monthPart - 1] ?? 0;
}

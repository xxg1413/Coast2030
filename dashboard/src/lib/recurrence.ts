/**
 * 任务重复匹配的纯函数模块：无数据库 / 环境依赖，可直接单测。
 * 语义文档见 dashboard/docs/recurrence.md。
 */

export type TaskRepeatMode = "none" | "daily" | "weekly" | "monthly";

const TASK_REPEAT_MODES: TaskRepeatMode[] = ["none", "daily", "weekly", "monthly"];

export function normalizeRepeatMode(value?: string): TaskRepeatMode {
    return TASK_REPEAT_MODES.includes(value as TaskRepeatMode) ? (value as TaskRepeatMode) : "none";
}

/** 重复任务按 ISO 日期字符串比较即可：同长度、同格式（YYYY-MM-DD）。 */
export function matchesTaskRecurrence(
    repeatMode: TaskRepeatMode,
    anchorDate: string,
    targetDate: string,
): boolean {
    if (repeatMode === "none" || !anchorDate || !targetDate) return false;
    if (targetDate < anchorDate) return false;
    if (repeatMode === "daily") return true;
    if (repeatMode === "weekly") {
        return (
            new Date(`${anchorDate}T00:00:00Z`).getUTCDay() ===
            new Date(`${targetDate}T00:00:00Z`).getUTCDay()
        );
    }
    // 每月：按"几号"匹配；锚点日超过目标月天数时钳制到月末（如 31 号 → 2 月 28/29 号）。
    const anchorDay = Number(anchorDate.slice(8, 10));
    const [targetYear, targetMonth] = targetDate.split("-").map(Number);
    const effectiveDay = Math.min(anchorDay, new Date(Date.UTC(targetYear, targetMonth, 0)).getUTCDate());
    return Number(targetDate.slice(8, 10)) === effectiveDay;
}

import assert from "node:assert/strict";
import { matchesTaskRecurrence, normalizeRepeatMode } from "../src/lib/recurrence.ts";

const cases: Array<[Parameters<typeof matchesTaskRecurrence>[0], string, string, boolean, string]> = [
    // daily：锚点日起每天出现，锚点前不出现
    ["daily", "2026-10-01", "2026-10-15", true, "daily 命中后一天"],
    ["daily", "2026-10-01", "2026-09-30", false, "daily 不回溯"],
    // weekly：同星期几
    ["weekly", "2026-10-07", "2026-10-14", true, "weekly 周三→周三"],
    ["weekly", "2026-10-07", "2026-10-11", false, "weekly 非同星期几"],
    ["weekly", "2026-10-07", "2026-09-30", false, "weekly 锚点前不回溯"],
    // monthly：按几号 + 月末钳制
    ["monthly", "2026-10-07", "2026-11-07", true, "monthly 同日"],
    ["monthly", "2026-10-07", "2026-11-08", false, "monthly 非同日"],
    ["monthly", "2026-01-31", "2026-02-28", true, "monthly 31 号钳制到 2 月末"],
    ["monthly", "2026-01-31", "2026-04-30", true, "monthly 31 号钳制到 4 月末"],
    ["monthly", "2026-01-31", "2026-03-30", false, "monthly 3 月 30 不是 31 号"],
    // none / 空锚点
    ["none", "2026-10-01", "2026-12-31", false, "none 永不重复"],
    ["daily", "", "2026-12-31", false, "空锚点安全跳过"],
];

for (const [mode, anchor, target, want, name] of cases) {
    assert.equal(matchesTaskRecurrence(mode, anchor, target), want, name);
}

assert.equal(normalizeRepeatMode("weekly"), "weekly");
assert.equal(normalizeRepeatMode("garbage"), "none");
assert.equal(normalizeRepeatMode(undefined), "none");

console.log(`recurrence 测试全部通过（${cases.length + 3} 项）`);

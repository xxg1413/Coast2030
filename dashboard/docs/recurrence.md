# 任务重复（Recurrence）设计与实现

> 覆盖三个板块：每日任务（`daily_tasks`）、本周焦点（`weekly_focus`）、本月关键点（`monthly_milestones`）。
> 相关提交：`9467452`（每日重复）→ `aa7e795`（改为编辑式）→ `49fd4a9`(周/月板块) → 修复（唯一索引 / 迁移容错 / 月末钳制）。

## 1. 产品语义

- **创建时不选重复**。任务建好后，行内 🔁 按钮随时设置或修改，对整个重复系列生效。
- 三种模式：
  | 板块 | 可选模式 | 锚点（series_anchor） |
  |---|---|---|
  | 每日任务 | 每天 / 每周 / 每月 | 日期：每天=起始日；每周=星期几；每月=几号（另存每条的时间） |
  | 本周焦点 | 每周 | ISO 周键（`2026-W41`），此后每周生成 |
  | 本月关键点 | 每月 | 月键（`2026-10`），此后每月生成 |
- **实例（instance）模型**：不预生成，打开某个日期/周/月时（`getDailyTasks` / `getStructuredWeeklyFocus` / `getMonthlyTasks` 读取路径）为命中的系列生成当期实例。实例是普通行，完成状态按期独立。
- **原型（prototype）**：生成新实例时取同系列 `id` 最大的一条的文本/目标线/时间。编辑任何一条的文本都会成为后续实例的模板。
- **删除分级**：垃圾桶 = 只删当前期这一条；🗓（删系列）= 删除 `series_id` 下全部行（含未来会再生成的源头——系列删光即终结）。
- **停止重复**：编辑重复改回「不重复」= 清空系列的 `repeat_mode/series_id/series_anchor`，已生成实例保留、不再继续生成。

## 2. 数据模型（迁移 v12–v14）

三张表各加三列（v12、v13）：

```sql
repeat_mode  TEXT NOT NULL DEFAULT 'none'   -- none | daily | weekly | monthly（各表只用其子集）
series_id    TEXT                           -- 同系列共享的 UUID；NULL = 普通任务
series_anchor TEXT NOT NULL DEFAULT ''      -- 锚点：日期 / 周键 / 月键
```

v14 加三个部分唯一索引，是并发安全的最终兜底：

```sql
CREATE UNIQUE INDEX uq_daily_tasks_series_date        ON daily_tasks(series_id, task_date)        WHERE series_id IS NOT NULL;
CREATE UNIQUE INDEX uq_weekly_focus_series_week       ON weekly_focus(series_id, week_key)        WHERE series_id IS NOT NULL;
CREATE UNIQUE INDEX uq_monthly_milestones_series_month ON monthly_milestones(series_id, year, month) WHERE series_id IS NOT NULL;
```

配套：三个 materialize 的 INSERT 均为 `INSERT OR IGNORE`——并发请求同时打开同一天时，输的那个静默放弃，不产生重复实例。

## 3. 匹配规则（纯函数，可单测）

- `matchesTaskRecurrence(mode, anchor, target)`（`src/lib/api.ts`，已导出）：
  - `target < anchor` 永远 false（不回溯生成）；
  - daily = 恒 true；weekly = 同 UTC 星期几；monthly = 目标日 == min(锚点日, 当月天数)——**月末钳制**，锚 31 号在 2 月落到 28/29 号；
  - 空 anchor 一律 false（安全跳过，不会死循环）。
- 周比较用 `year*100+week` 排名，月比较用 `year*100+month`，跨年（W53→W01、12月→1月）天然正确。
- 月度关键点的月度实例：文字日期前缀与 `milestone_datetime` 落进目标月，日超过目标月天数时取月末。

## 4. 写路径

| 函数 | 行为 |
|---|---|
| `setDailyTaskRecurrence(id, mode, anchorDate?, time?)` | 设 daily/weekly/monthly；对 `id OR series_id` 全组生效；time 会重写全组的文本前缀与 `task_datetime`；mode=none 解散系列 |
| `setWeeklyFocusRecurrence(id, mode, anchorWeek?)` | 只接受 weekly/none；锚点 `2026-W1` 自动补零为 `2026-W01` |
| `setMonthlyMilestoneRecurrence(id, mode, anchorMonth?)` | 只接受 monthly/none |
| `deleteDailyTask / deleteTask / deleteMonthlyTask(id, deleteSeries)` | `series=true` 时按 `series_id` 全删 |

API 路由（全部在登录中间件之后）：`/api/tasks/daily/repeat`、`/api/tasks/repeat`（周）、`/api/tasks/monthly/repeat`（月）；三个 delete 路由接收 `series` 布尔。

## 5. 已知限制与后续优化（按优先级）

1. **编辑重复会把系列锚点挪到编辑入口那条实例的日期**——在历史/未来实例上保存一次，徽章与后续生成日期随之漂移。后续可在 setter 里保持原 anchor 不变（只在系列无 anchor 时才取当前行）。
2. **编辑文本只改单条**，但原型取 `id` 最大者，"哪次编辑会传播到未来"对用户不可预期。后续可提供"应用到整个系列"选项。
3. **weekly 锚点是自由文本输入**，非法值静默回退当前周；应换成周选择器。
4. **读路径 materialize 串行 N+1**：每个系列 1–3 次 SELECT + INSERT。系列数增长后 TTFB 线性变差，可合并为 `INSERT … SELECT … WHERE NOT EXISTS` 或 `db.batch`。
5. **series 查询全表扫描**：`(series_id, …)` 索引帮不了 `repeat_mode != 'none'` 过滤；单用户量级无碍，长期可加 `repeat_mode` 部分索引或归档旧实例。
6. **本地 sql.js 每次 run() 全库落盘**（`db.ts`），materialize 批量生成时 dev 卡顿；可攒批写。
7. **"全部月份"视图不触发 materialize**，当月实例缺席；如需完整可在该分支也调用生成。
8. **三个组件约 150 行重复**（徽章/编辑面板/handler），可抽 `RepeatBadge` + `useRepeatEditor`。
9. repeat/delete 路由对不存在 id 返回 200 `{success:false}`；`id` 未做数字校验。无安全风险（都在鉴权后），可顺手收紧。
10. 无自动化测试；`matchesTaskRecurrence` 已导出，适合直接补单测（月末/跨年/ISO 周边界）。

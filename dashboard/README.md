# Coast2030 Dashboard

Coast2030 的年度计划与收入跟踪系统（Next.js + Cloudflare）。

## 当前功能

### 1) 年度主页
- 路径：`/`
- 展示 `Coast 2030 终局目标`
- 展示 `2026-2030` 年度卡片
- 当前可进入 `2026` 年度页

### 2) 2026 年度页
- 路径：`/2026`
- 标题：`2026个人计划`
- 晨间作战先显示「下一项」和「开始专注」。今日核心推进、基础习惯默认收起；核心推进不再放不可点的完成框，基础习惯只保留勾选
- 支持收入总览、执行与任务、收入明细
- 收入总览展示：本月收入、月度目标、年度累计、年度进度
- 月度目标从 `3 月` 开始计算，按指数增长分配全年目标，且按千位取整

### 3) 执行与任务
- 执行概览：展示本周焦点 / 本月关键点 / 每日任务的完成进度
- 本周焦点：新增 / 删除 / 完成 / 每周重复
- 本月关键点：新增 / 删除 / 完成 / 每月重复
- 每日任务：新增 / 编辑 / 删除 / 完成 / 每天 / 每周 / 每月重复
- **任务重复**（详见 [`docs/recurrence.md`](./docs/recurrence.md)）：
  - 创建任务时不选重复；每条任务上的 🔁 按钮随时设置/修改，对整个重复系列生效
  - 打开对应日期/周/月时自动生成该期实例（幂等，唯一索引兜底并发）
  - 徽章直接显示日程（如 `每周·周三` / `每月·7日` / `每月·从2026-10`）
  - 删除分两级：垃圾桶只删当前期这一条；重复任务多一个删系列按钮（确认后删全部）
  - 锚定 31 号的每月任务在短月自动落到月末（2 月 → 28/29 号）
- 新增时自动写入时间前缀（北京时间），格式示例：
  - `2026.2.13 14:00 复盘今日工作`

### 4) 100 天战役页
- 路径：`/100-days`
- 2026 收官冲刺记分牌：¥500,000 纯 SaaS 自助到账（人民币），窗口 2026-10-08 → 2026-12-31（备战周 10-01 起的到账计入）
- 只展示四块：倒计时、累计进度（进度条 + 日均/每周还需到账）、每日到账流水（最近 14 天）、目标常量
- 口径：只统计类型为 SaaS 的实际到账；每天在 `/2026` 收入明细录一个当日总数即可
- 目标与日期的唯一代码来源：`src/lib/targets.ts` 的 `SPRINT_100_2026`；文档：`38/100-day-plan.md`

### 5) 收入明细
- 按月筛选
- 支持记一笔
- 收入类型中文化显示

### 6) 登录认证
- 登录页自定义品牌样式
- Cookie 登录态保持 14 天。Coast 自身是第一方访问，生产环境使用 `HttpOnly + Secure + SameSite=Lax`
- Product Lab、AI Notes、AI Bounty 嵌在 Coast 里时各自记住登录。它们的会话 Cookie 是 `HttpOnly + Secure + SameSite=None + Partitioned`，同样 14 天。直接打开子站和从 Coast 打开是两套登录，各输入一次
- 账号密码通过环境变量配置（不再写死在代码里）
- 登录失败限流（按 IP，15 分钟窗口）

### 6) Coast Operator 0.4

- `/operator`：创建或撤销 Codex 连接 Token，并处理高风险动作审批
- `/mcp`：受 Bearer Token 保护的 Streamable HTTP MCP 地址
- Codex 可读取 2026 总览与工作台，管理日/周/月内部任务，并提交模型生成的今日计划
- `ainotes_*` / `productlab_*` / `aibounty_*` 工具组直接读写三个子项目看板（复用 `*_SYNC_PASSWORD` 密码登录 + session cookie，子项目零改动）
  - AI Notes：平台账号、写作任务、粉丝快照、收入记录
  - Product Lab：产品、路线图、推广活动、指标快照、收入记录、月度收入目标
  - AIBounty：目标池、漏洞管线、阶段任务、KPI、周复盘；**Paid 状态与 repo 来源记录不可写**（只能经 repo sync）
- 子项目更新型接口（PUT 全量覆盖）在 Coast 侧先取 state 合并再写回，不会抹掉未传字段
- 对外发布、向平台提交漏洞报告、部署、资产修改只创建审批请求，不会直接执行

连接生产环境：

```bash
export COAST_OPERATOR_TOKEN='<在 /operator 创建的 Token>'
codex mcp add coast-operator \
  --url https://coast.pxiaoer.blog/mcp \
  --bearer-token-env-var COAST_OPERATOR_TOKEN
```

添加后重启 Codex，再用 `/mcp` 检查连接状态。

## 数据迁移

- 迁移在应用启动（首次 `getDB()`）时自动执行，按 `schema_migrations.version` 增量应用，见 `src/lib/migrations.ts`
- 全部为加列/建表/建索引，可重入：语句失败若因"已存在"会跳过，不会卡死后续启动
- 与 `schema.sql` 的关系：`schema.sql` 是新库的完整快照；线上老库靠迁移演进。新增表结构时两处都要改

## 技术栈

- Next.js App Router
- Tailwind CSS + shadcn/ui
- 数据存储：
  - 本地开发：`sql.js` + `local.sqlite`
  - 线上生产：Cloudflare D1
- 部署：OpenNext + Cloudflare Workers

## 本地开发

```bash
pnpm dev
```

默认访问：`http://localhost:3000`

## 登录配置（必填）

本地请创建 `dashboard/.dev.vars`（可参考 `dashboard/.dev.vars.example`）：

```bash
NEXTJS_ENV=development
AUTH_USERNAME=pxiaoer
AUTH_PASSWORD_SALT=coast2030-login-salt
AUTH_PASSWORD_HASH=<sha256(salt:password)>
```

生成密码哈希：

```bash
pnpm auth:hash "Coast2030@1413" "coast2030-login-salt"
```

Cloudflare 线上建议使用 Secrets：

```bash
wrangler secret put AUTH_USERNAME
wrangler secret put AUTH_PASSWORD_SALT
wrangler secret put AUTH_PASSWORD_HASH
```

## 构建与部署

```bash
pnpm build
pnpm run deploy
```

## 目录说明

- `src/app/`：页面与 API
- `src/components/`：UI 与业务组件
- `src/lib/api.ts`：核心数据读写与业务逻辑
- `src/lib/db.ts`：本地 / D1 数据库适配
- `schema.sql`：数据库表结构
- `wrangler.jsonc`：Cloudflare 配置

## 注意事项

- 本地状态目录 `.wrangler/` 与本地环境文件 `.dev.vars` 已加入忽略，不提交到仓库。
- 若浏览器出现旧图标或旧样式，请强刷缓存（`Cmd/Ctrl + Shift + R`）。

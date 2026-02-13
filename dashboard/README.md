# Coast2030 Dashboard

Coast2030 的年度计划与收入跟踪系统（Next.js + Cloudflare）。

## 当前功能

### 1) 年度主页
- 路径：`/`
- 展示 `2026-2030` 年度卡片
- 当前可进入 `2026` 年度页

### 2) 2026 年度页
- 路径：`/2026`
- 标题：`2026个人计划`
- 支持收入总览、任务跟踪、收入明细

### 3) 任务跟踪
- 本月关键点：新增 / 删除 / 完成
- 每日任务：新增 / 编辑 / 删除 / 完成
- 新增时自动写入时间前缀（北京时间），格式示例：
  - `2026.2.13 14:00 复盘今日工作`

### 4) 收入明细
- 按月筛选
- 支持记一笔
- 收入类型中文化显示

### 5) 登录认证
- 登录页自定义品牌样式
- Cookie 登录态（生产环境 `Secure + SameSite=None`）

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

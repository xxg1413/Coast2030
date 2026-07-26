# Coast2030 设计系统

> Hallmark · genre: modern-minimal · macrostructure: Workbench · nav: N5 · footer: Ft2

## 1. 设计上下文

- **用户**：计划的唯一维护者本人。
- **核心任务**：首页判断 2030 长期进度与三个方向的年度状态；进入 `/2026` 后写下并推进可验证行动。
- **产品属性**：个人经营工作台，不是公开营销网站。
- **语气**：克制、直接、只陈述可验证事实。
- **保留项**：暖纸色背景、青绿色品牌强调色、中文系统字体、现有路由与业务组件。
- **明确删除**：装饰性渐变英雄区、重复展示的五年收入路线图、重复收入构成卡、横向滚动移动导航。

## 2. 设计原则

1. 首页是五年总盘，不放任务；晨间行动台必须出现在 `/2026` 首屏。
2. 现金只显示已入账数据；未知状态使用“未记录”，不填假数字。
3. 任务层级清楚：今天、本周、本月、年度，不重复同一指标。
4. 结构保持不对称：主工作区宽，诊断与追赶信息窄。
5. 卡片只在需要表达同一语义边界时使用，禁止卡中卡。
6. 移动端先保证操作：320、375、414、768 px 无横向滚动，点击目标不小于 44 px。

## 3. 页面结构

### 首页 `/`

使用 **Portfolio Overview**：

1. 2030 净资产目标、当前净资产与差距。
2. 2026 已到账、年度剩余和每周所需到账。
3. 三个方向的年度已到账、目标与当前下一步。
4. 2026–2030 年度收入目标与净资产里程碑的同轴路线。
5. 资产总盘与快照更新时间。
6. Ft2 单行页尾收束。

### 年度详情 `/2026`

使用 **Long Document**：

1. 晨间行动台。
2. 今日、本周、本月任务明细。
3. 年度与月度收入诊断。
4. 收入记录与组成。
5. 年度业务线分配。

## 4. 共享组件

- **N5 导航**：桌面为内容宽度悬浮胶囊；移动端为品牌＋菜单按钮。
- **按钮**：主按钮为深青绿底；次按钮为纸色底＋细边框。
- **数据**：全部使用等宽数字；任何进度都同时有文字，不依赖颜色。
- **空状态**：说明缺什么，并提供一个明确入口。
- **反馈**：可见结果采用静默成功；失败提供文字说明。

## 5. 跨 Dashboard 契约

- **Coast 首页**只负责组合判断：年度已到账、现金缺口、三条业务线状态与下一步。
- **子 Dashboard**负责执行下钻，不重复 Coast 的年度总览。
- **统一数据词汇**：年度目标、年度已到账、月度目标、月度已到账、证据、下一步、更新时间。
- **统一收入规则**：只有 Settled / Paid 计入完成度；Expected、Awarded、Pending 只作为管道信息展示。
- **AIBounty 首屏**：当前 Gate、唯一下一步、Submitted → Triaged → Awarded → Paid 漏斗与目标池。
- **Product Lab 首屏**：验证决策、开发 WIP、陈旧指标、KOL Clips 当前重点与已到账。
- **AI Notes 首屏**：本月内容重点、一个可验证任务、账号数据预警与已到账。
- **嵌入规则**：保留 Coast 主导航，隐藏子站重复页头；共享纸色背景，不出现双重滚动和固定像素高度。

## 6. 字体与文案

- **显示与正文**：同一套中文系统无衬线字体，以字号、字重和留白建立层级。
- **数据**：系统等宽字体。
- **标题**：短、左对齐、不使用斜体强调。
- **按钮**：使用具体动词，例如“打开年度明细”“录入资产快照”。
- **禁用语**：不使用“赋能”“重塑”“一站式”“智能驱动”等空泛措辞。

## 7. Tokens

源文件：[`tokens.css`](./tokens.css)

### CSS

```css
@import "../../tokens.css";
```

### Tailwind v4 `@theme`

```css
@theme {
  --color-paper: var(--color-paper);
  --color-paper-2: var(--color-paper-2);
  --color-paper-3: var(--color-paper-3);
  --color-ink: var(--color-ink);
  --color-ink-2: var(--color-ink-2);
  --color-rule: var(--color-rule);
  --color-rule-2: var(--color-rule-2);
  --color-muted: var(--color-muted);
  --color-neutral: var(--color-neutral);
  --color-coast: var(--color-accent);
  --font-display: var(--font-display);
  --font-body: var(--font-body);
  --font-outlier: var(--font-outlier);
  --spacing-3xs: var(--space-3xs);
  --spacing-2xs: var(--space-2xs);
  --spacing-xs: var(--space-xs);
  --spacing-sm: var(--space-sm);
  --spacing-md: var(--space-md);
  --spacing-lg: var(--space-lg);
  --spacing-xl: var(--space-xl);
  --spacing-2xl: var(--space-2xl);
}
```

### DTCG `tokens.json`

```json
{
  "$schema": "https://design-tokens.github.io/community-group/format/",
  "color": {
    "paper": { "$value": "oklch(95.5% 0.014 84)", "$type": "color" },
    "paper-2": { "$value": "oklch(98.5% 0.008 84)", "$type": "color" },
    "paper-3": { "$value": "oklch(92.5% 0.019 80)", "$type": "color" },
    "ink": { "$value": "oklch(18% 0.018 68)", "$type": "color" },
    "ink-2": { "$value": "oklch(27% 0.025 69)", "$type": "color" },
    "rule": { "$value": "oklch(87% 0.020 75)", "$type": "color" },
    "rule-2": { "$value": "oklch(72% 0.025 74)", "$type": "color" },
    "muted": { "$value": "oklch(51% 0.025 73)", "$type": "color" },
    "neutral": { "$value": "oklch(38% 0.025 70)", "$type": "color" },
    "accent": { "$value": "oklch(50% 0.120 195)", "$type": "color" },
    "accent-ink": { "$value": "oklch(98.5% 0.005 85)", "$type": "color" },
    "focus": { "$value": "oklch(25% 0.080 195)", "$type": "color" }
  },
  "font": {
    "display": { "$value": "-apple-system, BlinkMacSystemFont, Segoe UI, PingFang SC, Microsoft YaHei, sans-serif", "$type": "fontFamily" },
    "body": { "$value": "-apple-system, BlinkMacSystemFont, Segoe UI, PingFang SC, Microsoft YaHei, sans-serif", "$type": "fontFamily" },
    "outlier": { "$value": "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", "$type": "fontFamily" }
  },
  "duration": {
    "micro": { "$value": "120ms", "$type": "duration" },
    "short": { "$value": "220ms", "$type": "duration" },
    "long": { "$value": "420ms", "$type": "duration" }
  }
}
```

### shadcn/ui

```css
:root {
  --background: 95.5% 0.014 84;
  --foreground: 18% 0.018 68;
  --card: 98.5% 0.008 84;
  --card-foreground: 18% 0.018 68;
  --popover: 98.5% 0.008 84;
  --popover-foreground: 18% 0.018 68;
  --primary: 50% 0.120 195;
  --primary-foreground: 98.5% 0.005 85;
  --secondary: 92.5% 0.019 80;
  --secondary-foreground: 27% 0.025 69;
  --muted: 87% 0.020 75;
  --muted-foreground: 51% 0.025 73;
  --accent: 50% 0.120 195;
  --accent-foreground: 98.5% 0.005 85;
  --border: 87% 0.020 75;
  --input: 87% 0.020 75;
  --ring: 25% 0.080 195;
  --radius: 0.875rem;
}
```

## 8. 响应式与动效

- 40 rem：导航切换桌面/移动形态，业务跑道开始双列。
- 60 rem：首页形成 `1.45fr / 0.55fr` 工作区。
- 90 rem：仅放宽容器，不增加内容密度。
- 动效不超过三种：按钮按压、菜单开合、首屏一次性轻入场。
- `prefers-reduced-motion: reduce` 下移除空间位移，只保留不超过 150 ms 的状态切换。

# 🎯 Coast2030 个人仪表盘设计文档

> **核心理念**：一眼看清三大战场 + 收入 + 复盘进度，Push 优于 Pull

---

## 📊 监控体系

### 核心维度（5大板块）

```
┌─────────────────────────────────────────────────────┐
│         Coast2030 Dashboard (2026)                  │
├─────────────────────────────────────────────────────┤
│ 💰 现金流健康度    [本周] [本月] [本季度]           │
│ 🕵️  漏洞挖掘战线   [进行中] [已提交] [到账]         │
│ 🧑‍🌾 SaaS 农场     [活跃项目] [MRR] [用户数]        │
│ 📣 自媒体矩阵      [YouTube] [小红书] [X]           │
│ 📝 复盘进度        [周复盘] [月复盘]                │
└─────────────────────────────────────────────────────┘
```

---

## 1️⃣ 现金流健康度

### 关键指标
| 指标 | 时间范围 | 数据源 | 说明 |
| :--- | :--- | :--- | :--- |
| **总到账金额** | 本周/本月/本季 | 手动汇总 | 各渠道实际入账金额 |
| **收入结构占比** | 本月 | 计算得出 | Hunter / Farmer / 自媒体 |
| **距离目标差距** | 本月/本季 | 对比计算 | 目标完成率 |

### 展示样式
```
💰 现金流 (2026-01-20)
━━━━━━━━━━━━━━━━━━━━━━
本周：   $2,450  🟢 (+12%)
本月：   $8,730  🟡 (目标: $10,000, 87%)
Q1进度： $8,730  🔴 (目标: $100,000, 8.7%)

收入结构 (本月):
├─ 🕵️ Hunter:  65% ($5,675)
├─ 🧑‍🌾 Farmer:  20% ($1,746)
└─ 📣 自媒体:   15% ($1,309)
```

---

## 2️⃣ 漏洞挖掘战线（Hunter）

### 关键指标
| 指标 | 说明 | 数据源 |
| :--- | :--- | :--- |
| **进行中** | 正在测试的目标数量 | 手动记录 |
| **已提交** | 等待平台审核的报告数 | 平台后台 |
| **本周到账** | 本周到账金额 | Stripe/PayPal |
| **本月到账** | 本月累计到账 | 汇总计算 |

### 展示样式
```
🕵️ 漏洞挖掘 (Hunter)
━━━━━━━━━━━━━━━━━━━━━━
进行中:    3个目标
已提交:    5份报告 (等待审核)
本周到账:  $1,200
本月累计:  $5,675 (目标: $33,333, 17%)

⚠️ 提醒: 有2份报告超过14天未响应
```

---

## 3️⃣ SaaS 农场（Farmer）

### 关键指标
| 指标 | 说明 | 数据源 |
| :--- | :--- | :--- |
| **活跃项目数** | 当前在运营的SaaS数量 | 手动维护 |
| **总MRR** | 月度经常性收入 | Stripe API |
| **总用户数** | 所有产品的活跃用户总和 | 各产品数据库 |
| **本周新增MRR** | 本周新增订阅收入 | Stripe API |

### P0项目详情
| 项目 | 状态 | MRR | 用户数 | 本周增长 |
| :--- | :--- | :--- | :--- | :--- |
| Wukong CLI | 🛠 重构中 | $0 | 0 | - |
| BookFlow | 📅 规划中 | $0 | 0 | - |
| KOL Tools | 🟡 设计中 | $0 | 0 | - |

### 展示样式
```
🧑‍🌾 SaaS 农场 (Farmer)
━━━━━━━━━━━━━━━━━━━━━━
活跃项目:  3个 (Wukong, BookFlow, KOL Tools)
总MRR:     $0
总用户:    0人
本周增长:  +0 MRR | +0 用户

P0 项目状态:
├─ Wukong CLI:   🛠 重构中, 预计2周完成MVP
├─ BookFlow:     📅 需求设计阶段
└─ KOL Tools:    � UI设计中

⚠️ 提醒: Q1必须跑通1个MVP并拿到首单!
```

---

## 4️⃣ 自媒体矩阵

### 关键指标
| 平台 | 核心指标 | 变现门槛 | 数据源 |
| :--- | :--- | :--- | :--- |
| **YouTube** | 订阅数、观看时长 | 1000粉 + 4000小时 | YouTube API |
| **小红书** | 粉丝数、笔记阅读 | 1000粉（蒲公英） | 手动记录 |
| **X (Twitter)** | 粉丝数、展现量 | 500万展现 | Twitter API |

### 展示样式
```
📣 自媒体矩阵
━━━━━━━━━━━━━━━━━━━━━━
YouTube:
├─ 订阅: 64 → 5,000 (目标) | 本周 +12
└─ 观看: 120小时 / 4,000小时 (3%)

小红书:
├─ 粉丝: <1k → 5,000 (目标) | 本周 +0
└─ 笔记: 本周发布 0条

X (Twitter):
├─ 粉丝: <1k → 5,000 (目标) | 本周 +5
└─ 展现: 12,340 / 5,000,000 (0.2%)

📅 30天涨粉计划进度: Day 2/30
⚠️ 提醒: YouTube本周未发布内容!
```

---

## 5️⃣ 复盘进度

### 关键指标
| 类型 | 频率 | 完成状态 | 提醒 |
| :--- | :--- | :--- | :--- |
| **周复盘** | 每周日 20:00 | 本周已完成/未完成 | 距离本周复盘X天 |
| **月复盘** | 每月1号 | 本月已完成/未完成 | 距离月复盘X天 |

### 展示样式
```
📝 复盘进度
━━━━━━━━━━━━━━━━━━━━━━
周复盘:
├─ W03 (01-19): ✅ 已完成
├─ W04 (01-26): ⏰ 距离复盘日 6天
└─ 连续完成: 3周

月复盘:
├─ 2026-01: ⏰ 距离复盘日 12天
└─ 上次完成: 2025-12 (停滞1个月)

⚠️ 提醒: 今晚20:00需要进行周复盘!
```

---

## 🏗️ 技术架构

### 方案对比

| 方案 | 优势 | 劣势 | 推荐度 |
| :--- | :--- | :--- | :--- |
| **方案A: Telegram每日推送** | 零成本、简单直接 | 无可视化、无历史数据 | ⭐⭐⭐ |
| **方案B: Notion Database** | 有图表、可沉淀 | 需手动更新、无API自动化 | ⭐⭐ |
| **方案C: Web Dashboard** | 灵活强大、专业 | 开发成本高、有维护负担 | ⭐⭐⭐⭐⭐ |

### 🎯 推荐方案：双模式 (Telegram + Web)

```
┌─────────────────────────────────────┐
│     Phase 1: Telegram 每日推送       │  ← 立即可用
│     (GitHub Actions + Python)        │
└─────────────────────────────────────┘
              ↓ (迭代)
┌─────────────────────────────────────┐
│     Phase 2: Web Dashboard           │  ← 长期方案
│     (Next.js + Supabase)             │
└─────────────────────────────────────┘
```

---

## 📱 Phase 1: Telegram 每日推送

### 架构
- **触发**: GitHub Actions (cron: 每天 UTC 0:00 = 北京 8:00)
- **脚本**: Python (`dashboard.py`)
- **数据源**: 
  - Stripe API (收入数据)
  - YouTube Data API (订阅、观看)
  - Twitter API (粉丝、展现)
  - 本地文件 (手动记录的Hunter数据、复盘状态)
- **推送**: Telegram Bot API

### Telegram 消息模板
```markdown
🌞 **Coast2030 Daily Digest** 
📅 2026-01-20 (周一) | Day 20/365

━━━━━━━━━━━━━━━━━━━━━━

💰 **现金流**
本周:   $2,450 🟢 (+12%)
本月:   $8,730 🟡 (87%)
Q1:     $8,730 🔴 (8.7%)

━━━━━━━━━━━━━━━━━━━━━━

�️ **Hunter** | $5,675 (65%)
进行中: 3个  |  已提交: 5份

🧑‍🌾 **Farmer** | $1,746 (20%)
MRR: $0  |  用户: 0人

📣 **自媒体** | $1,309 (15%)
YT: 64 (+12)  |  XHS: <1k (+0)  |  X: <1k (+5)

━━━━━━━━━━━━━━━━━━━━━━

📝 **复盘提醒**
⏰ 今晚20:00周复盘 (W04)

━━━━━━━━━━━━━━━━━━━━━━

🚨 **今日重点**
1. 完成Wukong CLI重构
2. 发布YouTube Shorts
3. 提交2份漏洞报告
```

### 开发步骤
1. **准备Tokens** (1小时)
   - 创建 Telegram Bot (@BotFather)
   - 获取 Stripe Restricted Key
   - 获取 YouTube Data API Key
   - 获取 Twitter API Bearer Token

2. **编写脚本** (4小时)
   - `src/data_collector.py` - 各API数据采集
   - `src/formatter.py` - 格式化为Markdown
   - `src/telegram_sender.py` - Telegram发送
   - `src/config.yaml` - 配置文件

3. **配置GitHub Actions** (1小时)
   - `.github/workflows/daily_digest.yml`
   - 设置 Secrets (API Keys)

4. **测试运行** (1小时)

**总预计时间**: 7小时

---

## 🖥️ Phase 2: Web Dashboard (长期)

### 技术栈
```
Frontend:  Next.js 14 + TailwindCSS + shadcn/ui
Backend:   Supabase (Database + Auth + Edge Functions)
Charts:    Recharts / Chart.js
Deploy:    Vercel (Free Tier)
```

### 页面结构
```
Dashboard
├─ 📊 总览 (Overview)
│  ├─ 五大板块卡片
│  └─ 7天趋势图
├─ 💰 收入详情 (Revenue)
│  ├─ 收入结构饼图
│  ├─ 月度趋势
│  └─ 目标完成进度
├─ 🕵️ Hunter 控制台
│  ├─ 项目列表
│  ├─ 提交记录
│  └─ 到账记录
├─ 🧑‍🌾 Farmer 控制台
│  ├─ SaaS项目卡片
│  ├─ MRR趋势
│  └─ 用户增长
├─ 📣 自媒体矩阵
│  ├─ 各平台数据
│  ├─ 粉丝增长曲线
│  └─ 内容发布日历
└─ 📝 复盘记录
   ├─ 周/月复盘列表
   ├─ 完成率统计
   └─ 快速填写入口
```

### 数据库设计 (Supabase)
```sql
-- 收入记录
CREATE TABLE income_records (
  id UUID PRIMARY KEY,
  date DATE,
  source TEXT, -- 'hunter' | 'farmer' | 'media'
  amount DECIMAL,
  description TEXT,
  created_at TIMESTAMP
);

-- Hunter 项目
CREATE TABLE hunter_projects (
  id UUID PRIMARY KEY,
  target_name TEXT,
  status TEXT, -- 'testing' | 'submitted' | 'paid'
  amount DECIMAL,
  submitted_at DATE,
  paid_at DATE
);

-- SaaS 项目
CREATE TABLE saas_projects (
  id UUID PRIMARY KEY,
  name TEXT,
  status TEXT,
  mrr DECIMAL,
  users INTEGER,
  updated_at TIMESTAMP
);

-- 自媒体数据
CREATE TABLE media_metrics (
  id UUID PRIMARY KEY,
  platform TEXT,
  date DATE,
  followers INTEGER,
  metric_value JSONB -- 灵活存储各平台指标
);

-- 复盘记录
CREATE TABLE reviews (
  id UUID PRIMARY KEY,
  type TEXT, -- 'weekly' | 'monthly'
  date DATE,
  completed BOOLEAN,
  content TEXT
);
```

---

## 🎯 开发计划

### 里程碑

#### M1: Telegram 推送系统 (Week 1)
- [x] 任务规划
- [ ] 申请所有API Token
- [ ] 编写数据采集脚本
- [ ] 配置GitHub Actions
- [ ] 测试并上线

#### M2: 数据手动录入优化 (Week 2)
- [ ] 创建简单的Google Form/Notion模板
- [ ] 用于录入Hunter项目、复盘完成状态

#### M3: Web Dashboard MVP (Week 4-6)
- [ ] Supabase项目初始化
- [ ] Next.js项目搭建
- [ ] 总览页面开发
- [ ] 5大板块数据展示
- [ ] 部署到Vercel

#### M4: 完善与优化 (Week 7-8)
- [ ] 添加图表可视化
- [ ] 手机端适配
- [ ] 数据导入工具
- [ ] 性能优化

---

## 📋 数据录入规范

### Hunter 数据
**位置**: `2026/漏洞挖掘/projects.yaml`
```yaml
- name: "Target A"
  status: "testing"
  started: "2026-01-15"
  
- name: "Target B"
  status: "submitted"
  started: "2026-01-10"
  submitted: "2026-01-18"
  amount: 1200
```

### 复盘状态
**位置**: `2026/复盘/status.yaml`
```yaml
weekly:
  - week: "W03"
    date: "2026-01-19"
    completed: true
  - week: "W04"
    date: "2026-01-26"
    completed: false

monthly:
  - month: "2026-01"
    date: "2026-02-01"
    completed: false
```

---

## 🚀 快速启动

1. **立即可用**: 每周日手动填写周复盘，Excel记录收入
2. **1周后**: Telegram每日推送上线，自动汇总基础数据  
3. **1个月后**: Web Dashboard上线，可视化完整数据

---

**最后更新**: 2026-01-20  
**负责人**: @pxiaoer  
**优先级**: P0 (与SaaS开发并行)

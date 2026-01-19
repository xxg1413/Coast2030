# 🤖 Coast2030 Dashboard Automation (Spec)

> **核心理念**：Push > Pull。每天早上 8:00 自动把核心数据推送到手机，而不是我去登录 5 个后台查数据。

## 1. 架构方案 (Serverless & Zero Cost)

我们使用 **GitHub Actions** (每日定时触发) + **Python** 脚本 + **Telegram Bot** (触达) 的方案。

*   **成本**：$0
*   **维护**：低 (脚本只在 GitHub 上运行)
*   **扩展性**：高 (Python 可以调任何 API)

## 2. 数据源 (Data Sources)

| 模块 | 数据源 | 获取方式 | 关键指标 |
| :--- | :--- | :--- | :--- |
| **💰 资金** | **Stripe** | Stripe API | Balance, Net Volume (Last 24h) |
| **📺 自媒体** | **YouTube** | YouTube Data API | Subscriber Count, View Count |
| **🐦 自媒体** | **X** | Tweepy / API | Follower Count |
| **💻 流量** | **Google Search Console** | GSC API | Enpressions, Clicks |
| **🛡 漏洞** | *(手动/平台)* | *(暂无统一API，可手动录入或爬虫)* | *暂略* |

## 3. 每日早报模版 (Telegram Message)

```text
🌞 **Coast2030 Daily Report** (2026-01-20)

💰 **Money (24h)**
----------------
Stripe:   +$120.00
Bank:     (手动/不变)
Total:    $120.00

📈 **Growth**
----------------
YouTube:  10,234 (+12)
Twitter:   5,102 (+5)
SaaS UV:     450 (+10%)

🚨 **Alerts**
----------------
- SaaS A 流量下跌 20%
- Stripe 有一笔退款需要处理
```

## 4. 开发计划 (Action Plan)

1.  **准备 Token**：
    *   申请 Telegram Bot Token & Chat ID
    *   获取 Stripe Restricted Key (Read Only)
    *   获取 YouTube Data API Key
2.  **编写脚本 (`dashboard.py`)**：
    *   编写 Python 脚本请求上述 API。
    *   格式化为 Markdown 消息。
    *   调用 Telegram 发送接口。
3.  **配置 GitHub Actions**：
    *   创建 `.github/workflows/daily_report.yml`
    *   设置 `cron: '0 0 * * *'` (UTC 0点 = 北京时间 8点)

## 5. 扩展思路
如果你想看板更炫酷，也可以把数据推送到 **Notion Database**，利用 Notion 的 Chart 功能做可视化，但我建议初期先用 Telegram 纯文本，最为直接。

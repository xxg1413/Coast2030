# aigc.news 主站项目策划案（Benchmark × 变动 × 价格 × 第三方平台对比）

> 一句话定位：**aigc.news = AI 行业资讯驱动的决策平台 + 咨询服务**
> 以 AI 行业**资讯与动态**为基础，从中提取结构化的 **变更 Diff、价格对比、Benchmark 数据**，输出决策建议；同时提供专业咨询服务，帮助团队做出模型选型与迁移决策。

---

## 1. 背景与机会

* AI 生态变化速度极快：**API/SDK 变更、弃用迁移、限流变化、价格体系调整、同一模型在不同平台的差异**，会直接影响上线稳定性与成本。
* 现状是信息分散：官方文档、状态页、release notes、第三方平台定价页、社媒公告碎片化。
* 现有工具多为单点：
  * **LiteLLM / PortKey**：路由与网关，不做变更追踪与决策
  * **Artificial Analysis**：价格/速度对比，但无字段级 diff，且**缺乏中美头部模型的一致性对比**。
  * **StatusPage / UpDown**：只监控可用性，不解析 API 变更内容
  * **各厂商 Release Notes**：信息权威但分散，无法跨厂商对比### 1.6 域名与国际化策略 (Domain & I18n)

*   **域名决策**：使用 **`aigc.news`**
    *   *Pros*：直观、符合 "News/Updates" 定位、已有资产。
    *   *Cons*："AIGC" 一词在欧美常用度略低于 "GenAI"，但作为资讯聚合站完全可接受。
*   **语言策略**：**English First, Chinese Optional**
    *   默认界面与数据内容为**英文**（面向全球开发者，涵盖出海团队）。
    *   支持中文切换（服务国内团队与华人开发者）。
    *   **核心价值**：**覆盖中美两大 AI 主战场 (US-China G2 Ecosystem)**。全球唯二拥有完整 AI 产业链的国家，我们提供跨越两个生态的统一 Benchmark 与价格决策。
### 1.5 竞品分析与差异化 (Competitive Landscape)

我们不仅做“资讯”，更做“结构化的变更管理”。以下是与主要竞品的详细对比：

| 竞品类型 | 代表产品 | 核心优势 | 核心缺陷 (Our Opportunity) | 本竞品 (aigc.news) 差异点 |
| :--- | :--- | :--- | :--- | :--- |
| **数据/评测榜单** | **Artificial Analysis**, Chatbot Arena | 图表精美，Benchmark 数据权威，价格更新快 | **静态展示为主**，缺乏“变更推送”和“迁移行动指南”；只告诉你谁好，不告诉你“怎么换”。 | **Actionable**：不仅展示价格差，更直接给出 API 字段级 Diff 和迁移清单。 |
| **聚合新闻/Newsletter** | LastWeekInAI, Ben's Bites, TLDR | 覆盖面广，获取信息快，适合泛读 | **非结构化文本**，噪音大。对开发者而言，看完新闻还得自己去查文档确认“我的代码会不会挂”。 | **Structured**：将新闻结构化为 JSON/Diff，过滤噪音，只推“跟你代码相关”的变更。 |
| **LLM 网关/路由** | **LiteLLM**, PortKey, OpenRouter | 代码层面的统一接口，解决“怎么调”的问题 | 解决了**运行时**问题，但没解决**决策时**问题（我该切到这也吗？成本会变多少？质量会降吗？）。 | **Decision Support**：网关是执行端，我们是决策端。我们为网关配置提供决策依据。 |
| **官方文档/状态页** | OpenAI Cookbook, Vendor Docs | 最权威，最即时 | **碎片化**。需要同时盯着 10 个网页才能不漏掉关键变更；且官方通常掩盖负面变更（如降速、偷偷改限制）。 | **Single Pane of Glass**：一站式聚合，且保持中立第三方视角，不仅报喜也报忧。 |

> **一句话打法**：我们不是要取代 Artificial Analysis，而是比它更**实时**、更**工程化**；我们不是要取代 Newsletter，而是比它更**结构化**、更**窄众（面向开发者/决策者）**。

**机会点**：
1. **把“变化”做成“工单与决策”**。
2. **打通中西方模型的信息差**（Global vs CN Models），提供统一标准的 Benchmark 与价格对比。

---

## 2. 目标用户与痛点

### 2.1 目标用户（优先顺序）

1. **Agent / AI App builder（独立开发者、小团队）**：多模型、多平台、成本敏感
2. **出海工具工作室 / 增长团队**：预算敏感、稳定性敏感、需要快速替代
3. **更成熟的产品团队（Team/Enterprise）**：需要 Slack/Webhook、协作、审计、历史追溯

### 2.2 典型痛点

* 变更来得突然：弃用/Breaking 造成线上报错或质量回退
* 价格体系复杂：不同平台计费口径不一致，难算月成本
* 选型试错昂贵：没有可复现对比，测试一圈浪费一周
* 信息噪音大：想要“跟我相关”的变化，不想刷全网

---

## 3. 产品定位与核心价值

### 3.1 核心价值主张

* **资讯层（免费，获客入口）**：全行业 AI 资讯聚合，比用户自己刷快、全、准
* **工具层（订阅付费）**：从资讯中提取结构化 ChangeCard、价格矩阵、Benchmark，输出可执行的决策
* **咨询层（按项目付费）**：基于数据积累提供选型、迁移、成本优化的专业咨询

### 3.2 Wow Moment 设计

用户配置 My Stack（在用的供应商/模型/API/SDK/平台）后：

* 每天/实时收到 **Top 5 “必须处理”的变更卡**
* 每条卡包含 **字段级 diff + 影响评分 + 迁移清单 + 替代建议 + 成本差额**
  用户 30 秒决定：**跟进 / 忽略 / 迁移到哪**。

---

## 4. 交付物（你真正“卖”的东西）

### 4.1 四大交付物

1. **ChangeCard（变更卡）**

* 类型：API / Pricing / Limits / Deprecation / Launch
* 内容：Diff（before/after）+ Impact（分维度）+ Action（迁移/替代/灰度/回滚）

2. **Price Matrix（跨平台价格矩阵）**

* 官方直购 / 云平台 / 聚合平台 的价格拆项与归一化
* 绑定限制：地区、SLA、限流、上下文、条款
* 支持历史曲线与涨价/限流告警

3. **Benchmark Pack（评测数据聚合）**

* **核心来源**：主要聚合**第三方权威榜单**（如 Chatbot Arena, HELM, OpenCompass）与**厂商官方技术报告**。
* **辅助验证**：针对争议数据或特定场景（如长文本/Json Mode）进行少量验证性复现。
* 输出：质量评分、延迟分布、成功率、**单位成本（$/1k token 或 $/task）**。

4. **My Stack Radar（我的栈雷达）**

* 用户选择栈 → 只推相关变化
* Slack/Webhook/Email 推送
* CSV/JSON/Notion 导出

---

## 5. 范围与厂商策略（MVP 不做"所有"）

### 5.1 模态分类（Modality）

产品按 AI 模型能力类型划分为以下模态，用户可按模态筛选与订阅：

| 模态 | 说明 | MVP 优先级 |
|------|------|-----------|
| **LLM（文本生成）** | Chat/Completion、代码生成、推理 | P0 — 首批覆盖 |
| **Image Gen（文生图）** | DALL·E、Midjourney API、Stable Diffusion、Flux | P1 — V1 加入 |
| **Video Gen（视频生成）** | Sora、Runway、Kling、Veo | P2 — V2 加入 |
| **Audio/TTS/STT（语音）** | Whisper、ElevenLabs、Fish Audio | P2 — V2 加入 |
| **Embedding / Rerank** | 向量化、检索增强 | P1 — V1 加入 |
| **Multimodal（多模态输入）** | 视觉理解、文档解析 | 归入 LLM 子类 |

> 设计原则：模态是**一级分类维度**，厂商和平台是二级维度。用户先选"我关注哪些模态"，再选具体模型/平台。

### 5.2 厂商分层（按模态展开）

**Tier 1（核心模型供应商，MVP 锁定 Global + CN 头部）**

* **Global Leaders**: OpenAI, Anthropic, Google
* **CN Giants (High Global Impact)**:
    * **DeepSeek** (V3, R1) - 开源与性价比之王，全球关注
    * **Alibaba Qwen** (通义千问) - 开源界最强多模态与代码能力者
    * **Kimi / Baichuan / GLM** (视情况加入，主打中文长文本对比)
* **Image Gen**（V1 加入）：OpenAI (DALL·E)、Stability AI、Black Forest Labs (Flux)
* **Video Gen**（V2 加入）：OpenAI (Sora)、Runway、快手 (Kling)

**Tier 2（云平台分发，MVP 先做 2 家）**

* AWS Bedrock、Azure OpenAI
* 同一模型在不同云平台存在计费/限流/可用区差异

**Tier 3（第三方聚合/推理托管，MVP 先做 1–2 家）**

* Together AI、Fireworks、Replicate 等
* 价格差异与路由建议空间最大，付费用户也更集中

> MVP 只覆盖 **LLM 模态的 6–8 个对象**，先把"准、快、可执行"做出来，验证付费意愿后按 P1→P2 顺序扩展模态。

### 5.3 MVP 必盯的"变更类型"

* **API Breaking / Deprecation（最值钱）**
* **Pricing 变动（最可量化）**
* Limits（限流收紧）可并入 API 变更的子类
* Launch（新发产品）只收录"可能替代现有栈"的，避免噪音

---

## 6. 数据模型（统一 Change 对象）

### 6.1 Change 对象（核心）

* `id, vendor, product, modality, object, category, severity`
* `effective_time, first_seen, last_seen`
* `diff_before, diff_after, diff_keys[]`
* `impact_score(1-5), impact_dimensions{cost,reliability,migration,quality,compliance}`
* `impact_notes`
* `recommended_actions[]`
* `migration_deadline`
* `evidence_meta`（标题/时间/来源类型/片段标识；链接放详情页，不影响正文）

### 6.2 Price 对象（用于矩阵与归一化）

* `vendor, product_id, modality, platform, region, metering`
* `price_components{input,output,cache,toolcall,image,audio,video,...}`
* `unit_price_normalized`
* `limits{rpm,tpm,concurrency,context}`
* `terms{retention,training_use,compliance}`

### 6.3 Benchmark 对象（可复现）

* `task_id, task_version, dataset_ref`
* `run_config{provider,model,params,tools}`
* `metrics{quality,latency,success_rate,cost_per_task}`
* `run_time, environment, notes`

---

## 7. 产品功能设计

### 7.1 四个主视图

1. **Today Critical**：impact ≥ 4 的"必须处理"
2. **Modality Hub**：按模态（LLM / Image / Video / Audio / Embedding）分类浏览，每个模态下展示厂商对比、价格矩阵、最新变更
3. **My Stack**：只看与我相关（付费核心）
4. **Diff Explorer**：字段级 diff + 一键迁移清单

### 7.2 关键功能点

* 变更聚类：多来源合并为一个事件（去重、聚类、版本化）
* Impact 评分：规则优先（可审计），LLM 只负责生成说明与动作建议
* 归一化成本计算器：用户输入月用量 → 各平台月成本 + 风险提示
* 替代建议：结合 benchmark（质量/延迟）+ 价格（成本）+ limits（可用性），**同模态内**推荐替代方案
* 模态内对比：同一模态下不同厂商/模型的横向对比表（价格、质量、延迟、限制）
* 导出与推送：CSV/JSON/Slack/Webhook/Email（先做 1 个推送入口即可）

---

## 8. Agent-First, Human-Confirmed 工作流

### 8.1 Agent 负责（自动化）

* 抓取/监控变化 → 结构化抽取 → 生成 diff_keys
* 生成 impact_notes & recommended_actions 草稿
* 生成 benchmark 报告草稿（可复现配置）

### 8.2 Human 确认（提升可信度与品牌）

* 对 impact≥4 的变更进行人工校验（每日 Top N）
* 对关键价格项/弃用期限进行人工确认
* 把“可信度”做成产品卖点：**可审计、可追溯、可复现**

---

## 9. 收费策略（你要的“有人付费”）

> 三层价值：**资讯（免费获客）→ 工具订阅（标准化变现）→ 咨询服务（高客单价变现）**

### 9.1 订阅分层（建议）

**Free**

* 公共变更流（延迟 24h）
* 价格矩阵（不含历史曲线/不含导出）
* benchmark 只展示“结论摘要”（不开放配置/可复现细节）
* 无 My Stack、无 webhook

**Pro $29/月（核心付费层，个人开发者 / 小团队）**

* My Stack（最多 10 个对象）
* 实时告警（重大变更即时推）
* Diff Explorer（字段级 diff）
* 迁移清单导出
* 价格历史曲线 + 变动告警

**Team $99/月（5 seats，含协作功能）**

* 共享 My Stack（最多 30 个对象）、协作、审计
* Slack/Webhook 多路推送
* 周报（自动生成：本周影响/建议动作/成本变化）
* 更高配额/更深历史
* 额外 seat $15/月

### 9.2 咨询服务（高客单价）

基于 aigc.news 积累的行业数据与专业判断，提供付费咨询：

* **选型咨询**：根据客户业务场景，推荐模型/平台组合，输出选型报告
* **迁移方案**：厂商弃用或涨价时，提供迁移路径、风险评估、成本测算
* **成本优化**：分析客户当前用量，给出跨平台调配建议，降低月度支出
* 定价：按项目报价或按小时收费（$150–$300/小时），视客户规模而定
* 咨询能力的护城河：你掌握全行业的实时变更数据 + 跨平台对比数据，这是独立顾问不具备的

### 9.3 Benchmark 的计费（建议用 credits）

Benchmark 是成本中心，必须按量控制：

* **查看报告**：低 credits
* **复现运行/自定义对比**：高 credits（按任务长度/并发/多平台）
* Team/Enterprise 给更大 credits 包；超额单独售卖

---

## 10. MVP 范围与三个月路线图

### 10.1 MVP（第 1–4 周：验证核心价值）

* ChangeCard：API Breaking/Deprecation（字段级 diff），覆盖 Tier 1 的 4 家（OpenAI, Anthropic, Google, DeepSeek）
* Price Matrix：覆盖 Tier 1 + Tier 2 共 5–6 个平台的核心模型
* Diff Explorer：详情页（只读，暂不导出）
* 落地页 + 邮件订阅收集早期用户
* 目标：积累 200+ 邮件订阅，验证内容质量

### 10.2 V1（第 5–8 周：上线付费墙，收第一笔钱）

* My Stack：订阅与过滤（Pro 付费功能）
* 推送：Email 告警（选一个渠道先做通）
* Diff Explorer 增加导出（CSV/JSON）
* 归一化成本计算器（输入月用量 → 月成本对比）
* 上线 Pro 付费墙
* 目标：转化 30–50 个付费用户

### 10.3 V2（第 9–12 周：拉升 ARPU）

* 历史曲线与涨价/限流告警
* 替代建议（基于规则 + 少量 benchmark）
* Slack/Webhook 接入
* 团队协作（共享栈、审计、周报）→ Team 层上线
* 目标：Team 层试用转化 5–10 个团队

---

## 11. 技术架构（简版）

* 数据采集：定时抓取 + 页面 diff + 结构化解析（优先官方/文档/状态页）
* 事件聚类：相似度聚合（同一变更多来源归并）
* Diff 引擎：字段映射规则优先，LLM 辅助抽取，但必须输出 diff_keys
* 存储：Change/Price/Benchmark 三张主表 + 索引（时间/厂商/对象/严重度）
* 服务：REST API（先），MCP/Skill（后，作为分发壳）
* 前端：三视图（Today/MyStack/Diff Explorer）优先

---

## 12. 关键指标（验证"有人付费"）

| 阶段 | 指标 | 目标值 |
|------|------|--------|
| MVP | 邮件订阅数 | 200+ |
| MVP | ChangeCard 周阅读率 | ≥ 40% |
| V1 | 配置 My Stack 的注册转化率 | ≥ 15% |
| V1 | Pro 付费转化率（注册 → 付费） | ≥ 5% |
| V1 | 周活（每周至少访问 2 次） | ≥ 50% |
| V2 | 用户点击"迁移清单/导出/成本计算"比例 | ≥ 30% |
| V2 | Team 试用 → 付费转化率 | ≥ 10% |
| 长期 | 用户自报月节省成本 | ≥ $50/月 |

---

## 13. 风险与对策

* **数据不准 → 信任崩**：impact≥4 必须人审；证据可追溯
* **口径不统一 → 无法比较**：先定义归一化单位与字段映射表
* **覆盖面太大 → 成本爆**：严格 Tier1-3 分层，MVP 先 6–8 个对象
* **Benchmark 成本失控**：改为“聚合+验证”模式，大幅降低自测成本。
* **同质化**：把差异点锁定在“字段级 diff + impact + action + 可复现”

---

## 14. 短期策略与长期愿景

### 短期策略（快速验证与变现）

* 用**资讯内容**获客：高质量的行业动态是流量入口，SEO 和社媒分发
* 用"Critical 变更卡"制造强粘性（弃用/Breaking/限流收紧）
* 工具订阅验证 PMF：**先拿 50–200 个付费用户**
* 咨询作为早期现金流：在订阅规模起来之前，咨询可以先覆盖运营成本

### 长期愿景（做成基础设施）

* 资讯 → 数据沉淀：跨平台历史、变更知识库、影响评分体系
* Benchmark 标准化 → 路由建议 → ModelOps 决策与回归体系
* 咨询标准化：把高频咨询场景产品化，降低人力依赖
* 最终形态：aigc.news 成为"AI 行业的 Bloomberg Terminal" — 资讯 + 数据 + 决策 + 咨询一体

---

## 15. 最小化的“现在就能开工清单”

* [ ] 定义 Change/Price/Benchmark 的字段规范（上面可直接用）
* [ ] 选定 MVP 覆盖对象（6–8 个）
* [ ] 建 3 个页面：Today Critical / My Stack / Diff Explorer
* [ ] 上线 Pro 付费墙（My Stack + 实时告警 + diff + 导出）
* [ ] 先用手工+半自动保证质量（impact≥4 人审），用“可信度”换第一批付费

---

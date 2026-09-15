import Link from "next/link";
import { ArrowLeft, Cake } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatMoney, getBeijingCurrentDate } from "@/lib/api";
import { BIRTHDAY_YEAR_38 } from "@/lib/targets";

export const dynamic = "force-dynamic";

const DAY_MS = 86400000;

function toUtc(date: string): number {
  const [year, month, day] = date.split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}

const LINES = [
  {
    key: "saas",
    role: "唯一收入线",
    title: "SaaS",
    measure: "MRR ≥ $100k · 累计净利 ≥¥200万",
    next: "几乎必然指向高客单 B2B（如 10 客户 × $10k/月）；outbound 销售是主线，同时只验证 1 个主产品，连续 3 个月无真实付款直接止损。",
    meta: "背全部 200 万",
  },
  {
    key: "youtube",
    role: "获客引擎",
    title: "YouTube",
    measure: "≥40 条视频 · ≥20 个可归因转化",
    next: "每条视频挂 UTM / 专属落地页，月底按归因表对账；不能归因到 SaaS 成交的内容投入都属于偏离主线。",
    meta: "不设收入目标",
  },
  {
    key: "hunter",
    role: "机动线",
    title: "Hunter",
    measure: "本财年关停",
    next: "不投入新工时、不开新目标、不跑新 PoC；只在途提交被动收尾，到账算额外不抵计划。",
    meta: "只读维护",
  },
] as const;

const BOUNDARIES = [
  "并行主攻 ≤ 1 个产品 + 1 条获客线，超了先砍。",
  "单条线连续 3 个月达不到 Gate 证据要求 → 止损，不停下来复盘就视为违约。",
  "非谈判时间底线：9.19 定盘时填死（身体 / 家庭 / 睡眠）。",
] as const;

export default function BirthdayYear38Page() {
  const today = getBeijingCurrentDate();
  const nowUtc = toUtc(today);
  const startUtc = toUtc(BIRTHDAY_YEAR_38.start);
  const endUtc = toUtc(BIRTHDAY_YEAR_38.end);
  const totalDays = Math.floor((endUtc - startUtc) / DAY_MS) + 1;
  const daysToStart = Math.max(Math.ceil((startUtc - nowUtc) / DAY_MS), 0);
  const elapsedDays = Math.min(Math.max(Math.floor((nowUtc - startUtc) / DAY_MS) + 1, 0), totalDays);
  const daysRemaining = Math.max(totalDays - elapsedDays, 0);
  const timeProgress = Math.min((elapsedDays / totalDays) * 100, 100);
  const status =
    nowUtc < startUtc ? `距财年开盘 ${daysToStart} 天` : `财年第 ${elapsedDays} 天 · 剩 ${daysRemaining} 天`;

  return (
    <main className="coast-workbench">
      <div className="coast-shell coast-workbench-board">
        <header className="coast-workbench-board__header" aria-labelledby="by38-heading">
          <div className="coast-workbench-board__brand">
            <p className="coast-topline">
              <Cake aria-hidden="true" />
              Coast2030 · 生日财年
            </p>
            <h1 id="by38-heading">38 岁财年计划</h1>
            <p>
              {BIRTHDAY_YEAR_38.start} → {BIRTHDAY_YEAR_38.end} · 一个 SaaS + 一个 YouTube 账号跑出来
            </p>
          </div>
          <Link className="coast-button" href="/">
            <ArrowLeft aria-hidden="true" />
            2030 总览
          </Link>
        </header>

        <dl className="coast-workbench-board__pulse" aria-label="38 岁财年北极星">
          <div>
            <dt>净利润目标</dt>
            <dd>
              {formatMoney(BIRTHDAY_YEAR_38.netProfitTarget)}
              <span>到账 − 直接成本</span>
            </dd>
          </div>
          <div>
            <dt>SaaS MRR 终点</dt>
            <dd>
              ${BIRTHDAY_YEAR_38.mrrTargetUSD.toLocaleString()}
              <span>约束项 · 年化 ≈ ¥864万</span>
            </dd>
          </div>
          <div>
            <dt>财年进度</dt>
            <dd>
              {timeProgress.toFixed(1)}%
              <span>{status}</span>
            </dd>
          </div>
        </dl>

        <section aria-labelledby="by38-lines-heading">
          <div className="coast-section-heading coast-section-heading--compact">
            <div>
              <h2 id="by38-lines-heading">三条线的终点状态</h2>
              <p>验收口径：净利 = 实际到账 − 直接成本；同一笔收入只归属一条线。</p>
            </div>
          </div>
          <div className="coast-direction-grid">
            {LINES.map((line) => (
              <article key={line.key} className="coast-direction-row">
                <div className="coast-direction-row__head">
                  <div>
                    <p className="coast-lane__role">{line.role}</p>
                    <h3>{line.title}</h3>
                  </div>
                  <span className="coast-status">{line.meta}</span>
                </div>
                <p className="coast-direction-row__measure">{line.measure}</p>
                <p className="coast-direction-row__next">{line.next}</p>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="by38-gates-heading">
          <div className="coast-section-heading coast-section-heading--compact">
            <div>
              <h2 id="by38-gates-heading">季度 Gate（生日锚点）</h2>
              <p>每个 Gate 只做三件事：对账、砍项、重排。</p>
            </div>
          </div>
          <div className="coast-direction-grid">
            {BIRTHDAY_YEAR_38.gates.map((gate) => (
              <Card key={gate.key} className="border-stone-200 bg-white/78">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{gate.key}</p>
                    <p className="text-xs text-stone-500">{gate.date}</p>
                  </div>
                  <p className="mt-1.5 text-sm text-stone-700">{gate.note}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section aria-labelledby="by38-boundary-heading">
          <div className="coast-section-heading coast-section-heading--compact">
            <div>
              <h2 id="by38-boundary-heading">边界条件</h2>
              <p>先写不做什么；9.19 定盘后本计划冻结，财年内只在四个 Gate 调整。</p>
            </div>
          </div>
          <Card className="border-stone-200 bg-stone-950 text-white">
            <CardContent className="pt-4 pb-4">
              <ul className="space-y-2 text-sm text-stone-200">
                {BOUNDARIES.map((item) => (
                  <li key={item}>· {item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>

        <footer className="coast-footer">
          <span>源文档：仓库 38/plan.md · 38/gates.md；Gate 判定写入 gates.md。</span>
          <Link href="/2026">进入 2026 工作台</Link>
        </footer>
      </div>
    </main>
  );
}

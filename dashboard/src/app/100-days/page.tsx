import Link from "next/link";
import { ArrowLeft, ArrowRight, Hourglass } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatMoney, getBeijingCurrentDate, getTransactions, getYearIncome } from "@/lib/api";
import { BUSINESS_LINE_TARGETS_2026, getAnnualRecoveryPace } from "@/lib/targets";

export const dynamic = "force-dynamic";

const START = "2026-09-22";
const END = "2026-12-31";
const DAY_MS = 86400000;
const MONTHS = ["2026-09", "2026-10", "2026-11", "2026-12"] as const;

function toUtc(date: string): number {
  const [year, month, day] = date.split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}

export default async function Last100DaysPage() {
  const today = getBeijingCurrentDate();
  const nowUtc = toUtc(today);
  const startUtc = toUtc(START);
  const endUtc = toUtc(END);
  const totalDays = Math.floor((endUtc - startUtc) / DAY_MS) + 1;
  const daysToStart = Math.max(Math.ceil((startUtc - nowUtc) / DAY_MS), 0);
  const daysToEnd = Math.max(Math.ceil((endUtc - nowUtc) / DAY_MS), 0);
  const elapsedDays = Math.min(Math.max(Math.floor((nowUtc - startUtc) / DAY_MS) + 1, 0), totalDays);
  const status = nowUtc < startUtc
    ? `距启动 ${daysToStart} 天`
    : nowUtc > endUtc
      ? "活动已结束"
      : `第 ${elapsedDays} 天 · 距收官 ${daysToEnd} 天`;

  const [annualSaasIncome, transactions] = await Promise.all([
    getYearIncome(2026, "SaaS"),
    getTransactions(),
  ]);
  const target = BUSINESS_LINE_TARGETS_2026.SaaS;
  const campaignTransactions = transactions.filter(
    (transaction) =>
      transaction.type === "SaaS" &&
      transaction.date >= START &&
      transaction.date <= END &&
      transaction.date <= today,
  );
  const campaignIncome = campaignTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  const recovery = getAnnualRecoveryPace(2026, campaignIncome, today);
  const campaignProgress = target > 0 ? Math.min((campaignIncome / target) * 100, 100) : 0;
  const monthlyResults = MONTHS.map((month) => {
    const entries = campaignTransactions.filter((transaction) => transaction.date.startsWith(month));
    return {
      month,
      amount: entries.reduce((sum, transaction) => sum + transaction.amount, 0),
      count: entries.length,
    };
  });

  return (
    <main className="coast-workbench">
      <div className="coast-shell coast-workbench-board">
        <header className="coast-workbench-board__header" aria-labelledby="sprint-heading">
          <div className="coast-workbench-board__brand">
            <p className="coast-topline">
              <Hourglass aria-hidden="true" />
              Coast2030 · 2026 收官
            </p>
            <h1 id="sprint-heading">最后 100 天</h1>
            <p>{START} → {END} · 以期间内 SaaS 到账 {formatMoney(target)} 为终点</p>
          </div>
          <Link className="coast-button" href="/">
            <ArrowLeft aria-hidden="true" />
            2030 总览
          </Link>
        </header>

        <dl className="coast-workbench-board__pulse" aria-label="百日冲刺结果">
          <div>
            <dt>距年末收官</dt>
            <dd>
              {nowUtc > endUtc ? "已结束" : `${daysToEnd} 天`}
              <span>{status}</span>
            </dd>
          </div>
          <div>
            <dt>2026 SaaS 已到账</dt>
            <dd>
              {formatMoney(annualSaasIncome)}
              <span>年度目标 {formatMoney(target)}</span>
            </dd>
          </div>
          <div>
            <dt>百日新增到账</dt>
            <dd>
              {formatMoney(campaignIncome)}
              <span>9 月 22 日起 · {campaignTransactions.length} 笔记录</span>
            </dd>
          </div>
        </dl>

        <section aria-labelledby="sprint-result-heading">
          <div className="coast-section-heading coast-section-heading--compact">
            <div>
              <h2 id="sprint-result-heading">年度目标验收</h2>
              <p>只统计 {START} 起已记录的 SaaS 到账验收年度目标；更早的到账不计入。</p>
            </div>
          </div>
          <Card className="border-stone-200 bg-white/78">
            <CardContent className="space-y-4 pt-5 pb-5">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-sm text-stone-500">百日已到账 / 年度目标</p>
                  <p className="mt-1 text-2xl font-black tracking-tight text-stone-950 sm:text-3xl">
                    {formatMoney(campaignIncome)} / {formatMoney(target)}
                  </p>
                </div>
                <p className="text-xl font-bold text-emerald-700">{campaignProgress.toFixed(1)}%</p>
              </div>
              <Progress value={campaignProgress} className="h-2" indicatorClassName="bg-emerald-600" />
              <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-stone-600">
                <span>目标差额 {formatMoney(recovery.remaining)}</span>
                <span>当前每周需到账 {formatMoney(recovery.weeklyRequired)}</span>
                <span>数据截至 {today}</span>
              </div>
            </CardContent>
          </Card>
        </section>

        <section aria-labelledby="sprint-months-heading">
          <div className="coast-section-heading coast-section-heading--compact">
            <div>
              <h2 id="sprint-months-heading">百日到账记录</h2>
              <p>按到账日期归月；9 月只计 22 日及以后，后续月份随记录更新。</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {monthlyResults.map((result) => (
              <Card key={result.month} className="border-stone-200 bg-white/78">
                <CardContent className="pt-4 pb-4">
                  <p className="text-sm font-semibold text-stone-600">{result.month}</p>
                  <p className="mt-2 text-xl font-black text-stone-950">{formatMoney(result.amount)}</p>
                  <p className="mt-1 text-xs text-stone-500">
                    {result.count > 0 ? `${result.count} 笔已记录到账` : "暂无到账记录"}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <footer className="coast-footer">
          <span>结果来自看板已同步的 SaaS 到账记录；目标为 2026 年度目标。</span>
          <Link href="/2026">
            查看收入明细与录入
            <ArrowRight aria-hidden="true" />
          </Link>
        </footer>
      </div>
    </main>
  );
}

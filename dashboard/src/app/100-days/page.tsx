import Link from "next/link";
import { ArrowLeft, ArrowRight, Hourglass } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatMoney, getBeijingCurrentDate, getTransactions } from "@/lib/api";
import { SPRINT_100_2026 } from "@/lib/targets";

export const dynamic = "force-dynamic";

const DAY_MS = 86400000;
const RECENT_DAYS = 14;

function toUtc(date: string): number {
  const [year, month, day] = date.split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}

function toDateLabel(utc: number): string {
  return new Date(utc).toISOString().slice(0, 10);
}

export default async function Sprint100Page() {
  const { prepStart, start, end, target } = SPRINT_100_2026;

  const today = getBeijingCurrentDate();
  const nowUtc = toUtc(today);
  const startUtc = toUtc(start);
  const endUtc = toUtc(end);
  const totalDays = Math.floor((endUtc - startUtc) / DAY_MS) + 1;
  const daysToEnd = Math.max(Math.ceil((endUtc - nowUtc) / DAY_MS), 0);
  const elapsedDays = Math.min(Math.max(Math.floor((nowUtc - startUtc) / DAY_MS) + 1, 0), totalDays);
  const status =
    nowUtc < startUtc
      ? `备战周 · 距启动 ${Math.max(Math.ceil((startUtc - nowUtc) / DAY_MS), 0)} 天`
      : nowUtc > endUtc
        ? "战役已结束"
        : `第 ${elapsedDays} 天 / 共 ${totalDays} 天`;

  const transactions = await getTransactions();
  const campaignTransactions = transactions.filter(
    (transaction) =>
      transaction.type === "SaaS" &&
      transaction.date >= prepStart &&
      transaction.date <= end &&
      transaction.date <= today,
  );
  const campaignIncome = campaignTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  const progress = Math.min((campaignIncome / target) * 100, 100);
  const remaining = Math.max(target - campaignIncome, 0);
  const dailyRequired = daysToEnd > 0 ? Math.ceil(remaining / daysToEnd) : 0;

  const byDay = new Map<string, number>();
  for (const transaction of campaignTransactions) {
    byDay.set(transaction.date, (byDay.get(transaction.date) ?? 0) + transaction.amount);
  }

  const ledgerFrom = Math.max(toUtc(prepStart), nowUtc - (RECENT_DAYS - 1) * DAY_MS);
  const ledgerDays: Array<{ date: string; amount: number; cumulative: number }> = [];
  let cumulative = campaignTransactions
    .filter((transaction) => transaction.date < toDateLabel(ledgerFrom))
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  for (let dayUtc = ledgerFrom; dayUtc <= Math.min(nowUtc, endUtc); dayUtc += DAY_MS) {
    const date = toDateLabel(dayUtc);
    const amount = byDay.get(date) ?? 0;
    cumulative += amount;
    ledgerDays.push({ date, amount, cumulative });
  }
  const todayRecorded = (byDay.get(today) ?? 0) > 0;

  return (
    <main className="coast-workbench">
      <div className="coast-shell coast-workbench-board">
        <header className="coast-workbench-board__header" aria-labelledby="sprint-heading">
          <div className="coast-workbench-board__brand">
            <p className="coast-topline">
              <Hourglass aria-hidden="true" />
              Coast2030 · 2026 收官 · 纯 SaaS
            </p>
            <h1 id="sprint-heading">100 天战役</h1>
            <p>
              {start} → {end}（{totalDays} 天）· 备战周 {prepStart} 起计 · 终点：SaaS 到账{" "}
              {formatMoney(target)}（人民币）
            </p>
          </div>
          <Link className="coast-button" href="/">
            <ArrowLeft aria-hidden="true" />
            2030 总览
          </Link>
        </header>

        <dl className="coast-workbench-board__pulse" aria-label="战役进度">
          <div>
            <dt>倒计时</dt>
            <dd>
              {nowUtc > endUtc ? "已结束" : `${daysToEnd} 天`}
              <span>{status}</span>
            </dd>
          </div>
          <div>
            <dt>已到账</dt>
            <dd>
              {formatMoney(campaignIncome)}
              <span>
                {campaignTransactions.length} 笔 · 目标 {formatMoney(target)}
              </span>
            </dd>
          </div>
          <div>
            <dt>完成度</dt>
            <dd>
              {progress.toFixed(1)}%
              <span>还差 {formatMoney(remaining)}</span>
            </dd>
          </div>
          <div>
            <dt>日均还需到账</dt>
            <dd>
              {formatMoney(dailyRequired)}
              <span>剩余 {daysToEnd} 天摊平 · 数据截至 {today}</span>
            </dd>
          </div>
        </dl>

        <section aria-labelledby="sprint-main-heading">
          <div className="coast-section-heading coast-section-heading--compact">
            <div>
              <h2 id="sprint-main-heading">¥500k 进度</h2>
              <p>只统计 {prepStart} 起、类型为 SaaS 的实际到账；只有到账计，其他一律不算。</p>
            </div>
          </div>
          <Card className="border-stone-200 bg-white/78">
            <CardContent className="space-y-4 pt-5 pb-5">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-sm text-stone-500">已到账 / 承诺目标</p>
                  <p className="mt-1 text-2xl font-black tracking-tight text-stone-950 sm:text-3xl">
                    {formatMoney(campaignIncome)} / {formatMoney(target)}
                  </p>
                </div>
                <p className="text-xl font-bold text-emerald-700">{progress.toFixed(1)}%</p>
              </div>
              <Progress value={progress} className="h-2" indicatorClassName="bg-emerald-600" />
              <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-stone-600">
                <span>目标差额 {formatMoney(remaining)}</span>
                <span>日均需到账 {formatMoney(dailyRequired)}</span>
                <span>每周需到账 {formatMoney(dailyRequired * 7)}</span>
              </div>
            </CardContent>
          </Card>
        </section>

        <section aria-labelledby="sprint-ledger-heading">
          <div className="coast-section-heading coast-section-heading--compact">
            <div>
              <h2 id="sprint-ledger-heading">每日到账</h2>
              <p>
                最近 {RECENT_DAYS} 天流水；{todayRecorded ? "今日已记录" : "今日还没记录，去 2026 页录入今天的总数"}。
              </p>
            </div>
          </div>
          <Card className="border-stone-200 bg-white/78">
            <CardContent className="pt-4 pb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-stone-500">
                    <th className="pb-2 font-medium">日期</th>
                    <th className="pb-2 text-right font-medium">当日到账</th>
                    <th className="pb-2 text-right font-medium">累计</th>
                  </tr>
                </thead>
                <tbody>
                  {ledgerDays.map((day) => (
                    <tr
                      key={day.date}
                      className={`border-t border-stone-100 ${day.date === today ? "font-semibold" : ""}`}
                    >
                      <td className="py-1.5 text-stone-700">
                        {day.date}
                        {day.date === today ? " · 今天" : ""}
                      </td>
                      <td
                        className={`py-1.5 text-right tabular-nums ${
                          day.amount > 0 ? "text-emerald-700" : "text-stone-400"
                        }`}
                      >
                        {day.amount > 0 ? formatMoney(day.amount) : "—"}
                      </td>
                      <td className="py-1.5 text-right tabular-nums text-stone-600">
                        {formatMoney(day.cumulative)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </section>

        <footer className="coast-footer">
          <span>数据来自看板已同步的 SaaS 到账记录，每天记一个总数即可。</span>
          <Link href="/2026">
            录入今日到账
            <ArrowRight aria-hidden="true" />
          </Link>
        </footer>
      </div>
    </main>
  );
}

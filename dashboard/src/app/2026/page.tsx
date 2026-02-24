import Link from "next/link";
import Image from "next/image";
import {
  formatMoney,
  getBeijingCurrentDate,
  getBeijingCurrentYearMonth,
  getAvailableMonths,
  getDailyTasks,
  getIncomeComposition,
  getMonthlyTasks,
  getTotalIncome,
  getTransactions,
  getYearIncome,
} from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RetirementProgress } from "@/components/dashboard/retirement-progress";
import { DailyTaskList } from "@/components/dashboard/daily-task-list";
import { MonthlyTaskList } from "@/components/dashboard/monthly-task-list";
import { MonthFilter } from "@/components/dashboard/month-filter";
import { RevenueRecorder } from "@/components/dashboard/revenue-recorder";
import { TransactionList } from "@/components/dashboard/transaction-list";

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function getCompositionBarClass(type: string): string {
  switch (type) {
    case "Hunter":
      return "bg-blue-500";
    case "SaaS":
      return "bg-emerald-500";
    case "Media":
      return "bg-amber-500";
    default:
      return "bg-zinc-500";
  }
}

function getIncomeTypeLabel(type: string): string {
  switch (type) {
    case "Hunter":
      return "漏洞挖掘";
    case "SaaS":
      return "SaaS";
    case "Media":
      return "自媒体";
    case "Other":
      return "其他";
    default:
      return type;
  }
}

interface Props {
  searchParams: Promise<{ month?: string; day?: string; taskMonth?: string }>;
}

export default async function Year2026Page({ searchParams }: Props) {
  const params = await searchParams;
  const availableMonths = await getAvailableMonths();
  const fallbackMonth = availableMonths[0] || getBeijingCurrentYearMonth();
  const currentMonth = params.month && availableMonths.includes(params.month) ? params.month : fallbackMonth;
  const currentDay = params.day && DATE_REGEX.test(params.day) ? params.day : getBeijingCurrentDate();
  const currentTaskMonth =
    params.taskMonth === "all"
      ? "all"
      : params.taskMonth && availableMonths.includes(params.taskMonth)
        ? params.taskMonth
        : currentMonth;

  const [monthlyTasks, dailyTasks, transactions, lifetimeIncome, monthlyIncome, yearIncome, composition] =
    await Promise.all([
      getMonthlyTasks(currentTaskMonth === "all" ? undefined : currentTaskMonth),
      getDailyTasks(currentDay),
      getTransactions(currentMonth),
      getTotalIncome(),
      getTotalIncome(currentMonth),
      getYearIncome(2026),
      getIncomeComposition(currentMonth),
    ]);

  const yearTarget = 3000000;
  const annualProgress = Math.min((yearIncome / yearTarget) * 100, 100);
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-8">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <section className="rounded-2xl border border-zinc-800 bg-gradient-to-r from-zinc-900 via-zinc-900/70 to-zinc-950 p-5 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="flex items-center gap-4">
              <Image
                src="/coast-logo.svg"
                alt="Coast2030 Logo"
                width={52}
                height={52}
                className="h-12 w-12 rounded-xl border border-zinc-700/80"
              />
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Coast2030</p>
                <h1 className="mt-1 text-3xl md:text-4xl font-semibold bg-gradient-to-r from-blue-300 to-emerald-300 bg-clip-text text-transparent">
                  2026个人计划
                </h1>
              </div>
            </div>
            <div className="flex gap-4">
              <a
                href="https://aibounty.pxiaoer.blog/"
                className="text-sm text-emerald-300 hover:text-emerald-100 underline underline-offset-4"
              >
                🤖 AIBounty
              </a>
              <Link href="/" className="text-sm text-zinc-300 hover:text-white underline underline-offset-4">
                返回年度主页
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <RetirementProgress year={2026} yearIncome={yearIncome} lifetimeIncome={lifetimeIncome} />
          </div>
          <div className="lg:col-span-7">
            <Card className="h-full border-zinc-800 bg-zinc-900/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">收入总览</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-md border border-zinc-800 bg-zinc-950/60 p-3">
                    <p className="text-xs text-zinc-500">本月收入</p>
                    <p className="mt-1 text-lg font-semibold">{formatMoney(monthlyIncome)}</p>
                  </div>
                  <div className="rounded-md border border-zinc-800 bg-zinc-950/60 p-3">
                    <p className="text-xs text-zinc-500">年度累计</p>
                    <p className="mt-1 text-lg font-semibold">{formatMoney(yearIncome)}</p>
                  </div>
                  <div className="rounded-md border border-zinc-800 bg-zinc-950/60 p-3">
                    <p className="text-xs text-zinc-500">年度进度</p>
                    <p className="mt-1 text-lg font-semibold">{annualProgress.toFixed(1)}%</p>
                  </div>
                </div>

                {composition.map((item) => (
                  <div key={item.type} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-300">{getIncomeTypeLabel(item.type)}</span>
                      <span className="text-zinc-400">
                        {formatMoney(item.amount)} · {item.percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 rounded bg-zinc-800">
                      <div
                        className={`h-2 rounded ${getCompositionBarClass(item.type)}`}
                        style={{ width: `${Math.max(item.percentage, 2)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">任务跟踪</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <MonthlyTaskList tasks={monthlyTasks} month={currentTaskMonth} months={availableMonths} />
            </div>
            <div>
              <DailyTaskList date={currentDay} tasks={dailyTasks} />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xl font-semibold">收入明细</h2>
            <div className="flex gap-2">
              <MonthFilter months={availableMonths} currentMonth={currentMonth} />
              <RevenueRecorder />
            </div>
          </div>
          <TransactionList transactions={transactions} month={currentMonth} />
        </section>
      </div>
    </main>
  );
}

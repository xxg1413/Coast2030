import { PageHeader } from "@/components/dashboard/page-header";
import {
  formatMoney,
  getBeijingCurrentDate,
  getBeijingCurrentYearMonth,
  getAvailableMonths,
  getDailyTasks,
  getIncomeComposition,
  getMonthlyTasks,
  getStructuredWeeklyFocus,
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
import { WeeklyFocusList } from "@/components/dashboard/weekly-focus-list";
import { ExecutionSummary } from "@/components/dashboard/execution-summary";
import { getIncomeTypeConfig } from "@/lib/income-types";
import { getMonthlyTarget, YEAR_TARGETS } from "@/lib/targets";
import { CalendarCheck, ClipboardList, ExternalLink, TrendingUp, WalletCards } from "lucide-react";

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const AIBOUNTY_URL = process.env.NEXT_PUBLIC_AIBOUNTY_URL || "https://aibounty.pxiaoer.blog/";
const AI_NOTES_URL = process.env.NEXT_PUBLIC_AI_NOTES_URL || "https://ainote.pxiaoer.blog/";
const PRODUCT_LAB_URL = process.env.NEXT_PUBLIC_PRODUCT_LAB_URL || "https://productlab.pxiaoer.blog/";

interface Props {
  searchParams: Promise<{ month?: string; day?: string; taskMonth?: string }>;
}

export default async function Year2026Page({ searchParams }: Props) {
  const params = await searchParams;
  const availableMonths = await getAvailableMonths(2026);
  const currentCalendarMonth = getBeijingCurrentYearMonth();
  const fallbackMonth = availableMonths.includes(currentCalendarMonth)
    ? currentCalendarMonth
    : availableMonths[0] || currentCalendarMonth;
  const currentMonth = params.month && availableMonths.includes(params.month) ? params.month : fallbackMonth;
  const currentDay = params.day && DATE_REGEX.test(params.day) ? params.day : getBeijingCurrentDate();
  const currentTaskMonth =
    params.taskMonth === "all"
      ? "all"
      : params.taskMonth && availableMonths.includes(params.taskMonth)
        ? params.taskMonth
        : currentMonth;

  const [weeklyFocus, monthlyTasks, dailyTasks, transactions, monthlyIncome, yearIncome, composition] =
    await Promise.all([
      getStructuredWeeklyFocus(),
      getMonthlyTasks(currentTaskMonth === "all" ? undefined : currentTaskMonth),
      getDailyTasks(currentDay),
      getTransactions(currentMonth),
      getTotalIncome(currentMonth),
      getYearIncome(2026),
      getIncomeComposition(currentMonth),
    ]);

  const yearTarget = YEAR_TARGETS[2026] ?? 0;
  const monthTarget = getMonthlyTarget(2026, currentMonth);
  const annualProgress = Math.min((yearIncome / yearTarget) * 100, 100);
  const monthlyProgress = monthTarget > 0 ? Math.min((monthlyIncome / monthTarget) * 100, 100) : 0;
  const weeklyCompleted = weeklyFocus.tasks.filter((task) => task.completed).length;
  const monthlyCompleted = monthlyTasks.filter((task) => task.completed).length;
  const dailyCompleted = dailyTasks.filter((task) => task.completed).length;
  const dailyOpen = Math.max(dailyTasks.length - dailyCompleted, 0);
  const weeklyOpen = Math.max(weeklyFocus.tasks.length - weeklyCompleted, 0);
  const monthlyOpen = Math.max(monthlyTasks.length - monthlyCompleted, 0);
  const monthGap = Math.max(monthTarget - monthlyIncome, 0);

  const focusCards = [
    {
      label: "今日任务",
      value: `${dailyOpen} 项未完成`,
      meta: dailyTasks.length ? `${dailyCompleted}/${dailyTasks.length} 已完成 · ${currentDay}` : "今天还没有任务，先补一条最小行动。",
      icon: CalendarCheck,
    },
    {
      label: "本周焦点",
      value: `${weeklyOpen} 项待推进`,
      meta: weeklyFocus.tasks.length
        ? `${weeklyCompleted}/${weeklyFocus.tasks.length} 已完成 · 本月还有 ${monthlyOpen} 项关键点`
        : `本周焦点还没建立 · 本月还有 ${monthlyOpen} 项关键点`,
      icon: ClipboardList,
    },
    {
      label: "本月收入缺口",
      value: formatMoney(monthGap),
      meta: `本月 ${formatMoney(monthlyIncome)} / ${formatMoney(monthTarget)}，达成率 ${monthlyProgress.toFixed(1)}%。`,
      icon: WalletCards,
    },
    {
      label: "外部工作台",
      value: "三条业务线",
      meta: "Product Lab、AI Notes、AIBounty 已接入首页入口。",
      icon: ExternalLink,
    },
  ];

  return (
    <main className="min-h-screen text-stone-900 p-4 md:p-8">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <PageHeader
          title="2026个人计划"
          subtitle="Coast2030"
          navItems={[
            { label: "Product Lab", href: PRODUCT_LAB_URL, variant: "cyan", external: true },
            { label: "AI Notes", href: AI_NOTES_URL, variant: "amber", external: true },
            { label: "AIBounty", href: AIBOUNTY_URL, variant: "emerald", external: true },
            { label: "← 返回年度主页", href: "/", variant: "default" },
          ]}
        />

        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {focusCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <Card
                key={card.label}
                className={`border-stone-200 bg-white/82 shadow-[0_8px_30px_rgba(84,61,31,0.06)] ${index === 0 ? "ring-1 ring-emerald-200" : ""}`}
              >
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-medium uppercase tracking-[0.16em] text-stone-500">{card.label}</p>
                    <Icon className="h-4 w-4 text-emerald-700" />
                  </div>
                  <p className="text-xl font-semibold text-stone-950">{card.value}</p>
                  <p className="text-sm leading-6 text-stone-600">{card.meta}</p>
                </CardContent>
              </Card>
            );
          })}
        </section>

        <section className="grid gap-4 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <RetirementProgress year={2026} yearIncome={yearIncome} />
          </div>
          <div className="lg:col-span-7">
            <Card className="h-full border-stone-200 bg-white/78 shadow-[0_8px_30px_rgba(84,61,31,0.06)]">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-stone-500" />
                  收入总览
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                  {[
                    { label: "本月收入", value: formatMoney(monthlyIncome), sub: null },
                    { label: "月度目标", value: formatMoney(monthTarget), sub: `达成率 ${monthlyProgress.toFixed(1)}%` },
                    { label: "年度累计", value: formatMoney(yearIncome), sub: null },
                    { label: "年度进度", value: `${annualProgress.toFixed(1)}%`, sub: null },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2.5"
                    >
                      <p className="text-xs text-stone-500">{item.label}</p>
                      <p className="mt-0.5 text-lg font-semibold text-stone-900">{item.value}</p>
                      {item.sub && <p className="mt-0.5 text-xs text-stone-500">{item.sub}</p>}
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">收入来源构成</p>
                  {composition.map((item) => {
                    const config = getIncomeTypeConfig(item.type);
                    return (
                      <div key={item.type} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5">
                            <span className={`h-2 w-2 rounded-full ${config.dotClass}`} />
                            <span className="text-stone-700">{config.label}</span>
                          </div>
                          <span className="text-stone-500">
                            {formatMoney(item.amount)} · {item.percentage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="h-2 rounded bg-stone-200 overflow-hidden">
                          <div
                            className={`h-2 rounded ${config.barClass}`}
                            style={{ width: `${Math.max(item.percentage, 2)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">执行与任务</h2>
          <ExecutionSummary
            weekly={{
              label: "本周焦点",
              completed: weeklyCompleted,
              total: weeklyFocus.tasks.length,
              accentClassName: "bg-blue-500",
            }}
            monthly={{
              label: "本月关键点",
              completed: monthlyCompleted,
              total: monthlyTasks.length,
              accentClassName: "bg-amber-500",
            }}
            daily={{
              label: "每日任务",
              completed: dailyCompleted,
              total: dailyTasks.length,
              accentClassName: "bg-emerald-500",
            }}
          />
          <div className="grid gap-4 xl:grid-cols-3">
            <WeeklyFocusList tasks={weeklyFocus.tasks} />
            <MonthlyTaskList tasks={monthlyTasks} month={currentTaskMonth} months={availableMonths} />
            <DailyTaskList date={currentDay} tasks={dailyTasks} />
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

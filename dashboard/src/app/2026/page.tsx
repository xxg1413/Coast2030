import { PageHeader } from "@/components/dashboard/page-header";
import { MorningActionPanel } from "@/components/dashboard/morning-action-panel";
import {
  formatMoney,
  getBeijingCurrentDate,
  getBeijingCurrentYearMonth,
  getAvailableMonths,
  getDailyTasks,
  getAIBountyGoalProgress,
  getExternalTasks,
  getExternalSourceHealth,
  getIncomeComposition,
  getMorningLog,
  getMonthlyTasks,
  getStructuredWeeklyFocus,
  getTotalIncome,
  getTransactions,
  getYearIncome,
} from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DailyTaskList } from "@/components/dashboard/daily-task-list";
import { ExternalTaskList } from "@/components/dashboard/external-task-list";
import { MonthlyTaskList } from "@/components/dashboard/monthly-task-list";
import { MonthFilter } from "@/components/dashboard/month-filter";
import { RevenueRecorder } from "@/components/dashboard/revenue-recorder";
import { TransactionList } from "@/components/dashboard/transaction-list";
import { WeeklyFocusList } from "@/components/dashboard/weekly-focus-list";
import { getIncomeTypeConfig } from "@/lib/income-types";
import {
  BUSINESS_LINE_TARGETS_2026,
  getAnnualRecoveryPace,
  getMonthlyTarget,
  YEAR_TARGETS,
} from "@/lib/targets";
import { CalendarCheck, ClipboardList, ListTodo, Target, TrendingUp } from "lucide-react";

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
interface Props {
  searchParams: Promise<{ month?: string; day?: string; taskMonth?: string }>;
}

export default async function Year2026Page({ searchParams }: Props) {
  const params = await searchParams;
  const availableMonths = await getAvailableMonths(2026);
  const currentCalendarMonth = getBeijingCurrentYearMonth();
  const selectableMonths = Array.from(new Set([currentCalendarMonth, ...availableMonths])).sort((left, right) =>
    right.localeCompare(left),
  );
  const currentMonth =
    params.month && selectableMonths.includes(params.month)
      ? params.month
      : currentCalendarMonth;
  const currentDate = getBeijingCurrentDate();
  const currentDay = params.day && DATE_REGEX.test(params.day) ? params.day : currentDate;
  const currentTaskMonth =
    params.taskMonth === "all"
      ? "all"
      : params.taskMonth && selectableMonths.includes(params.taskMonth)
        ? params.taskMonth
        : currentMonth;

  const [
    weeklyFocus,
    morningLog,
    monthlyTasks,
    dailyTasks,
    externalTasks,
    externalHealth,
    aiBountyGoal,
    transactions,
    monthlyIncome,
    yearIncome,
    hunterIncome,
    saasIncome,
    mediaIncome,
    composition,
  ] =
    await Promise.all([
      getStructuredWeeklyFocus(),
      getMorningLog(currentDate),
      getMonthlyTasks(currentTaskMonth === "all" ? undefined : currentTaskMonth),
      getDailyTasks(currentDay),
      getExternalTasks(),
      getExternalSourceHealth(),
      getAIBountyGoalProgress(),
      getTransactions(currentMonth),
      getTotalIncome(currentMonth),
      getYearIncome(2026),
      getYearIncome(2026, "Hunter"),
      getYearIncome(2026, "SaaS"),
      getYearIncome(2026, "Media"),
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
  const recovery = getAnnualRecoveryPace(2026, yearIncome, currentDate);

  const executionRows = [
    {
      label: "今日任务",
      value: `${dailyOpen} 项未完成`,
      meta: dailyTasks.length ? `${dailyCompleted}/${dailyTasks.length} 已完成 · ${currentDay}` : "今天还没有任务，先补一条最小行动。",
      icon: CalendarCheck,
      accentClassName: "bg-emerald-600",
      progress: dailyTasks.length ? (dailyCompleted / dailyTasks.length) * 100 : 0,
    },
    {
      label: "本周焦点",
      value: `${weeklyOpen} 项待推进`,
      meta: weeklyFocus.tasks.length
        ? `${weeklyCompleted}/${weeklyFocus.tasks.length} 已完成 · 本月还有 ${monthlyOpen} 项关键点`
        : `本周焦点还没建立 · 本月还有 ${monthlyOpen} 项关键点`,
      icon: ClipboardList,
      accentClassName: "bg-cyan-600",
      progress: weeklyFocus.tasks.length ? (weeklyCompleted / weeklyFocus.tasks.length) * 100 : 0,
    },
    {
      label: "本月关键点",
      value: `${monthlyOpen} 项未完成`,
      meta: monthlyTasks.length ? `${monthlyCompleted}/${monthlyTasks.length} 已完成 · ${currentTaskMonth}` : "本月关键点还没建立。",
      icon: ListTodo,
      accentClassName: "bg-amber-500",
      progress: monthlyTasks.length ? (monthlyCompleted / monthlyTasks.length) * 100 : 0,
    },
  ];

  const incomeStats = [
    { label: "所选月收入", value: formatMoney(monthlyIncome), sub: `${currentMonth}` },
    { label: "所选月原排期", value: formatMoney(monthTarget), sub: `还差 ${formatMoney(monthGap)}` },
    { label: "年度剩余", value: formatMoney(recovery.remaining), sub: `剩余 ${recovery.daysRemaining} 天` },
    { label: "每周需入账", value: formatMoney(recovery.weeklyRequired), sub: `旧排期未覆盖 ${formatMoney(recovery.scheduleGap)}` },
  ];
  const targetLines = [
    { label: "Hunter", current: hunterIncome, target: BUSINESS_LINE_TARGETS_2026.Hunter, className: "bg-blue-600" },
    { label: "SaaS", current: saasIncome, target: BUSINESS_LINE_TARGETS_2026.SaaS, className: "bg-emerald-600" },
    { label: "Media", current: mediaIncome, target: BUSINESS_LINE_TARGETS_2026.Media, className: "bg-amber-500" },
  ];

  return (
    <main className="min-h-screen text-stone-900 px-4 py-4 md:px-6 md:py-6">
      <div className="mx-auto w-full max-w-[1280px] space-y-4">
        <PageHeader
          title="2026 个人计划"
          subtitle="晨间行动、任务、收入与回款明细"
        />

        <section className="coast-primary-workbench" aria-label="2026 晨间行动">
          <MorningActionPanel log={morningLog} />
        </section>

        <section className="space-y-4">
          <div>
            <p className="text-sm text-stone-500">任务列表</p>
            <h2 className="mt-1 text-xl font-semibold">执行与任务</h2>
          </div>
          <div className="grid gap-3 xl:grid-cols-3">
            <WeeklyFocusList tasks={weeklyFocus.tasks} title={weeklyFocus.title} />
            <MonthlyTaskList tasks={monthlyTasks} month={currentTaskMonth} months={selectableMonths} />
            <DailyTaskList date={currentDay} tasks={dailyTasks} />
            <ExternalTaskList tasks={externalTasks} health={externalHealth} />
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
          <Card className="glass-panel py-0">
            <CardHeader className="pb-2 pt-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-stone-500">当前执行</p>
                  <CardTitle className="mt-1 text-2xl font-bold">今天先推进这几件事</CardTitle>
                </div>
                <div className="rounded-full border border-emerald-200 bg-emerald-50/50 px-3 py-1 text-sm font-semibold text-emerald-800">
                  {dailyOpen + weeklyOpen + monthlyOpen} 项待处理
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-5">
              <div className="divide-y divide-stone-200">
                {executionRows.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="grid gap-3 py-4 md:grid-cols-[44px_1fr_auto] md:items-center">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-stone-50/60 text-emerald-700 border border-stone-100">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                          <p className="text-sm font-medium text-stone-500">{item.label}</p>
                          <p className="text-xl font-bold text-stone-955 tracking-tight">{item.value}</p>
                        </div>
                        <p className="mt-1 text-sm leading-6 text-stone-600">{item.meta}</p>
                        <Progress value={Math.min(item.progress, 100)} className="mt-3 h-2 bg-stone-200/50 rounded-full shadow-inner border border-white/20" indicatorClassName={item.accentClassName} />
                      </div>
                      <Target className="hidden h-4 w-4 text-stone-300 md:block" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel py-0">
            <CardHeader className="pb-2 pt-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-stone-500">收入进度</p>
                  <CardTitle className="mt-1 flex items-center gap-2 text-2xl font-bold">
                    <TrendingUp className="h-5 w-5 text-emerald-700" />
                    收入与追赶节奏
                  </CardTitle>
                </div>
                <RevenueRecorder />
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pb-4">
              <div className="grid grid-cols-2 gap-3">
                {incomeStats.map((item) => (
                  <div key={item.label} className="border-b border-stone-200/50 pb-3">
                    <p className="text-sm text-stone-500 font-medium">{item.label}</p>
                    <p className="mt-1 text-xl sm:text-2xl lg:text-3xl font-black text-stone-950 tracking-tight">{item.value}</p>
                    <p className="mt-0.5 text-xs text-stone-500 font-medium">{item.sub}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-stone-500 font-medium">原月度排期达成率</span>
                    <span className="font-bold text-stone-900">{monthlyProgress.toFixed(1)}%</span>
                  </div>
                  <Progress value={monthlyProgress} className="h-2.5 bg-stone-200/60 rounded-full border border-white/30 shadow-inner" indicatorClassName="bg-emerald-600" />
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-stone-500 font-medium">年度达成率</span>
                    <span className="font-bold text-stone-900">{annualProgress.toFixed(2)}%</span>
                  </div>
                  <Progress value={annualProgress} className="h-2.5 bg-stone-200/60 rounded-full border border-white/30 shadow-inner" indicatorClassName="bg-cyan-600" />
                </div>
              </div>

              <div className="space-y-2 border-t border-stone-200 pt-3">
                <p className="text-sm font-medium text-stone-900">收入来源构成</p>
                {composition.length === 0 ? (
                  <p className="text-sm text-stone-500">本月还没有收入记录。</p>
                ) : (
                  composition.map((item) => {
                    const config = getIncomeTypeConfig(item.type);
                    return (
                      <div key={item.type} className="space-y-1">
                        <div className="flex items-center justify-between gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            <span className={`h-2 w-2 rounded-full ${config.dotClass}`} />
                            <span className="text-stone-700">{config.label}</span>
                          </div>
                          <span className="text-stone-500">
                            {formatMoney(item.amount)} · {item.percentage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-stone-200">
                          <div
                            className={`h-full rounded-full ${config.barClass}`}
                            style={{ width: `${Math.max(item.percentage, 2)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xl font-semibold">收入明细</h2>
            <div className="flex gap-2">
              <MonthFilter months={selectableMonths} currentMonth={currentMonth} />
            </div>
          </div>
          <TransactionList transactions={transactions} month={currentMonth} />
        </section>

        <section className="space-y-3">
          <div>
            <p className="text-sm text-stone-500">年度统计</p>
            <h2 className="mt-1 text-xl font-semibold">年度收入与组合目标</h2>
          </div>
          <div className="grid gap-3 lg:grid-cols-[1.2fr_1fr_1fr_1fr]">
            <Card className="border-stone-200 bg-stone-950 text-white">
              <CardContent className="pt-5">
                <p className="text-sm text-stone-300">2026 唯一组合目标 · 已结算现金</p>
                <p className="mt-2 text-3xl font-black">{formatMoney(yearIncome)} / ¥1,000,000</p>
                <div className="mt-4 border-t border-stone-700 pt-3">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-stone-300">AIBounty 100 天独立目标</span>
                    <strong>
                      ${aiBountyGoal.receivedUsd.toLocaleString("en-US")} / ${aiBountyGoal.targetUsd.toLocaleString("en-US")}
                    </strong>
                  </div>
                  <Progress
                    value={aiBountyGoal.progress}
                    className="mt-2 h-2 bg-stone-700"
                    indicatorClassName="bg-emerald-500"
                  />
                  <p className="mt-2 text-xs text-stone-400">
                    {aiBountyGoal.progress.toFixed(1)}% · Submitted+ {aiBountyGoal.submittedCount}
                  </p>
                  <p className="mt-1 text-xs text-stone-500">该目标不覆盖 Hunter ¥30 万组合分配。</p>
                </div>
              </CardContent>
            </Card>
            {targetLines.map((line) => {
              const progress = Math.min((line.current / line.target) * 100, 100);
              return (
                <Card key={line.label} className="border-stone-200 bg-white/78">
                  <CardContent className="pt-5">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">{line.label}</p>
                      <p className="text-xs text-stone-500">{progress.toFixed(1)}%</p>
                    </div>
                    <p className="mt-2 text-xl font-bold">{formatMoney(line.current)}</p>
                    <p className="mt-1 text-xs text-stone-500">目标 {formatMoney(line.target)}</p>
                    <Progress value={progress} className="mt-3 h-2" indicatorClassName={line.className} />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}

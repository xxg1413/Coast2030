import Link from "next/link";
import { ArrowLeft, TrendingUp } from "lucide-react";
import { MorningActionPanel } from "@/components/dashboard/morning-action-panel";
import {
  formatMoney,
  getBeijingCurrentDate,
  getBeijingCurrentYearMonth,
  getAvailableMonths,
  getDailyTasks,
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
import { PomodoroSessionProvider } from "@/components/dashboard/task-pomodoro";
import { SaaSGrowthPortfolio } from "@/components/dashboard/saas-growth-portfolio";
import { getIncomeTypeConfig } from "@/lib/income-types";
import {
  BUSINESS_LINE_TARGETS_2026,
  getAnnualRecoveryPace,
  getMonthlyTarget,
  YEAR_TARGETS,
} from "@/lib/targets";

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
    transactions,
    monthlyIncome,
    yearIncome,
    saasIncome,
    composition,
  ] =
    await Promise.all([
      getStructuredWeeklyFocus(),
      getMorningLog(currentDate),
      getMonthlyTasks(currentTaskMonth === "all" ? undefined : currentTaskMonth),
      getDailyTasks(currentDay),
      getExternalTasks(),
      getExternalSourceHealth(),
      getTransactions(currentMonth),
      getTotalIncome(currentMonth),
      getYearIncome(2026),
      getYearIncome(2026, "SaaS"),
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
  const openTotal = dailyOpen + weeklyOpen + monthlyOpen;
  const monthGap = Math.max(monthTarget - monthlyIncome, 0);
  const recovery = getAnnualRecoveryPace(2026, yearIncome, currentDate);

  const incomeStats = [
    { label: "所选月收入", value: formatMoney(monthlyIncome), sub: currentMonth },
    { label: "所选月原排期", value: formatMoney(monthTarget), sub: `还差 ${formatMoney(monthGap)}` },
    { label: "年度剩余", value: formatMoney(recovery.remaining), sub: `剩余 ${recovery.daysRemaining} 天` },
    { label: "每周需入账", value: formatMoney(recovery.weeklyRequired), sub: `旧排期未覆盖 ${formatMoney(recovery.scheduleGap)}` },
  ];
  const targetLines = [
    { label: "SaaS", current: saasIncome, target: BUSINESS_LINE_TARGETS_2026.SaaS, className: "bg-emerald-600" },
  ];

  return (
    <main className="coast-workbench">
      <div className="coast-shell coast-workbench-board">
        <header className="coast-workbench-board__header" aria-labelledby="workbench-heading">
          <div className="coast-workbench-board__brand">
            <p className="coast-topline">Coast2030 · 执行工作台</p>
            <h1 id="workbench-heading">2026 工作台</h1>
            <p>晨间行动、任务推进与收入诊断；组合判断回 2030 总览。</p>
          </div>
          <Link className="coast-button" href="/">
            <ArrowLeft aria-hidden="true" />
            2030 总览
          </Link>
        </header>

        <dl className="coast-workbench-board__pulse" aria-label="2026 执行脉搏">
          <div>
            <dt>年已到账</dt>
            <dd>
              {formatMoney(yearIncome)}
              <span>
                / {formatMoney(yearTarget)} · {annualProgress.toFixed(1)}%
              </span>
            </dd>
          </div>
          <div>
            <dt>月缺口</dt>
            <dd>
              {formatMoney(monthGap)}
              <span>每周需 {formatMoney(recovery.weeklyRequired)}</span>
            </dd>
          </div>
          <div>
            <dt>待处理</dt>
            <dd>
              {openTotal} 项
              <span>
                今日 {dailyOpen} · 本周 {weeklyOpen} · 本月 {monthlyOpen}
              </span>
            </dd>
          </div>
        </dl>

        <PomodoroSessionProvider focusDate={currentDate} initialPomodoros={morningLog.pomodoros}>
          <section className="coast-workbench-board__morning" aria-label="2026 晨间行动">
            <MorningActionPanel log={morningLog} />
          </section>

          <SaaSGrowthPortfolio currentMonth={currentMonth} />

          <section className="coast-workbench-board__tasks" aria-labelledby="tasks-heading">
            <div className="coast-section-heading coast-section-heading--compact">
              <div>
                <h2 id="tasks-heading">执行与任务</h2>
                <p>今日、本周、本月与外部同步待办。</p>
              </div>
            </div>
            <div className="coast-workbench-board__task-grid">
              <WeeklyFocusList tasks={weeklyFocus.tasks} title={weeklyFocus.title} />
              <MonthlyTaskList tasks={monthlyTasks} month={currentTaskMonth} months={selectableMonths} />
              <DailyTaskList date={currentDay} tasks={dailyTasks} />
              <ExternalTaskList tasks={externalTasks} health={externalHealth} />
            </div>
          </section>
        </PomodoroSessionProvider>

        <section className="coast-workbench-board__income" aria-labelledby="income-heading">
          <div className="coast-section-heading coast-section-heading--compact">
            <div>
              <h2 id="income-heading">收入与追赶节奏</h2>
              <p>只统计已结算、已到账现金。</p>
            </div>
            <RevenueRecorder />
          </div>

          <Card className="glass-panel coast-workbench-board__income-card py-0">
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="flex items-center gap-2 text-lg font-bold">
                <TrendingUp className="h-4 w-4 text-emerald-700" />
                月度与年度诊断
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pb-4">
              <div className="coast-workbench-board__income-stats">
                {incomeStats.map((item) => (
                  <div key={item.label}>
                    <p className="text-sm font-medium text-stone-500">{item.label}</p>
                    <p className="mt-1 text-xl font-black tracking-tight text-stone-950 sm:text-2xl">{item.value}</p>
                    <p className="mt-0.5 text-xs font-medium text-stone-500">{item.sub}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <div>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="font-medium text-stone-500">原月度排期达成率</span>
                    <span className="font-bold text-stone-900">{monthlyProgress.toFixed(1)}%</span>
                  </div>
                  <Progress
                    value={monthlyProgress}
                    className="h-2 rounded-full border border-white/30 bg-stone-200/60 shadow-inner"
                    indicatorClassName="bg-emerald-600"
                  />
                </div>
                <div>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="font-medium text-stone-500">年度达成率</span>
                    <span className="font-bold text-stone-900">{annualProgress.toFixed(2)}%</span>
                  </div>
                  <Progress
                    value={annualProgress}
                    className="h-2 rounded-full border border-white/30 bg-stone-200/60 shadow-inner"
                    indicatorClassName="bg-cyan-600"
                  />
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

        <section className="coast-workbench-board__transactions" aria-labelledby="transactions-heading">
          <div className="coast-section-heading coast-section-heading--compact">
            <div>
              <h2 id="transactions-heading">收入明细</h2>
              <p>按月查看已结算记录。</p>
            </div>
            <MonthFilter months={selectableMonths} currentMonth={currentMonth} />
          </div>
          <TransactionList transactions={transactions} month={currentMonth} />
        </section>

        <section className="coast-workbench-board__lines" aria-labelledby="lines-heading">
          <div className="coast-section-heading coast-section-heading--compact">
            <div>
              <h2 id="lines-heading">年度收入与组合目标</h2>
              <p>全部年度收入目标归 SaaS；自媒体只承担可归因获客，Hunter 暂停。</p>
            </div>
          </div>
          <div className="coast-workbench-board__line-grid">
            <Card className="border-stone-200 bg-stone-950 text-white">
              <CardContent className="pt-4 pb-4">
                <p className="text-xs text-stone-300">2026 唯一组合目标 · 已结算现金</p>
                <p className="mt-1 text-2xl font-black">{formatMoney(yearIncome)} / ¥1,000,000</p>
                <div className="mt-3 border-t border-stone-700 pt-3">
                  <p className="text-sm font-semibold text-stone-200">OpenBot ¥50万 · OneBot ¥25万</p>
                  <p className="mt-1 text-sm font-semibold text-stone-200">KOL.tools ¥15万 · DeepFeather ¥10万</p>
                  <p className="mt-2 text-xs text-stone-400">Hunter 0H · 内容获客 2H/天 · 机动 1H/天</p>
                </div>
              </CardContent>
            </Card>
            {targetLines.map((line) => {
              const progress = Math.min((line.current / line.target) * 100, 100);
              return (
                <Card key={line.label} className="border-stone-200 bg-white/78">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">{line.label}</p>
                      <p className="text-xs text-stone-500">{progress.toFixed(1)}%</p>
                    </div>
                    <p className="mt-1.5 text-lg font-bold">{formatMoney(line.current)}</p>
                    <p className="mt-0.5 text-xs text-stone-500">目标 {formatMoney(line.target)}</p>
                    <Progress value={progress} className="mt-2.5 h-2" indicatorClassName={line.className} />
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

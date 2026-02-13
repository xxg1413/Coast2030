import { getStructuredWeeklyFocus, getMonthlyTasks, getCoreMetrics, getTransactions, getTotalIncome } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RevenueRecorder } from "@/components/dashboard/revenue-recorder";
import { TaskList } from "@/components/dashboard/task-list";
import { MonthlyTaskList } from "@/components/dashboard/monthly-task-list";
import { TransactionList } from "@/components/dashboard/transaction-list";
import { RetirementProgress } from "@/components/dashboard/retirement-progress";
import { MonthFilter } from "@/components/dashboard/month-filter";

interface Props {
  searchParams: Promise<{ month?: string }>;
}

export default async function Home({ searchParams }: Props) {
  const params = await searchParams;
  const currentMonth = params.month || new Date().toISOString().slice(0, 7);

  const weeklyFocus = await getStructuredWeeklyFocus();
  const monthlyTasks = await getMonthlyTasks();
  const metrics = getCoreMetrics();
  const transactions = await getTransactions(currentMonth);
  const totalIncome = await getTotalIncome(); // Total for Coast Progress (All time? Or Year?)
  // For RetirementProgress, it should be TOTAL (All Time / Year), not filtered month. 
  // User asked for "View income info for a month", but Retirement is usually global.
  // Exception: "2026 Goal" is usually Yearly. 
  // Let's keep totalIncome global for Goal, but we might want a monthly total in Finance section.

  const monthlyIncome = await getTotalIncome(currentMonth);

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8 bg-zinc-950 text-zinc-100">
      <div className="z-10 w-full max-w-6xl items-center justify-between font-mono text-sm">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-600">
            CoastOS v0.3
          </h1>
          {/* RevenueRecorder moved from here */}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="col-span-2">
            <RetirementProgress current={totalIncome} />
          </div>
          {metrics.map((metric) => (
            <Card key={metric.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {metric.label === 'Cash Flow' ? '现金流' :
                    metric.label === 'SaaS MRR' ? 'SaaS 月收' :
                      metric.label === 'Hunter' ? 'Hunter 收入' : metric.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <p className="text-xs text-muted-foreground">
                  {metric.trend} 较上月
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Task Section: Split View */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <TaskList title={weeklyFocus.title} tasks={weeklyFocus.tasks} />
          <MonthlyTaskList tasks={monthlyTasks} />
        </div>

        {/* Finance Section */}
        <div className="grid gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">💰 财务明细</h2>
            <div className="flex gap-2">
              <MonthFilter />
              <RevenueRecorder />
            </div>
          </div>
          {/* We can pass monthlyIncome to TransactionList or show it separately */}
          <div className="bg-zinc-900/50 p-4 rounded-lg flex justify-between items-center border border-zinc-800">
            <span className="text-muted-foreground">本月总收入:</span>
            <span className="text-xl font-bold text-emerald-400">¥{monthlyIncome.toLocaleString()}</span>
          </div>

          <TransactionList transactions={transactions} />
        </div>
      </div>
    </main>
  );
}

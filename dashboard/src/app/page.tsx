import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getYearIncome, getTotalIncome, formatMoney } from "@/lib/api";
import { COAST_TARGET, YEAR_TARGETS } from "@/lib/targets";

export const dynamic = "force-dynamic";

const YEAR_LINKS: Record<number, string | null> = {
  2026: "/2026",
  2027: null,
  2028: null,
  2029: null,
  2030: null,
};

export default async function Home() {
  const years = [2026, 2027, 2028, 2029, 2030];
  const [incomes, lifetimeIncome] = await Promise.all([
    Promise.all(years.map((year) => getYearIncome(year))),
    getTotalIncome(),
  ]);
  const coastProgress = COAST_TARGET > 0 ? Math.min((lifetimeIncome / COAST_TARGET) * 100, 100) : 0;

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-8">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <section className="rounded-2xl border border-zinc-800 bg-gradient-to-r from-zinc-900 via-zinc-900/70 to-zinc-950 p-6">
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
                P小二的5年退休计划
              </h1>
            </div>
          </div>
        </section>

        <section>
          <Card className="border-zinc-800 bg-gradient-to-br from-zinc-900/90 via-zinc-900/70 to-zinc-950/80">
            <CardHeader className="pb-3">
              <CardTitle className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-sm text-zinc-400">Coast 2030 终局目标</p>
                  <p className="mt-1 text-2xl font-semibold">{formatMoney(lifetimeIncome)}</p>
                </div>
                <div className="rounded-full border border-blue-500/30 bg-blue-500/15 px-3 py-1 text-xs text-blue-300">
                  目标 {formatMoney(COAST_TARGET)}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400">整体完成率</span>
                <span className="font-medium">{coastProgress.toFixed(2)}%</span>
              </div>
              <Progress value={coastProgress} className="h-3 bg-zinc-800" indicatorClassName="bg-blue-500" />
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {years.map((year, index) => {
            const income = incomes[index];
            const target = YEAR_TARGETS[year];
            const progress = target > 0 ? Math.min((income / target) * 100, 100) : 0;
            const link = YEAR_LINKS[year];

            const card = (
              <Card className="h-full border-zinc-800 bg-zinc-900/70 hover:border-zinc-700 transition-colors">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between text-lg">
                    <span>{year}</span>
                    <span className="text-xs text-zinc-400">{link ? "已开启" : "待开启"}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p className="text-zinc-300">年累计：{formatMoney(income)}</p>
                  <p className="text-zinc-400">年度目标：{formatMoney(target)}</p>
                  <p className="text-zinc-500">完成度：{progress.toFixed(1)}%</p>
                </CardContent>
              </Card>
            );

            if (!link) return <div key={year}>{card}</div>;
            return (
              <Link key={year} href={link} className="block">
                {card}
              </Link>
            );
          })}
        </section>
      </div>
    </main>
  );
}

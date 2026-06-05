import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BriefcaseBusiness, CalendarCheck, ExternalLink, Target, WalletCards } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AssetProgressCard } from "@/components/dashboard/asset-progress-card";
import { FiveYearRoadmap } from "@/components/dashboard/five-year-roadmap";
import { IncomeCompositionCard } from "@/components/dashboard/income-composition-card";
import { getAssetSnapshots, getBeijingCurrentDate, getYearIncome, getIncomeComposition, getYearIncomeComposition, formatMoney } from "@/lib/api";
import { NET_WORTH_TARGET_2030, NET_WORTH_MILESTONES, YEAR_TARGETS } from "@/lib/targets";

export const dynamic = "force-dynamic";

const YEAR_LINKS: Record<number, string | null> = {
  2026: "/2026",
  2027: null,
  2028: null,
  2029: null,
  2030: null,
};

const AIBOUNTY_URL = process.env.NEXT_PUBLIC_AIBOUNTY_URL || "https://aibounty.pxiaoer.blog/";
const AI_NOTES_URL = process.env.NEXT_PUBLIC_AI_NOTES_URL || "https://ainote.pxiaoer.blog/";
const PRODUCT_LAB_URL = process.env.NEXT_PUBLIC_PRODUCT_LAB_URL || "https://productlab.pxiaoer.blog/";

export default async function Home() {
  const years = [2026, 2027, 2028, 2029, 2030];
  const [incomes, assetSnapshots, monthlyComposition, yearlyComposition] = await Promise.all([
    Promise.all(years.map((year) => getYearIncome(year))),
    getAssetSnapshots(6),
    getIncomeComposition(),
    getYearIncomeComposition(),
  ]);

  // 构建5年路线图数据
  const currentYear = new Date().getFullYear();
  const roadmapData = years.map((year, index) => {
    const target = YEAR_TARGETS[year] || 0;
    const income = incomes[index] || 0;
    const progress = target > 0 ? Math.min((income / target) * 100, 100) : 0;

    let status: "completed" | "current" | "future" = "future";
    if (target > 0 && income >= target) {
      status = "completed";
    } else if (year === currentYear || (year < currentYear && target > 0)) {
      status = "current";
    }

    return {
      year,
      target,
      income,
      progress,
      isCompleted: status === "completed",
      isCurrent: status === "current",
      isFuture: status === "future",
    };
  });

  const totalTarget = roadmapData.reduce((sum, d) => sum + d.target, 0);
  const totalIncome = roadmapData.reduce((sum, d) => sum + d.income, 0);
  const totalProgress = totalTarget > 0 ? (totalIncome / totalTarget) * 100 : 0;
  const activeYearIncome = incomes[0] || 0;
  const activeYearTarget = YEAR_TARGETS[2026] || 0;
  const activeYearProgress = activeYearTarget > 0 ? Math.min((activeYearIncome / activeYearTarget) * 100, 100) : 0;
  const currentNetWorth = assetSnapshots[0]?.netWorth || 0;
  const assetProgress = NET_WORTH_TARGET_2030 > 0 ? Math.min((currentNetWorth / NET_WORTH_TARGET_2030) * 100, 100) : 0;

  const primaryActions = [
    {
      label: "2026 收入进度",
      title: "进入 2026 工作台",
      meta: `${formatMoney(activeYearIncome)} / ${formatMoney(activeYearTarget)} · ${activeYearProgress.toFixed(1)}%`,
      href: "/2026",
      external: false,
      icon: CalendarCheck,
    },
    {
      label: "2030 净资产",
      title: "更新资产快照",
      meta: `${formatMoney(currentNetWorth)} / ${formatMoney(NET_WORTH_TARGET_2030)} · ${assetProgress.toFixed(2)}%`,
      href: "#asset-progress",
      external: false,
      icon: WalletCards,
    },
    {
      label: "项目工作台",
      title: "打开 Product Lab",
      meta: "产品收入、路线图、推广和指标快照。",
      href: PRODUCT_LAB_URL,
      external: true,
      icon: ExternalLink,
    },
  ];

  const apps = [
    {
      title: "Product Lab",
      badge: "产品收入",
      href: PRODUCT_LAB_URL,
      description: "SaaS 目标、功能路线图、推广计划、指标快照与收入管理。",
      next: "看本月产品收入和下一项功能。",
    },
    {
      title: "AIBounty Plan",
      badge: "赏金回款",
      href: AIBOUNTY_URL,
      description: "漏洞挖掘计划、目标池、赏金记录与回款看板。",
      next: "看今日任务、本月回款待达成和未到账记录。",
    },
    {
      title: "AI Notes",
      badge: "内容增长",
      href: AI_NOTES_URL,
      description: "统一管理 AI 资讯、YouTube 提纲和内容资产。",
      next: "看本周内容任务、粉丝待达成和内容收入。",
    },
  ];

  return (
    <main className="min-h-screen text-stone-900 px-4 py-5 md:px-8 md:py-8">
      <div className="mx-auto w-full max-w-[1180px] space-y-6">
        <section className="overflow-hidden rounded-3xl border border-stone-200 bg-white/88 shadow-[0_24px_80px_rgba(72,50,22,0.10)] backdrop-blur">
          <div className="grid gap-6 p-5 md:grid-cols-[1.15fr_0.85fr] md:p-8">
            <div className="flex min-w-0 flex-col justify-between gap-7">
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <Image
                    src="/coast-logo.svg"
                    alt="Coast2030 Logo"
                    width={56}
                    height={56}
                    className="h-14 w-14 rounded-2xl border border-stone-200 bg-white"
                    priority
                  />
                  <div>
                    <p className="text-sm font-medium text-stone-500">Coast2030</p>
                    <h1 className="mt-1 text-3xl font-semibold leading-tight text-stone-950 md:text-5xl">
                      P小二的 5 年退休计划
                    </h1>
                  </div>
                </div>
                <p className="max-w-2xl text-base leading-7 text-stone-600 md:text-lg">
                  把 2026 收入目标、2030 净资产目标和三条项目线放在同一个执行面板里。
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/2026"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(4,120,87,0.22)] transition-colors hover:bg-emerald-800"
                >
                  进入 2026 工作台
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#asset-progress"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-5 text-sm font-semibold text-stone-800 transition-colors hover:bg-stone-50"
                >
                  更新资产快照
                  <WalletCards className="h-4 w-4" />
                </a>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1">
              {[
                {
                  label: "2026 收入",
                  value: formatMoney(activeYearIncome),
                  meta: `目标 ${formatMoney(activeYearTarget)} · ${activeYearProgress.toFixed(1)}%`,
                  accent: "bg-emerald-600",
                },
                {
                  label: "2030 净资产",
                  value: formatMoney(currentNetWorth),
                  meta: `目标 ${formatMoney(NET_WORTH_TARGET_2030)} · ${assetProgress.toFixed(2)}%`,
                  accent: "bg-cyan-600",
                },
                {
                  label: "累计收入路线",
                  value: `${totalProgress.toFixed(1)}%`,
                  meta: `${formatMoney(totalIncome)} / ${formatMoney(totalTarget)}`,
                  accent: "bg-amber-500",
                },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-stone-200 bg-stone-50/80 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-stone-500">{item.label}</p>
                    <span className={`h-2.5 w-2.5 rounded-full ${item.accent}`} />
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-stone-950">{item.value}</p>
                  <p className="mt-1 text-sm text-stone-600">{item.meta}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-3 md:grid-cols-3">
          {primaryActions.map((item, index) => {
            const Icon = item.icon;
            const content = (
              <div className={`flex h-full items-start justify-between gap-4 rounded-2xl border bg-white/82 p-4 shadow-[0_8px_30px_rgba(84,61,31,0.05)] transition-all hover:-translate-y-0.5 hover:border-stone-300 ${index === 0 ? "border-emerald-200" : "border-stone-200"}`}>
                <div className="min-w-0 space-y-1.5">
                  <p className="text-sm font-medium text-stone-500">{item.label}</p>
                  <h2 className="text-lg font-semibold leading-tight text-stone-950">{item.title}</h2>
                  <p className="text-sm leading-6 text-stone-600">{item.meta}</p>
                </div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            );

            if (item.external) {
              return (
                <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" className="block">
                  {content}
                </a>
              );
            }

            return (
              <a key={item.label} href={item.href} className="block">
                {content}
              </a>
            );
          })}
        </section>

        <FiveYearRoadmap
          yearData={roadmapData}
          totalTarget={totalTarget}
          totalIncome={totalIncome}
          totalProgress={totalProgress}
        />

        <div id="asset-progress">
        <AssetProgressCard
          snapshots={assetSnapshots}
          target={NET_WORTH_TARGET_2030}
          defaultDate={getBeijingCurrentDate()}
          milestones={NET_WORTH_MILESTONES}
        />
        </div>

        <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <Card className="border-stone-200 bg-white/78 py-0 shadow-[0_8px_30px_rgba(84,61,31,0.05)]">
            <CardHeader className="pb-3 pt-5">
              <CardTitle className="flex items-center gap-2 text-base">
                <Target className="h-4 w-4 text-emerald-700" />
                年度快照
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-5">
              <div className="divide-y divide-stone-200">
                {years.map((year, index) => {
                  const income = incomes[index];
                  const target = YEAR_TARGETS[year];
                  const progress = target > 0 ? Math.min((income / target) * 100, 100) : 0;
                  const link = YEAR_LINKS[year];
                  const row = (
                    <div className="grid grid-cols-[64px_1fr_auto] items-center gap-3 py-3">
                      <div>
                        <p className="font-semibold text-stone-950">{year}</p>
                        <p className={`mt-1 text-xs ${link ? "text-emerald-700" : "text-stone-400"}`}>
                          {link ? "已开启" : "待开启"}
                        </p>
                      </div>
                      <div className="min-w-0">
                        <div className="h-1.5 overflow-hidden rounded-full bg-stone-200">
                          <div
                            className="h-full rounded-full bg-emerald-600 transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <p className="mt-2 truncate text-sm text-stone-600">
                          {formatMoney(income)} / {formatMoney(target)}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-stone-900">{progress.toFixed(1)}%</p>
                    </div>
                  );

                  if (!link) return <div key={year}>{row}</div>;
                  return (
                    <Link key={year} href={link} className="block hover:bg-stone-50">
                      {row}
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <IncomeCompositionCard
            monthlyComposition={monthlyComposition}
            yearlyComposition={yearlyComposition}
          />
        </section>

        <section className="space-y-3">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm text-stone-500">项目工作台</p>
              <h2 className="mt-1 text-2xl font-semibold">三条业务线</h2>
            </div>
            <BriefcaseBusiness className="h-5 w-5 text-stone-500" />
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {apps.map((app) => (
              <a key={app.title} href={app.href} target="_blank" rel="noopener noreferrer" className="block">
                <div className="h-full rounded-2xl border border-stone-200 bg-white/78 p-4 shadow-[0_8px_30px_rgba(84,61,31,0.05)] transition-all hover:-translate-y-0.5 hover:border-stone-300">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-lg font-semibold text-stone-950">{app.title}</h3>
                    <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs text-stone-600">{app.badge}</span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-stone-700">{app.description}</p>
                  <p className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-emerald-700">
                    {app.next}
                    <ArrowRight className="h-4 w-4" />
                  </p>
                </div>
              </a>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

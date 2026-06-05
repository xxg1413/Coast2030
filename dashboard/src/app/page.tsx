import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BriefcaseBusiness, CalendarCheck, ExternalLink, Target, WalletCards, Layers } from "lucide-react";
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
      href: "/productlab",
      external: false,
      icon: Layers,
    },
  ];

  const apps = [
    {
      title: "Product Lab",
      badge: "产品收入",
      href: "/productlab",
      description: "SaaS 目标、功能路线图、推广计划、指标快照与收入管理。",
      next: "看本月产品收入和下一项功能。",
    },
    {
      title: "AIBounty Plan",
      badge: "赏金回款",
      href: "/aibounty",
      description: "漏洞挖掘计划、目标池、赏金记录与回款看板。",
      next: "看今日任务、本月回款待达成和未到账记录。",
    },
    {
      title: "AI Notes",
      badge: "内容经营",
      href: "/ainotes",
      description: "内容生产、账号池、内容规划与粉丝增长经营台。",
      next: "看今日任务、待写作内容与本月增长经营细节。",
    },
  ];

  return (
    <main className="min-h-screen p-4 text-stone-900 md:p-8">
      <div className="mx-auto w-full max-w-[1280px] space-y-4">
        {/* Hero Banner Panel */}
        <section className="overflow-hidden rounded-3xl glass-panel">
          <div className="grid gap-4 p-5 md:grid-cols-[1.25fr_0.75fr] md:p-6 lg:p-7">
            <div className="flex min-w-0 flex-col justify-between gap-4 md:gap-5">
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <Image
                    src="/coast-logo.svg"
                    alt="Coast2030 Logo"
                    width={56}
                    height={56}
                    className="h-14 w-14 rounded-2xl border border-white/80 bg-white shadow-sm"
                    priority
                  />
                  <div>
                    <p className="text-xs font-semibold tracking-wider text-emerald-800 uppercase">Coast2030</p>
                    <h1 className="mt-1 text-2xl font-black tracking-tight text-stone-900 md:text-3xl lg:text-4xl">
                      P小二的 5 年退休计划
                    </h1>
                  </div>
                </div>
                <p className="max-w-xl text-sm leading-relaxed text-stone-600 md:text-base">
                  将 2026 收入目标、2030 净资产目标和三条项目线的进度整合在同一个智能执行面板里，每日打卡推进。
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/2026"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 text-sm font-bold text-white shadow-[0_8px_24px_rgba(4,120,87,0.25)] transition-all hover:bg-emerald-800 hover:scale-[1.02] active:scale-[0.98]"
                >
                  进入 2026 工作台
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#asset-progress"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl glass-btn px-6 text-sm font-bold text-stone-800 transition-all hover:scale-[1.02]"
                >
                  更新资产快照
                  <WalletCards className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1">
              {[
                {
                  label: "2026 收入进度",
                  value: formatMoney(activeYearIncome),
                  meta: `目标 ${formatMoney(activeYearTarget)} · ${activeYearProgress.toFixed(1)}%`,
                  accent: "bg-emerald-600",
                },
                {
                  label: "2030 目标净资产",
                  value: formatMoney(currentNetWorth),
                  meta: `目标 ${formatMoney(NET_WORTH_TARGET_2030)} · ${assetProgress.toFixed(2)}%`,
                  accent: "bg-cyan-600",
                },
                {
                  label: "五年累计收入路线",
                  value: `${totalProgress.toFixed(1)}%`,
                  meta: `${formatMoney(totalIncome)} / ${formatMoney(totalTarget)}`,
                  accent: "bg-amber-500",
                },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/60 bg-white/40 p-3 px-4 backdrop-blur-sm transition-all hover:bg-white/60">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">{item.label}</p>
                    <span className={`h-2.5 w-2.5 rounded-full ${item.accent} animate-pulse`} />
                  </div>
                  <p className="mt-1.5 text-2xl lg:text-3xl font-black text-stone-950 tracking-tight">{item.value}</p>
                  <p className="mt-0.5 text-xs font-medium text-stone-600">{item.meta}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Primary Action Shortcuts */}
        <section className="grid gap-3 md:grid-cols-3">
          {primaryActions.map((item, index) => {
            const Icon = item.icon;
            const content = (
              <div className={`flex h-full items-start justify-between gap-4 rounded-2xl p-5 transition-all glass-panel glass-panel-hover ${index === 0 ? "border-emerald-300/60 bg-emerald-50/10" : ""}`}>
                <div className="min-w-0 space-y-2">
                  <p className="text-xs font-bold text-stone-500 tracking-wider uppercase">{item.label}</p>
                  <h2 className="text-base font-bold leading-snug text-stone-900">{item.title}</h2>
                  <p className="text-xs leading-normal text-stone-600">{item.meta}</p>
                </div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100">
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

        <section className="grid gap-3 lg:grid-cols-[0.95fr_1.05fr]">
          <Card className="border-stone-200 bg-white/78 py-0 shadow-[0_6px_20px_rgba(84,61,31,0.04)]">
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Target className="h-4 w-4 text-emerald-700" />
                年度快照
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
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

        <section className="space-y-2">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm text-stone-500">项目工作台</p>
              <h2 className="mt-1 text-xl font-semibold">三条业务线</h2>
            </div>
            <BriefcaseBusiness className="h-5 w-5 text-stone-500" />
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {apps.map((app) => (
              <Link key={app.title} href={app.href} className="block">
                <div className="h-full rounded-2xl glass-panel glass-panel-hover p-4">
                  <div className="flex items-center justify-between gap-3">
                     <h3 className="text-base font-semibold text-stone-950">{app.title}</h3>
                     <span className="rounded-full bg-emerald-50 border border-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">{app.badge}</span>
                  </div>
                  <p className="mt-2 text-sm leading-5 text-stone-700">{app.description}</p>
                  <p className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-emerald-700">
                    {app.next}
                    <ArrowRight className="h-4 w-4" />
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

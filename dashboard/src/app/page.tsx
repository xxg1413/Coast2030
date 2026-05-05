import Link from "next/link";
import { ArrowRight, ExternalLink, Target, WalletCards } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/dashboard/page-header";
import { AssetProgressCard } from "@/components/dashboard/asset-progress-card";
import { getAssetSnapshots, getBeijingCurrentDate, getYearIncome, formatMoney } from "@/lib/api";
import { NET_WORTH_TARGET_2030, YEAR_TARGETS } from "@/lib/targets";

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
  const [incomes, assetSnapshots] = await Promise.all([
    Promise.all(years.map((year) => getYearIncome(year))),
    getAssetSnapshots(6),
  ]);
  const activeYearIncome = incomes[0] || 0;
  const activeYearTarget = YEAR_TARGETS[2026] || 0;
  const activeYearProgress = activeYearTarget > 0 ? Math.min((activeYearIncome / activeYearTarget) * 100, 100) : 0;
  const currentNetWorth = assetSnapshots[0]?.netWorth || 0;
  const assetProgress = NET_WORTH_TARGET_2030 > 0 ? Math.min((currentNetWorth / NET_WORTH_TARGET_2030) * 100, 100) : 0;

  const actionCards = [
    {
      label: "年度执行",
      title: "进入 2026 今日工作台",
      meta: `年累计 ${formatMoney(activeYearIncome)} / ${formatMoney(activeYearTarget)}，进度 ${activeYearProgress.toFixed(1)}%。`,
      href: "/2026",
      external: false,
      icon: Target,
    },
    {
      label: "资产节奏",
      title: "更新净资产快照",
      meta: `当前净资产 ${formatMoney(currentNetWorth)}，2030 目标完成 ${assetProgress.toFixed(2)}%。`,
      href: "#asset-progress",
      external: false,
      icon: WalletCards,
    },
    {
      label: "项目入口",
      title: "打开 Product Lab",
      meta: "产品收入、功能路线图、推广和指标快照集中在这里推进。",
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
      next: "看今日任务、本月回款缺口和未到账记录。",
    },
    {
      title: "AI Notes",
      badge: "内容增长",
      href: AI_NOTES_URL,
      description: "统一管理 AI 资讯、YouTube 提纲和内容资产。",
      next: "看本周内容任务、粉丝缺口和内容收入。",
    },
  ];

  return (
    <main className="min-h-screen text-stone-900 p-4 md:p-8">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <PageHeader
          title="P小二的5年退休计划"
          subtitle="Coast2030"
        />

        <section className="grid gap-3 md:grid-cols-3">
          {actionCards.map((item, index) => {
            const Icon = item.icon;
            const content = (
              <Card className={`h-full border-stone-200 bg-white/82 shadow-[0_8px_30px_rgba(84,61,31,0.06)] transition-all hover:-translate-y-0.5 hover:border-stone-300 ${index === 0 ? "ring-1 ring-emerald-200" : ""}`}>
                <CardContent className="flex h-full flex-col justify-between gap-4 p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-medium uppercase tracking-[0.16em] text-stone-500">{item.label}</p>
                      <Icon className="h-4 w-4 text-emerald-700" />
                    </div>
                    <h2 className="text-lg font-semibold leading-tight text-stone-950">{item.title}</h2>
                    <p className="text-sm leading-6 text-stone-600">{item.meta}</p>
                  </div>
                  <div className="inline-flex items-center gap-1 text-sm font-medium text-emerald-700">
                    进入
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
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

        <div id="asset-progress">
        <AssetProgressCard
          snapshots={assetSnapshots}
          target={NET_WORTH_TARGET_2030}
          defaultDate={getBeijingCurrentDate()}
        />
        </div>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {years.map((year, index) => {
            const income = incomes[index];
            const target = YEAR_TARGETS[year];
            const progress = target > 0 ? Math.min((income / target) * 100, 100) : 0;
            const link = YEAR_LINKS[year];

            const card = (
              <Card className="h-full border-stone-200 bg-white/78 shadow-[0_8px_30px_rgba(84,61,31,0.06)] transition-all hover:-translate-y-0.5 hover:border-stone-300">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between text-lg">
                    <span>{year}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      link ? "bg-emerald-50 text-emerald-700" : "bg-stone-100 text-stone-500"
                    }`}>
                      {link ? "已开启" : "待开启"}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-stone-500">年累计</span>
                    <span className="font-medium text-stone-900">{formatMoney(income)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">年度目标</span>
                    <span className="text-stone-700">{formatMoney(target)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-stone-500">完成度</span>
                    <span className="text-sm font-medium">{progress.toFixed(1)}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-stone-200 overflow-hidden">
                    <div
                      className="h-1.5 rounded-full bg-emerald-500 transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
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

        <section className="space-y-3">
          <div>
            <p className="text-sm text-stone-500">应用入口</p>
            <h2 className="mt-1 text-2xl font-semibold">内容与项目工作台</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {apps.map((app) => (
              <a key={app.title} href={app.href} target="_blank" rel="noopener noreferrer" className="block">
                <Card className="h-full border-stone-200 bg-white/78 shadow-[0_8px_30px_rgba(84,61,31,0.06)] transition-all hover:-translate-y-0.5 hover:border-stone-300">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center justify-between gap-3 text-lg">
                      <span>{app.title}</span>
                      <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-600">{app.badge}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <p className="text-stone-800">{app.description}</p>
                    <p className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-stone-600">{app.next}</p>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

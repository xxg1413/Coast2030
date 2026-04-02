import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  return (
    <main className="min-h-screen text-stone-900 p-4 md:p-8">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <section className="rounded-[2rem] border border-stone-200 bg-white/80 p-6 shadow-[0_24px_80px_rgba(72,50,22,0.10)] backdrop-blur">
          <div className="flex items-center gap-4">
            <Image
              src="/coast-logo.svg"
              alt="Coast2030 Logo"
              width={52}
              height={52}
              className="h-12 w-12 rounded-xl border border-stone-200 bg-white"
            />
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-stone-500">Coast2030</p>
              <h1 className="mt-1 text-3xl md:text-4xl font-semibold bg-gradient-to-r from-stone-950 via-stone-800 to-emerald-700 bg-clip-text text-transparent">
                P小二的5年退休计划
              </h1>
            </div>
          </div>
        </section>

        <AssetProgressCard
          snapshots={assetSnapshots}
          target={NET_WORTH_TARGET_2030}
          defaultDate={getBeijingCurrentDate()}
        />

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {years.map((year, index) => {
            const income = incomes[index];
            const target = YEAR_TARGETS[year];
            const progress = target > 0 ? Math.min((income / target) * 100, 100) : 0;
            const link = YEAR_LINKS[year];

            const card = (
              <Card className="h-full border-stone-200 bg-white/78 shadow-[0_12px_40px_rgba(84,61,31,0.08)] transition-all hover:-translate-y-0.5 hover:border-stone-300">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between text-lg">
                    <span>{year}</span>
                    <span className="text-xs text-stone-500">{link ? "已开启" : "待开启"}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p className="text-stone-800">年累计：{formatMoney(income)}</p>
                  <p className="text-stone-600">年度目标：{formatMoney(target)}</p>
                  <p className="text-stone-500">完成度：{progress.toFixed(1)}%</p>
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
            <a href={PRODUCT_LAB_URL} className="block">
              <Card className="h-full border-stone-200 bg-white/78 shadow-[0_12px_40px_rgba(84,61,31,0.08)] transition-all hover:-translate-y-0.5 hover:border-stone-300">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between text-lg">
                    <span>Product Lab</span>
                    <span className="text-xs text-cyan-700">Cloudflare</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p className="text-stone-800">SaaS 目标、功能路线图、推广计划、指标快照与收入管理。</p>
                  <p className="text-stone-500">独立部署，作为产品实验与营收验证中台。</p>
                </CardContent>
              </Card>
            </a>

            <a href={AIBOUNTY_URL} className="block">
              <Card className="h-full border-stone-200 bg-white/78 shadow-[0_12px_40px_rgba(84,61,31,0.08)] transition-all hover:-translate-y-0.5 hover:border-stone-300">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between text-lg">
                    <span>AIBounty Plan</span>
                    <span className="text-xs text-emerald-700">Cloudflare</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p className="text-stone-800">漏洞挖掘计划、目标池、赏金记录与回款看板。</p>
                  <p className="text-stone-500">独立部署，作为 Hunter 路线执行系统。</p>
                </CardContent>
              </Card>
            </a>

            <a href={AI_NOTES_URL} className="block">
              <Card className="h-full border-stone-200 bg-white/78 shadow-[0_12px_40px_rgba(84,61,31,0.08)] transition-all hover:-translate-y-0.5 hover:border-stone-300">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between text-lg">
                    <span>AI Notes</span>
                    <span className="text-xs text-amber-700">Cloudflare</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p className="text-stone-800">统一管理 AI 资讯、YouTube 提纲和内容资产。</p>
                  <p className="text-stone-500">独立部署，作为内容中台与笔记后台。</p>
                </CardContent>
              </Card>
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}

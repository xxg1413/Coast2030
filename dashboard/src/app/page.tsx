import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import { AssetProgressCard } from "@/components/dashboard/asset-progress-card";
import { SaaSGrowthPortfolio } from "@/components/dashboard/saas-growth-portfolio";
import {
  formatMoney,
  getAssetSnapshots,
  getBeijingCurrentDate,
  getYearIncome,
} from "@/lib/api";
import {
  BUSINESS_LINE_TARGETS_2026,
  getAnnualRecoveryPace,
  NET_WORTH_MILESTONES,
  NET_WORTH_TARGET_2030,
  YEAR_TARGETS,
} from "@/lib/targets";

export const dynamic = "force-dynamic";

export default async function Home() {
  const currentDate = getBeijingCurrentDate();
  const years = [2026, 2027, 2028, 2029, 2030];
  const [incomes, saasIncome, assetSnapshots] =
    await Promise.all([
      Promise.all(years.map((year) => getYearIncome(year))),
      getYearIncome(2026, "SaaS"),
      getAssetSnapshots(6),
    ]);

  const yearIncome = incomes[0] ?? 0;
  const latestAssetSnapshot = assetSnapshots[0];
  const yearTarget = YEAR_TARGETS[2026] ?? 0;
  const annualProgress = yearTarget > 0 ? Math.min((yearIncome / yearTarget) * 100, 100) : 0;
  const recovery = getAnnualRecoveryPace(2026, yearIncome, currentDate);
  const fiveYearIncomeTarget = years.reduce((sum, year) => sum + (YEAR_TARGETS[year] ?? 0), 0);
  const fiveYearIncome = incomes.reduce((sum, income) => sum + income, 0);
  const fiveYearIncomeProgress =
    fiveYearIncomeTarget > 0 ? Math.min((fiveYearIncome / fiveYearIncomeTarget) * 100, 100) : 0;
  const horizonRows = years.map((year, index) => {
    const income = incomes[index] ?? 0;
    const incomeTarget = YEAR_TARGETS[year] ?? 0;
    return {
      year,
      income,
      incomeTarget,
      incomeProgress: incomeTarget > 0 ? Math.min((income / incomeTarget) * 100, 100) : 0,
      netWorthTarget: NET_WORTH_MILESTONES[year] ?? 0,
      isCurrent: year === 2026,
    };
  });

  const directionRows = [
    {
      key: "saas",
      role: "唯一收入主线 · 5H/天",
      title: "四个海外 SaaS",
      measure: `${formatMoney(saasIncome)} / ${formatMoney(BUSINESS_LINE_TARGETS_2026.SaaS)}`,
      next: "OpenBot、OneBot、KOL.tools、DeepFeather 全部持续获客，按月切换成交主攻。",
      href: "/productlab",
      linkLabel: "Product Lab",
      meta: "¥100 万",
    },
    {
      key: "media",
      role: "获客引擎 · 2H/天",
      title: "自媒体",
      measure: "不设独立收入目标",
      next: "所有内容必须导向四个 SaaS 的可归因访问、有效对话、报价或成交。",
      href: "/ainotes",
      linkLabel: "AI Notes",
      meta: "只为 SaaS 引流",
    },
    {
      key: "buffer",
      role: "机动补位 · 1H/天",
      title: "成交阻塞清理",
      measure: "Hunter 0H",
      next: "只补最接近付款的销售、交付或产品阻塞，不开启第五个项目。",
      href: "/2026",
      linkLabel: "执行工作台",
      meta: "不扩线",
    },
  ];

  return (
    <main className="coast-home coast-overview">
      <div className="coast-shell coast-overview-board">
        <header className="coast-overview-board__header" aria-labelledby="home-heading">
          <div className="coast-overview-board__brand">
            <p className="coast-topline">
              <CalendarDays aria-hidden="true" />
              Coast2030 · 五年总盘
            </p>
            <h1 id="home-heading">2030 总览</h1>
            <p>长期资产、年度进度与四个海外 SaaS；执行细节在 2026 工作台。</p>
          </div>
          <Link className="coast-button coast-button--primary" href="/2026">
            进入 2026 工作台
            <ArrowRight aria-hidden="true" />
          </Link>
        </header>

        <section id="asset-progress" className="coast-assets coast-overview-board__assets" aria-labelledby="assets-heading">
          <div className="coast-section-heading coast-section-heading--compact">
            <div>
              <h2 id="assets-heading">资产总盘</h2>
              <p>独立快照跟踪净资产；不用收入流水替代。</p>
            </div>
          </div>
          <AssetProgressCard
            compact
            snapshots={assetSnapshots}
            target={NET_WORTH_TARGET_2030}
            defaultDate={currentDate}
            milestones={NET_WORTH_MILESTONES}
          />
          <p className="coast-assets__summary">
            数据截至：收入 {currentDate} · 资产快照 {latestAssetSnapshot?.snapshotDate || "未记录"}。
          </p>
        </section>

        <section className="coast-overview-year coast-overview-board__year" aria-labelledby="year-heading">
          <div className="coast-section-heading coast-section-heading--compact">
            <div>
              <h2 id="year-heading">2026 年度进度</h2>
              <p>只统计已结算、已到账现金。</p>
            </div>
          </div>
          <div className="coast-overview-year__grid">
            <div className="coast-overview-year__primary">
              <span>2026 已到账</span>
              <strong>{formatMoney(yearIncome)}</strong>
              <div
                className="coast-progress"
                role="progressbar"
                aria-label="2026 年收入完成率"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Number(annualProgress.toFixed(2))}
              >
                <span style={{ width: `${annualProgress}%` }} />
              </div>
              <p>
                目标 {formatMoney(yearTarget)} · 剩余 {formatMoney(recovery.remaining)} ·
                每周需到账 {formatMoney(recovery.weeklyRequired)}
              </p>
            </div>
            <dl className="coast-overview-year__facts">
              <div>
                <dt>完成率</dt>
                <dd>{annualProgress.toFixed(1)}%</dd>
              </div>
              <div>
                <dt>剩余天数</dt>
                <dd>{recovery.daysRemaining}</dd>
              </div>
              <div>
                <dt>旧排期缺口</dt>
                <dd>{formatMoney(recovery.scheduleGap)}</dd>
              </div>
            </dl>
          </div>
        </section>

        <SaaSGrowthPortfolio currentMonth={currentDate.slice(0, 7)} />

        <section className="coast-overview-directions coast-overview-board__directions" aria-labelledby="directions-heading">
          <div className="coast-section-heading coast-section-heading--compact">
            <div>
              <h2 id="directions-heading">每日经营分配</h2>
              <p>SaaS 5H + 内容获客 2H + 机动 1H；Hunter 0H。</p>
            </div>
          </div>
          <div className="coast-direction-grid">
            {directionRows.map((row) => (
              <article key={row.key} className="coast-direction-row">
                <div className="coast-direction-row__head">
                  <div>
                    <p className="coast-lane__role">{row.role}</p>
                    <h3>{row.title}</h3>
                  </div>
                  <span className="coast-status">{row.meta}</span>
                </div>
                <p className="coast-direction-row__measure">{row.measure}</p>
                <p className="coast-direction-row__next">{row.next}</p>
                <Link className="coast-text-link" href={row.href}>
                  打开 {row.linkLabel}
                  <ArrowRight aria-hidden="true" />
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="coast-horizon coast-overview-board__horizon" aria-labelledby="horizon-heading">
          <div className="coast-section-heading coast-section-heading--compact">
            <div>
              <h2 id="horizon-heading">2026–2030 五年路线</h2>
              <p>
                累计 {formatMoney(fiveYearIncome)} / {formatMoney(fiveYearIncomeTarget)} ·{" "}
                {fiveYearIncomeProgress.toFixed(1)}%
              </p>
            </div>
          </div>
          <ol className="coast-horizon__rows coast-horizon__rows--compact">
            {horizonRows.map((row) => {
              const content = (
                <>
                  <div className="coast-horizon__year">
                    <strong>{row.year}</strong>
                    <small>{row.isCurrent ? "当前" : "待开"}</small>
                  </div>
                  <div className="coast-horizon__income">
                    <span>
                      {formatMoney(row.income)} / {formatMoney(row.incomeTarget)}
                    </span>
                    <div
                      className="coast-progress"
                      role="progressbar"
                      aria-label={`${row.year} 年收入完成率`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={Number(row.incomeProgress.toFixed(2))}
                    >
                      <span style={{ width: `${row.incomeProgress}%` }} />
                    </div>
                  </div>
                  <div className="coast-horizon__asset">
                    <span>净资产</span>
                    <strong>{formatMoney(row.netWorthTarget)}</strong>
                  </div>
                </>
              );

              return (
                <li key={row.year}>
                  {row.isCurrent ? (
                    <Link href="/2026" aria-label="进入 2026 工作台">
                      {content}
                    </Link>
                  ) : (
                    <div>{content}</div>
                  )}
                </li>
              );
            })}
          </ol>
        </section>

        <footer className="coast-footer coast-overview-board__footer">
          <span>Coast2030 · 首页是五年总盘，2026 是当前执行工作台。</span>
          <Link href="/2026">进入 2026 工作台</Link>
        </footer>
      </div>
    </main>
  );
}

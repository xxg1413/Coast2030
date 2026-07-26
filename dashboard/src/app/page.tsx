import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  FileText,
  ShieldCheck,
  Video,
  WalletCards,
} from "lucide-react";
import { AssetProgressCard } from "@/components/dashboard/asset-progress-card";
import {
  formatMoney,
  getAssetSnapshots,
  getBeijingCurrentDate,
  getHunterTargets,
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
  const [incomes, hunterIncome, saasIncome, mediaIncome, hunterTargets, assetSnapshots] =
    await Promise.all([
      Promise.all(years.map((year) => getYearIncome(year))),
      getYearIncome(2026, "Hunter"),
      getYearIncome(2026, "SaaS"),
      getYearIncome(2026, "Media"),
      getHunterTargets(),
      getAssetSnapshots(6),
    ]);

  const yearIncome = incomes[0] ?? 0;
  const latestAssetSnapshot = assetSnapshots[0];
  const currentNetWorth = latestAssetSnapshot?.netWorth ?? 0;
  const netWorthProgress =
    NET_WORTH_TARGET_2030 > 0
      ? Math.min(Math.max((currentNetWorth / NET_WORTH_TARGET_2030) * 100, 0), 100)
      : 0;
  const netWorthGap = Math.max(NET_WORTH_TARGET_2030 - currentNetWorth, 0);
  const yearTarget = YEAR_TARGETS[2026] ?? 0;
  const annualProgress = yearTarget > 0 ? Math.min((yearIncome / yearTarget) * 100, 100) : 0;
  const recovery = getAnnualRecoveryPace(2026, yearIncome, currentDate);
  const fiveYearIncomeTarget = years.reduce((sum, year) => sum + (YEAR_TARGETS[year] ?? 0), 0);
  const fiveYearIncome = incomes.reduce((sum, income) => sum + income, 0);
  const fiveYearIncomeProgress =
    fiveYearIncomeTarget > 0 ? Math.min((fiveYearIncome / fiveYearIncomeTarget) * 100, 100) : 0;
  const activeHunterTargets = hunterTargets.filter((target) => target.status === "active");
  const primaryHunterTarget =
    activeHunterTargets.find((target) => target.priority === "P0") ??
    hunterTargets.find((target) => target.priority === "P0") ??
    hunterTargets[0];
  const milestones = Object.entries(NET_WORTH_MILESTONES).map(([year, target]) => ({
    year: Number(year),
    target,
    reached: currentNetWorth >= target,
  }));
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

  return (
    <main className="coast-home coast-overview">
      <div className="coast-shell">
        <section className="coast-intro coast-reveal" aria-labelledby="home-heading">
          <div className="coast-intro__copy">
            <p className="coast-topline">
              <CalendarDays aria-hidden="true" />
              Coast2030 · 五年总盘
            </p>
            <h1 id="home-heading">2030 总览</h1>
            <p>
              首页只看长期目标、年度进度和三条业务线。晨间行动、任务和收入明细统一进入
              2026 工作台。
            </p>
          </div>

          <div className="coast-cash-brief" aria-label="2030 净资产进度">
            <span>当前净资产</span>
            <strong>{latestAssetSnapshot ? formatMoney(currentNetWorth) : "未记录"}</strong>
            <div
              className="coast-progress"
              role="progressbar"
              aria-label="2030 净资产完成率"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Number(netWorthProgress.toFixed(2))}
            >
              <span style={{ width: `${netWorthProgress}%` }} />
            </div>
            <p>
              {latestAssetSnapshot
                ? `距离 2030 年 ¥500 万净资产目标还差 ${formatMoney(netWorthGap)}。`
                : "还没有资产快照，当前不能判断长期目标进度。"}
            </p>
            <a className="coast-text-link" href="#asset-progress">
              查看资产总盘
              <ArrowRight aria-hidden="true" />
            </a>
          </div>
        </section>

        <section className="coast-overview-year coast-reveal" aria-labelledby="year-heading">
          <div className="coast-section-heading">
            <div>
              <p className="coast-lane__role">当前年度</p>
              <h2 id="year-heading">2026 年度进度</h2>
              <p>年度目标只统计已结算、已到账现金；任务与执行细节放在年度工作台。</p>
            </div>
            <BarChart3 aria-hidden="true" />
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
            <Link className="coast-button coast-button--primary" href="/2026">
              进入 2026 工作台
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </section>

        <section className="coast-horizon" aria-labelledby="horizon-heading">
          <div className="coast-section-heading">
            <div>
              <p className="coast-lane__role">参考上上次首页的五年路线</p>
              <h2 id="horizon-heading">2026–2030 五年路线</h2>
              <p>同一行对照年度收入目标与年底净资产里程碑；未来年份不填预测收入。</p>
            </div>
            <BarChart3 aria-hidden="true" />
          </div>

          <div className="coast-horizon__summary">
            <div>
              <span>五年累计已到账</span>
              <strong>{formatMoney(fiveYearIncome)}</strong>
            </div>
            <div>
              <span>五年收入目标</span>
              <strong>{formatMoney(fiveYearIncomeTarget)}</strong>
            </div>
            <div>
              <span>累计完成度</span>
              <strong>{fiveYearIncomeProgress.toFixed(2)}%</strong>
            </div>
          </div>

          <ol className="coast-horizon__rows">
            {horizonRows.map((row) => {
              const content = (
                <>
                  <div className="coast-horizon__year">
                    <strong>{row.year}</strong>
                    <small>{row.isCurrent ? "当前工作台" : "待开启"}</small>
                  </div>
                  <div className="coast-horizon__income">
                    <span>
                      已到账 {formatMoney(row.income)} / 目标 {formatMoney(row.incomeTarget)}
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
                    <span>年底净资产里程碑</span>
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

        <section className="coast-section coast-overview-directions" aria-labelledby="directions-heading">
          <div className="coast-section-heading">
            <div>
              <h2 id="directions-heading">三个方向</h2>
              <p>汇总只看年度已到账、年度目标和当前下一步。</p>
            </div>
            <ShieldCheck aria-hidden="true" />
          </div>

          <article className="coast-lane coast-lane--primary">
            <div className="coast-lane__header">
              <div>
                <p className="coast-lane__role">现金主攻</p>
                <h3>Hunter</h3>
              </div>
              <span className="coast-status coast-status--strong">
                {activeHunterTargets.length} 个主攻
              </span>
            </div>
            <p className="coast-lane__next">
              {primaryHunterTarget?.nextStep ||
                (primaryHunterTarget
                  ? `为 ${primaryHunterTarget.name} 补一条可验证的下一步。`
                  : "目标池为空，先建立一个有明确攻击假设的 P0。")}
            </p>
            <dl className="coast-lane__facts">
              <div>
                <dt>年度已到账</dt>
                <dd>{formatMoney(hunterIncome)}</dd>
              </div>
              <div>
                <dt>年度目标</dt>
                <dd>{formatMoney(BUSINESS_LINE_TARGETS_2026.Hunter)}</dd>
              </div>
              <div>
                <dt>目标池</dt>
                <dd>{hunterTargets.length}</dd>
              </div>
            </dl>
            <Link className="coast-button coast-button--primary" href="/aibounty">
              打开 AIBounty
              <ArrowRight aria-hidden="true" />
            </Link>
          </article>

          <div className="coast-support-lanes">
            <article className="coast-lane coast-lane--compact">
              <Video aria-hidden="true" />
              <div>
                <p className="coast-lane__role">产品验证</p>
                <h3>KOL Clips</h3>
                <p>先验证固定样例、生产 E2E 与外部用户真实运行。</p>
                <p className="coast-lane__measure">
                  年度已到账 {formatMoney(saasIncome)} / {formatMoney(BUSINESS_LINE_TARGETS_2026.SaaS)}
                </p>
              </div>
              <Link className="coast-text-link" href="/productlab">
                打开 Product Lab
                <ArrowRight aria-hidden="true" />
              </Link>
            </article>

            <article className="coast-lane coast-lane--compact">
              <FileText aria-hidden="true" />
              <div>
                <p className="coast-lane__role">内容支持</p>
                <h3>AI Notes</h3>
                <p>只放大已经发生的 Hunter 证据、产品案例和真实失败复盘。</p>
                <p className="coast-lane__measure">
                  年度已到账 {formatMoney(mediaIncome)} / {formatMoney(BUSINESS_LINE_TARGETS_2026.Media)}
                </p>
              </div>
              <Link className="coast-text-link" href="/ainotes">
                打开 AI Notes
                <ArrowRight aria-hidden="true" />
              </Link>
            </article>
          </div>
        </section>

        <section className="coast-milestones" aria-labelledby="milestones-heading">
          <div className="coast-section-heading">
            <div>
              <h2 id="milestones-heading">净资产里程碑</h2>
              <p>每年底用资产快照判断是否跨过里程碑；这里不把收入替代成净资产。</p>
            </div>
            <WalletCards aria-hidden="true" />
          </div>
          <ol>
            {milestones.map((milestone) => (
              <li key={milestone.year} data-reached={milestone.reached ? "true" : undefined}>
                <span>{milestone.year}</span>
                <strong>{formatMoney(milestone.target)}</strong>
                <small>{milestone.reached ? "已达到" : "未达到"}</small>
              </li>
            ))}
          </ol>
        </section>

        <section id="asset-progress" className="coast-assets" aria-labelledby="assets-heading">
          <div className="coast-section-heading">
            <div>
              <h2 id="assets-heading">资产总盘</h2>
              <p>资产与负债使用独立快照，不用收入流水替代净资产。</p>
            </div>
            <WalletCards aria-hidden="true" />
          </div>
          <AssetProgressCard
            snapshots={assetSnapshots}
            target={NET_WORTH_TARGET_2030}
            defaultDate={currentDate}
            milestones={NET_WORTH_MILESTONES}
          />
          <p className="coast-assets__summary">
            数据截至：收入 {currentDate} · 资产快照 {latestAssetSnapshot?.snapshotDate || "未记录"}。
          </p>
        </section>

        <footer className="coast-footer">
          <span>Coast2030 · 首页是五年总盘，2026 是当前执行工作台。</span>
          <Link href="/2026">进入 2026 工作台</Link>
        </footer>
      </div>
    </main>
  );
}

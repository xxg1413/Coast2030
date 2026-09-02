import { SAAS_GROWTH_PORTFOLIO_2026 } from "@/lib/targets";

function formatTarget(value: number) {
  return `¥${value.toLocaleString("zh-CN")}`;
}

export function SaaSGrowthPortfolio({ currentMonth }: { currentMonth: string }) {
  const monthLabel = `${Number(currentMonth.split("-")[1])}月`;

  return (
    <section className="coast-growth-portfolio" aria-labelledby="growth-portfolio-heading">
      <div className="coast-section-heading coast-section-heading--compact">
        <div>
          <h2 id="growth-portfolio-heading">四个海外 SaaS 增长作战盘</h2>
          <p>每个产品持续获客；每月只切换成交主攻。月底没有真实付款，下一月冻结开发、先复盘销售。</p>
        </div>
      </div>
      <div className="coast-growth-grid">
        {SAAS_GROWTH_PORTFOLIO_2026.map((product) => {
          const isCurrent = product.focusMonth === monthLabel;
          return (
            <article key={product.key} className="coast-direction-row" data-current={isCurrent ? "true" : undefined}>
              <div className="coast-direction-row__head">
                <div>
                  <p className="coast-lane__role">{product.focusMonth}成交主攻</p>
                  <h3>{product.name}</h3>
                </div>
                <span className="coast-status">{isCurrent ? "当前主攻" : "持续获客"}</span>
              </div>
              <p className="coast-direction-row__measure">回款责任 {formatTarget(product.revenueTarget)}</p>
              <p className="coast-growth-card__offer">卖：{product.offer}</p>
              <p className="coast-direction-row__next">客户：{product.customer}</p>
              <div className="coast-growth-card__gate">
                <strong>{product.acquisition}</strong>
                <span>{product.paidGate}</span>
              </div>
              <a className="coast-text-link" href={product.href} target="_blank" rel="noreferrer">
                打开 {product.name}
              </a>
            </article>
          );
        })}
      </div>
      <p className="coast-growth-portfolio__rule">
        组合周底线：100 个精准账户、20 次有效对话、8 份报价；内容只看可归因访问、对话和成交，不以播放量代替获客。
      </p>
    </section>
  );
}

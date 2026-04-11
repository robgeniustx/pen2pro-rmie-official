function DetailList({ section }) {
  return (
    <div className="starter-result__detail-list">
      {Object.entries(section).map(([key, value]) => (
        <div key={key} className="starter-result__detail-item">
          <span className="starter-result__detail-key">{key.replace(/([A-Z])/g, " $1").trim()}</span>
          <span className="starter-result__detail-value">{value}</span>
        </div>
      ))}
    </div>
  );
}

function ListSection({ items }) {
  return (
    <ol className="starter-result__list">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ol>
  );
}

function StarterBlueprintResult({ blueprint, onUpgradePro, onSeeElite }) {
  const sections = [
    ["Business Concept Summary", <DetailList section={blueprint.businessConceptSummary} />],
    ["Ideal Customer", <DetailList section={blueprint.idealCustomer} />],
    ["Core Offer", <DetailList section={blueprint.coreOffer} />],
    ["Revenue Direction", <DetailList section={blueprint.revenueDirection} />],
    ["Brand Positioning", <DetailList section={blueprint.brandPositioning} />],
    ["30-Day Starter Action Plan", <ListSection items={blueprint.starterActionPlan} />],
    ["Fastest Path to First Money", <ListSection items={blueprint.fastestPathToFirstMoney} />],
    ["Common Risks or Mistakes", <ListSection items={blueprint.commonRisksOrMistakes} />],
    ["Upgrade Recommendation", <DetailList section={blueprint.upgradeRecommendation} />],
  ];

  return (
    <div className="starter-result">
      <div className="starter-result__header">
        <p className="starter-result__eyebrow">PEN2PRO STARTER BUSINESS BLUEPRINT</p>
        <h2 className="starter-result__title">Your free starter plan is ready.</h2>
        <p className="starter-result__subtitle">
          Use this blueprint to tighten your offer, move faster, and start validating demand.
        </p>
      </div>

      <div className="starter-result__grid">
        {sections.map(([title, content]) => (
          <section key={title} className="starter-result__card">
            <h3>{title}</h3>
            {content}
          </section>
        ))}
      </div>

      <div className="starter-result__cta-block">
        <p className="starter-result__cta-copy">
          Ready for deeper strategy, automation, and execution tools?
        </p>
        <div className="starter-result__cta-actions">
          <button className="starter-button starter-button--primary" onClick={onUpgradePro}>
            Upgrade to Pro
          </button>
          <button className="starter-button starter-button--secondary" onClick={onSeeElite}>
            See Elite
          </button>
        </div>
      </div>
    </div>
  );
}

export default StarterBlueprintResult;
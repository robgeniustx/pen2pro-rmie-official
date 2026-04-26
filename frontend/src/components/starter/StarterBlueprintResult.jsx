function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeBlueprint(responseOrBlueprint) {
  if (!responseOrBlueprint) {
    return {};
  }

  if (isPlainObject(responseOrBlueprint.blueprint)) {
    return responseOrBlueprint.blueprint;
  }

  if (isPlainObject(responseOrBlueprint.data) && isPlainObject(responseOrBlueprint.data.blueprint)) {
    return responseOrBlueprint.data.blueprint;
  }

  if (isPlainObject(responseOrBlueprint)) {
    return responseOrBlueprint;
  }

  return {};
}

function formatLabel(key) {
  return key.replace(/([A-Z])/g, " $1").trim();
}

function DetailList({ section, emptyMessage }) {
  const entries = isPlainObject(section) ? Object.entries(section) : [];

  if (entries.length === 0) {
    return <p className="starter-result__empty">{emptyMessage}</p>;
  }

  return (
    <div className="starter-result__detail-list">
      {entries.map(([key, value]) => (
        <div key={key} className="starter-result__detail-item">
          <span className="starter-result__detail-key">{formatLabel(key)}</span>
          <span className="starter-result__detail-value">{String(value ?? "Not provided")}</span>
        </div>
      ))}
    </div>
  );
}

function ListSection({ items, emptyMessage }) {
  const safeItems = Array.isArray(items) ? items : [];

  if (safeItems.length === 0) {
    return <p className="starter-result__empty">{emptyMessage}</p>;
  }

  return (
    <ol className="starter-result__list">
      {safeItems.map((item, index) => (
        <li key={`${String(item)}-${index}`}>{String(item ?? "Not provided")}</li>
      ))}
    </ol>
  );
}

function StarterBlueprintResult({ response, blueprint, onUpgradePro, onSeeElite }) {
  const resolvedBlueprint = normalizeBlueprint(response || blueprint);

  const sections = [
    [
      "Business Concept Summary",
      <DetailList
        section={resolvedBlueprint.businessConceptSummary}
        emptyMessage="Business concept summary is not available yet."
      />,
    ],
    [
      "Ideal Customer",
      <DetailList section={resolvedBlueprint.idealCustomer} emptyMessage="Ideal customer details are missing." />,
    ],
    ["Core Offer", <DetailList section={resolvedBlueprint.coreOffer} emptyMessage="Core offer details are missing." />],
    [
      "Revenue Direction",
      <DetailList section={resolvedBlueprint.revenueDirection} emptyMessage="Revenue direction was not returned." />,
    ],
    [
      "Brand Positioning",
      <DetailList section={resolvedBlueprint.brandPositioning} emptyMessage="Brand positioning was not returned." />,
    ],
    [
      "30-Day Starter Action Plan",
      <ListSection
        items={resolvedBlueprint.starterActionPlan}
        emptyMessage="30-day starter action plan is not available yet."
      />,
    ],
    [
      "Fastest Path to First Money",
      <ListSection
        items={resolvedBlueprint.fastestPathToFirstMoney}
        emptyMessage="Fastest path to first money is not available yet."
      />,
    ],
    [
      "Common Risks or Mistakes",
      <ListSection
        items={resolvedBlueprint.commonRisksOrMistakes}
        emptyMessage="Common risks or mistakes were not returned."
      />,
    ],
    [
      "Upgrade Recommendation",
      <DetailList
        section={resolvedBlueprint.upgradeRecommendation}
        emptyMessage="Upgrade recommendation is not available yet."
      />,
    ],
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

function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeBlueprint(response) {
  if (!response) {
    return {};
  }

  if (isPlainObject(response.blueprint)) {
    return response.blueprint;
  }

  if (isPlainObject(response.data) && isPlainObject(response.data.blueprint)) {
    return response.data.blueprint;
  }

  if (isPlainObject(response)) {
    return response;
  }

  return {};
}

function formatLabel(key) {
  return String(key)
    .replace(/[_-]/g, " ")
    .replace(/([A-Z])/g, " $1")
    .replace(/\s+/g, " ")
    .trim();
}

function coerceToEntryMap(value) {
  if (isPlainObject(value)) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.reduce((acc, item, index) => {
      acc[`item_${index + 1}`] = item;
      return acc;
    }, {});
  }

  return {};
}

function hasRenderableValue(value) {
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  if (isPlainObject(value)) {
    return Object.keys(value).length > 0;
  }
  return value !== undefined && value !== null && String(value).trim() !== "";
}

function renderValue(value, parentKey = "value") {
  if (Array.isArray(value)) {
    if (!value.length) return null;
    return (
      <ul className="starter-result__list">
        {value.map((item, index) => (
          <li key={`${parentKey}-${index}`}>{renderValue(item, `${parentKey}-${index}`) || "Not provided"}</li>
        ))}
      </ul>
    );
  }

  if (isPlainObject(value)) {
    const entries = Object.entries(value).filter(([, nestedValue]) => hasRenderableValue(nestedValue));
    if (!entries.length) return null;
    return (
      <div className="starter-result__detail-list">
        {entries.map(([nestedKey, nestedValue]) => (
          <div key={`${parentKey}-${nestedKey}`} className="starter-result__detail-item">
            <span className="starter-result__detail-key">{formatLabel(nestedKey)}</span>
            <span className="starter-result__detail-value">{renderValue(nestedValue, `${parentKey}-${nestedKey}`)}</span>
          </div>
        ))}
      </div>
    );
  }

  return String(value);
}

function DetailList({ section, emptyMessage }) {
  const entries = Object.entries(coerceToEntryMap(section)).filter(([, value]) => hasRenderableValue(value));

  if (entries.length === 0) return <p className="starter-result__empty">{emptyMessage}</p>;

  return (
    <div className="starter-result__detail-list">
      {entries.map(([key, value]) => (
        <div key={key} className="starter-result__detail-item">
          <span className="starter-result__detail-key">{formatLabel(key)}</span>
          <span className="starter-result__detail-value">{renderValue(value, key) || "Not provided"}</span>
        </div>
      ))}
    </div>
  );
}

function StarterBlueprintResult({ response, blueprint, onUpgradePro, onSeeElite }) {
  const source = response || blueprint || {};
  const normalized = normalizeBlueprint(source);
  const blueprintData = isPlainObject(normalized) ? normalized : {};

  const ventureSummary = blueprintData.ventureSummary || {};
  const starterPlan = blueprintData.starterPlan || {};
  const upgradeHooks = blueprintData.upgradeHooks || {};

  const ventureEntries = Object.entries(coerceToEntryMap(ventureSummary));
  const customerPattern = /(customer|audience|target|buyer|persona|client|who)/i;
  const offerPattern = /(offer|service|product|solution|package|deliverable|promise|value)/i;
  const brandPattern = /(brand|position|messag|voice|angle|differen|niche|category|unique)/i;

  const idealCustomer = Object.fromEntries(ventureEntries.filter(([key]) => customerPattern.test(key)));
  const coreOffer = Object.fromEntries(ventureEntries.filter(([key]) => offerPattern.test(key)));
  const brandPositioning = Object.fromEntries(ventureEntries.filter(([key]) => brandPattern.test(key)));

  const revenueDirection = Object.fromEntries(
    Object.entries(coerceToEntryMap(starterPlan)).filter(([key]) =>
      /(pricing|price|revenue|monet|profit|margin|acv|arpu|ltv|pay)/i.test(key),
    ),
  );

  const actionPlan = {
    ...(hasRenderableValue(starterPlan.top3Actions) ? { top3Actions: starterPlan.top3Actions } : {}),
    ...(hasRenderableValue(starterPlan.first7Days) ? { first7Days: starterPlan.first7Days } : {}),
  };

  const fastestPath = {
    ...(hasRenderableValue(starterPlan.strategistInsight) ? { strategistInsight: starterPlan.strategistInsight } : {}),
    ...Object.fromEntries(
      Object.entries(coerceToEntryMap(starterPlan)).filter(([key, value]) => /fastest.?path/i.test(key) && hasRenderableValue(value)),
    ),
  };

  const upgradeRecommendation = {
    ...(hasRenderableValue(upgradeHooks.proReason) ? { proReason: upgradeHooks.proReason } : {}),
    ...(hasRenderableValue(upgradeHooks.eliteReason) ? { eliteReason: upgradeHooks.eliteReason } : {}),
  };

  const sections = [
    [
      "Business Concept Summary",
      <DetailList section={ventureSummary} emptyMessage="Business concept summary is not available yet." />,
    ],
    [
      "Ideal Customer",
      <DetailList section={idealCustomer} emptyMessage="Ideal customer details are missing." />,
    ],
    ["Core Offer", <DetailList section={coreOffer} emptyMessage="Core offer details are missing." />],
    [
      "Revenue Direction",
      <DetailList section={revenueDirection} emptyMessage="Revenue direction was not returned." />,
    ],
    [
      "Brand Positioning",
      <DetailList section={brandPositioning} emptyMessage="Brand positioning was not returned." />,
    ],
    [
      "30-Day Starter Action Plan",
      <DetailList section={actionPlan} emptyMessage="30-day starter action plan is not available yet." />,
    ],
    [
      "Fastest Path to First Money",
      <DetailList section={fastestPath} emptyMessage="Fastest path to first money is not available yet." />,
    ],
    [
      "Upgrade Recommendation",
      <DetailList section={upgradeRecommendation} emptyMessage="Upgrade recommendation is not available yet." />,
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

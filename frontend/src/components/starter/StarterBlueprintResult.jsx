function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeBlueprint(response) {
  if (!response) {
    return {};
  }

  if (isPlainObject(response.blueprint) && hasRenderableValue(response.blueprint)) {
    return response.blueprint;
  }

  if (isPlainObject(response.data) && isPlainObject(response.data.blueprint)) {
    return response.data.blueprint;
  }

  if (isPlainObject(response.data) && hasRenderableValue(response.data)) {
    return response.data;
  }

  if (isPlainObject(response.result) && hasRenderableValue(response.result)) {
    return response.result;
  }

  const topLevelBlueprintKeys = ["ventureSummary", "starterPlan", "proPlan", "elitePlan", "upgradeHooks"];
  if (isPlainObject(response) && topLevelBlueprintKeys.some((key) => hasRenderableValue(response[key]))) {
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

function StarterBlueprintResult({ response, blueprint, intakeValues, onUpgradePro, onSeeElite, onStartAnother }) {
  const source = response || blueprint || {};
  const normalized = normalizeBlueprint(source);
  console.log("Starter normalized blueprint:", normalized);
  const blueprintData = isPlainObject(normalized) ? normalized : {};
  const proposedBusinessName = (intakeValues?.proposedBusinessName || "").trim();
  const selectedBrandName = (intakeValues?.selectedBrandName || "").trim();
  const resolvedBusinessName = proposedBusinessName || selectedBrandName || "Your Company Name";
  const hasExplicitBusinessName = Boolean(proposedBusinessName || selectedBrandName);
  const generatedDate = new Date().toLocaleDateString();
  const businessIdea = (intakeValues?.businessIdea || "").trim();
  const selectedState = (intakeValues?.marketLocation || "").trim();

  const ventureSummary = blueprintData.ventureSummary || {};
  const starterPlan = blueprintData.starterPlan || {};
  const proPlan = blueprintData.proPlan || {};
  const elitePlan = blueprintData.elitePlan || {};
  const upgradeHooks = blueprintData.upgradeHooks || {};
  const strategistRecommendation = blueprintData.ai_strategist_recommendation || {};

  const actionPlan = {
    ...(hasRenderableValue(starterPlan.top3Actions) ? { top3Actions: starterPlan.top3Actions } : {}),
    ...(hasRenderableValue(starterPlan.first7Days) ? { first7Days: starterPlan.first7Days } : {}),
    ...(hasRenderableValue(starterPlan.thirtyDayActionPlan)
      ? { thirtyDayActionPlan: starterPlan.thirtyDayActionPlan }
      : {}),
  };

  const fastestPath = {
    ...(hasRenderableValue(starterPlan.fastestPathToFirstMoney)
      ? { fastestPathToFirstMoney: starterPlan.fastestPathToFirstMoney }
      : {}),
    ...(hasRenderableValue(starterPlan.strategistInsight) ? { strategistInsight: starterPlan.strategistInsight } : {}),
  };

  const upgradeRecommendation = {
    ...(hasRenderableValue(upgradeHooks.proReason) ? { proReason: upgradeHooks.proReason } : {}),
    ...(hasRenderableValue(upgradeHooks.eliteReason) ? { eliteReason: upgradeHooks.eliteReason } : {}),
  };

  const sections = [
    [
      "Business Concept Summary",
      <DetailList
        section={{
          ...(hasRenderableValue(ventureSummary.businessModel)
            ? { businessModel: ventureSummary.businessModel }
            : {}),
          ...(hasRenderableValue(ventureSummary.marketOpportunity)
            ? { marketOpportunity: ventureSummary.marketOpportunity }
            : {}),
        }}
        emptyMessage="Business concept summary is not available yet."
      />,
    ],
    [
      "Ideal Customer",
      <DetailList
        section={{
          ...(hasRenderableValue(ventureSummary.targetCustomer)
            ? { targetCustomer: ventureSummary.targetCustomer }
            : {}),
        }}
        emptyMessage="Ideal customer details are missing."
      />,
    ],
    [
      "Core Offer",
      <DetailList
        section={{
          ...(hasRenderableValue(ventureSummary.coreOffer) ? { coreOffer: ventureSummary.coreOffer } : {}),
        }}
        emptyMessage="Core offer details are missing."
      />,
    ],
    [
      "Revenue Direction",
      <DetailList
        section={{
          ...(hasRenderableValue(starterPlan.pricingDirection)
            ? { pricingDirection: starterPlan.pricingDirection }
            : {}),
        }}
        emptyMessage="Revenue direction was not returned."
      />,
    ],
    [
      "Brand Positioning",
      <DetailList
        section={{
          ...(hasRenderableValue(ventureSummary.brandPositioning)
            ? { brandPositioning: ventureSummary.brandPositioning }
            : {}),
        }}
        emptyMessage="Brand positioning was not returned."
      />,
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
    [
      "Common Risks or Mistakes",
      <DetailList
        section={{
          ...(hasRenderableValue(ventureSummary.commonRisksOrMistakes)
            ? { commonRisksOrMistakes: ventureSummary.commonRisksOrMistakes }
            : {}),
        }}
        emptyMessage="Common risks or mistakes are not available yet."
      />,
    ],
    ["Pro Plan (Days 8–30)", <DetailList section={proPlan} emptyMessage="Pro plan details are unavailable." />],
    ["Elite Plan (Days 31–90)", <DetailList section={elitePlan} emptyMessage="Elite plan details are unavailable." />],
  ];

  const handlePrintBlueprint = () => {
    if (!hasExplicitBusinessName) {
      window.alert("Enter or select a business name so your blueprint prints correctly.");
      return;
    }

    window.print();
  };

  const handleEmailBlueprint = () => {
    if (!hasExplicitBusinessName) {
      window.alert("Enter or select a business name so your blueprint prints correctly.");
      return;
    }

    const subject = `Your PEN2PRO™ Business Blueprint for ${resolvedBusinessName}`;
    const lines = [
      `Here is your business blueprint for ${resolvedBusinessName}, generated by PEN2PRO™.`,
      "",
      `Business idea: ${businessIdea || "Not provided"}`,
      `Date generated: ${generatedDate}`,
    ];

    if (selectedState) {
      lines.push(`Selected state: ${selectedState}`);
    }

    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`;
  };

  return (
    <div className="starter-result">
      <div className="starter-result__header">
        <p className="starter-result__eyebrow">PEN2PRO STARTER BUSINESS BLUEPRINT</p>
        <h2 className="starter-result__title">Business Blueprint for: {resolvedBusinessName}</h2>
        <p className="starter-result__meta">Generated by PEN2PRO™</p>
        <p className="starter-result__meta">Date generated: {generatedDate}</p>
        <p className="starter-result__meta">Business idea: {businessIdea || "Not provided"}</p>
        {selectedState && <p className="starter-result__meta">Selected state: {selectedState}</p>}
        <p className="starter-result__subtitle">
          Use this blueprint to tighten your offer, move faster, and start validating demand.
        </p>
      </div>

      {hasRenderableValue(strategistRecommendation) && (
        <section className="starter-result__strategist-card">
          <p className="starter-result__eyebrow">{strategistRecommendation.label || "AI Strategist Recommendation"}</p>
          <h3>10M Business Strategist Engine</h3>
          <DetailList
            section={{
              ...(hasRenderableValue(strategistRecommendation.next_best_move)
                ? { nextBestMove: strategistRecommendation.next_best_move }
                : {}),
              ...(hasRenderableValue(strategistRecommendation.fastest_path_to_first_1k)
                ? { fastestPathToFirst1k: strategistRecommendation.fastest_path_to_first_1k }
                : {}),
              ...(hasRenderableValue(strategistRecommendation.what_to_avoid)
                ? { whatToAvoid: strategistRecommendation.what_to_avoid }
                : {}),
              ...(hasRenderableValue(strategistRecommendation.execution_plan)
                ? { executionPlan: strategistRecommendation.execution_plan }
                : {}),
              ...(hasRenderableValue(strategistRecommendation.strategist_insight)
                ? { strategistInsight: strategistRecommendation.strategist_insight }
                : {}),
              ...(hasRenderableValue(strategistRecommendation.pro_breakdown)
                ? { proBreakdown: strategistRecommendation.pro_breakdown }
                : {}),
              ...(hasRenderableValue(strategistRecommendation.advanced_insights_and_projections)
                ? { advancedInsightsAndProjections: strategistRecommendation.advanced_insights_and_projections }
                : {}),
            }}
            emptyMessage="Strategist recommendation is not available yet."
          />
        </section>
      )}

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
          <button className="starter-button starter-button--secondary" onClick={handlePrintBlueprint}>
            Print / Save PDF
          </button>
          <button className="starter-button starter-button--secondary" onClick={handleEmailBlueprint}>
            Email Blueprint
          </button>
          <button className="starter-button starter-button--primary" onClick={onUpgradePro}>
            Upgrade to Pro
          </button>
          <button className="starter-button starter-button--secondary" onClick={onSeeElite}>
            See Elite
          </button>
          {typeof onStartAnother === "function" && (
            <button className="starter-button starter-button--secondary" onClick={onStartAnother}>
              Start Another Blueprint
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default StarterBlueprintResult;

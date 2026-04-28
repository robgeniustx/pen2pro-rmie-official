import { useMemo } from "react";

function isObject(value) {
  return value && typeof value === "object" && !Array.isArray(value);
}

function read(response, path, fallback = "") {
  try {
    const value = path.split(".").reduce((acc, key) => (acc == null ? undefined : acc[key]), response);
    if (typeof value === "string" && value.trim()) return value.trim();
    if (Array.isArray(value)) return value;
    if (isObject(value)) return value;
    return fallback;
  } catch {
    return fallback;
  }
}

function normalizeBlueprintData(response, intakeValues) {
  const raw = response?.blueprint || response?.result?.blueprint || response?.result || response?.data?.blueprint || response?.data || response;
  if (typeof raw === "string") {
    return { premium_sections: { executive_snapshot: raw } };
  }

  const businessName = String(intakeValues?.proposedBusinessName || read(raw, "business_snapshot.business_name", "Your Business")).trim();
  const safeName = businessName.toLowerCase() === "pen2pro" ? "Your Business" : businessName;
  const premium = isObject(raw?.premium_sections) ? raw.premium_sections : {};

  return {
    ...raw,
    premium_sections: {
      executive_snapshot: premium.executive_snapshot || `${safeName} is ready for a focused launch with premium strategist execution.`,
      business_name_usage: premium.business_name_usage || `Use ${safeName} on all customer-facing assets for brand consistency.`,
      market_positioning: premium.market_positioning || read(raw, "ventureSummary.brandPositioning", "Lead with a clear outcome promise and speed-to-value."),
      ideal_customer_profile: premium.ideal_customer_profile || read(raw, "business_snapshot.target_customer", intakeValues?.targetCustomer || "Define your highest urgency customer segment."),
      first_offer: premium.first_offer || read(raw, "monetization_roadmap.first_offer", read(raw, "business_snapshot.product_or_service", intakeValues?.productOrService || "Create a fixed-scope starter offer.")),
      revenue_model: premium.revenue_model || read(raw, "monetization_roadmap.revenue_model", "Primary service revenue + expansion offers after proof."),
      pricing_strategy: premium.pricing_strategy || read(raw, "pricing_strategy.direction", "Launch 3 tiers and raise prices after documented wins."),
      launch_plan_30_days: premium.launch_plan_30_days || read(raw, "launch_plan_30_days.week_by_week", read(raw, "starterPlan.thirtyDayActionPlan", [])),
      growth_plan_90_days: premium.growth_plan_90_days || read(raw, "operations_plan_90_days.focus_areas", read(raw, "elitePlan.days31to90", [])),
      brand_identity_direction: premium.brand_identity_direction || `${safeName} should sound practical, premium, and execution-first.`,
      operations_checklist: premium.operations_checklist || read(raw, "startup_requirements", []),
      lead_generation_strategy: premium.lead_generation_strategy || read(raw, "monetization_roadmap.customer_acquisition", "Use outbound + referrals + authority content with one CTA."),
      sales_script: premium.sales_script || `Hi, this is ${safeName}. We help ideal clients solve a measurable problem quickly. Can I ask 3 questions to see if we're a fit?`,
      content_strategy: premium.content_strategy || "Weekly: one proof post, one educational post, one objection-handling post.",
      tools_needed: premium.tools_needed || read(raw, "proPlan.toolsNeeded", read(raw, "tools_and_software", [])),
      risk_warnings: premium.risk_warnings || read(raw, "risk_flags", []),
      next_best_actions: premium.next_best_actions || read(raw, "starterPlan.top3Actions", []),
      upgrade_cta: premium.upgrade_cta || "Unlock Full Strategy",
    },
  if (typeof value === "string" && value.trim()) {
    return value
      .split(/\n|•|;/)
      .map((item) => ({ task: item.trim(), priority: "Medium" }))
      .filter((item) => item.task);
  }

  return [];
}

function getTimelineEntries(launchPlan, operationsPlan) {
  const week1 = compactText(
    isPlainObject(launchPlan) ? launchPlan.week_1 || launchPlan.week1 || launchPlan.first_week : Array.isArray(launchPlan) ? launchPlan[0] : launchPlan,
    "Define your first offer, set up your business profile, and map your MVP actions."
  );
  const weeks2to4 = compactText(
    isPlainObject(launchPlan) ? launchPlan.weeks_2_4 || launchPlan.weeks2_4 || launchPlan.weeks_2_to_4 : Array.isArray(launchPlan) ? launchPlan.slice(1).join(" • ") : "",
    "Validate demand, publish your offer, and run your first customer acquisition sprint."
  );
  const day30 = compactText(
    isPlainObject(operationsPlan) ? operationsPlan.day_30 || operationsPlan.first_30_days || operationsPlan.month_1 : operationsPlan,
    "Review traction metrics, optimize your funnel, and set your next 60-day growth goals."
  );

  return [
    { label: "Week 1", detail: week1 },
    { label: "Weeks 2–4", detail: weeks2to4 },
    { label: "30-Day Plan", detail: day30 },
  ];
}

function getWindowTimelineEntries(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!isPlainObject(item)) return null;
      const label = normalizeText(item.window || item.label, "");
      const detail = compactText(item.action || item.detail, "");
      if (!label || !detail) return null;
      return { label, detail };
    })
    .filter(Boolean);
}

function ResultSectionCard({ title, children, span = "half", animated = false }) {
  return (
    <article className={`starter-result__bento-card starter-result__bento-card--${span} ${animated ? "starter-result__bento-card--animated" : ""}`}>
      <h3>{title}</h3>
      {children}
    </article>
  );
}

function HeroResultCard({ businessName, blueprintData, intakeValues, domain }) {
  return (
    <section className="starter-result__hero-card">
      <p className="starter-result__eyebrow">PEN2PRO BLUEPRINT</p>
      <h2 className="starter-result__hero-title">Your Business Blueprint</h2>
      <p className="starter-result__subtitle">Built for {businessName}</p>
      <div className="starter-result__hero-grid">
        <ResultSectionCard title="Business Idea" animated>
          <p>{normalizeText(intakeValues?.businessIdea, normalizeText(blueprintData?.business_snapshot?.business_summary))}</p>
        </ResultSectionCard>
        <ResultSectionCard title="Target Customer" animated>
          <p>{normalizeText(blueprintData?.business_snapshot?.target_customer, normalizeText(intakeValues?.targetCustomer))}</p>
        </ResultSectionCard>
        <ResultSectionCard title="Offer Idea" animated>
          <p>{normalizeText(blueprintData?.business_snapshot?.basic_offer_idea || blueprintData?.business_snapshot?.product_or_service, normalizeText(intakeValues?.productOrService))}</p>
        </ResultSectionCard>
        <ResultSectionCard title="Domain" animated>
          <p>{normalizeText(domain, "Choose a domain to strengthen your brand positioning.")}</p>
        </ResultSectionCard>
      </div>
    </section>
  );
}

function StartupChecklistCard({ items }) {
  const [checkedItems, setCheckedItems] = useState({});

  const handleToggle = (index) => {
    setCheckedItems((current) => ({ ...current, [index]: !current[index] }));
  };
}

function asList(value) {
  if (Array.isArray(value)) return value.map((item) => (typeof item === "string" ? item : JSON.stringify(item))).filter(Boolean);
  if (typeof value === "string") return value.split(/\n|•/).map((x) => x.trim()).filter(Boolean);
  if (isObject(value)) return Object.entries(value).map(([k, v]) => `${k.replace(/_/g, " ")}: ${v}`);
  return [];
}

function SectionCard({ title, value }) {
  const lines = asList(value);
  return (
    <article className="starter-result__bento-card">
      <h3>{title}</h3>
      {lines.length ? (
        <ul className="starter-result__list">
          {lines.map((line, idx) => (
            <li key={`${title}-${idx}`}>{line}</li>
function MonetizationRoadmapCard({ blueprintData }) {
  const monetization = isPlainObject(blueprintData?.monetization_roadmap) ? blueprintData.monetization_roadmap : null;
  const readRoadmapText = (value) => (typeof value === "string" && value.trim() ? value.trim() : "—");
  const rows = monetization
    ? [
        ["Revenue model", readRoadmapText(monetization.revenue_model)],
        ["First offer", readRoadmapText(monetization.first_offer)],
        ["Pricing idea", readRoadmapText(monetization.pricing_idea)],
        ["Customer acquisition", readRoadmapText(monetization.customer_acquisition)],
      ]
    : [];
  const launchActions = Array.isArray(monetization?.launch_actions) ? monetization.launch_actions.filter((item) => typeof item === "string" && item.trim()) : [];

  return (
    <ResultSectionCard title="Monetization Roadmap" span="wide">
      {!monetization ? (
        <p>Monetization roadmap is temporarily unavailable. Regenerate your blueprint to restore this section.</p>
      ) : (
        <div className="starter-result__roadmap-grid">
          {rows.map(([label, value]) => (
            <div key={label}>
              <h4>{label}</h4>
              <p>{value}</p>
            </div>
          ))}
        </ul>
      ) : (
        <p>{typeof value === "string" ? value : "Not provided"}</p>
      )}
    </article>
  );
}

function UpgradeCta({ onUpgradePro, onSeeElite, ctaLabel }) {
function PositioningAvatarCard({ blueprintData }) {
  return (
    <ResultSectionCard title="Offer Positioning + Customer Avatar" span="wide">
      <div className="starter-result__roadmap-grid">
        <div>
          <h4>Core promise</h4>
          <p>{compactText(blueprintData?.offer_positioning?.core_promise)}</p>
        </div>
        <div>
          <h4>Differentiator</h4>
          <p>{compactText(blueprintData?.offer_positioning?.differentiator)}</p>
        </div>
        <div>
          <h4>Primary segment</h4>
          <p>{compactText(blueprintData?.customer_avatar?.primary_segment)}</p>
        </div>
        <div>
          <h4>Top pains</h4>
          <p>{compactText(blueprintData?.customer_avatar?.top_pains)}</p>
        </div>
      </div>
    </ResultSectionCard>
  );
}

function First30DaysCard({ blueprintData }) {
  return (
    <ResultSectionCard title="First 30-Day Execution Plan" span="wide">
      <div className="starter-result__roadmap-grid">
        <div><h4>Week 1</h4><p>{compactText(blueprintData?.first_30_day_execution_plan?.week_1)}</p></div>
        <div><h4>Week 2</h4><p>{compactText(blueprintData?.first_30_day_execution_plan?.week_2)}</p></div>
        <div><h4>Week 3</h4><p>{compactText(blueprintData?.first_30_day_execution_plan?.week_3)}</p></div>
        <div><h4>Week 4</h4><p>{compactText(blueprintData?.first_30_day_execution_plan?.week_4)}</p></div>
      </div>
    </ResultSectionCard>
  );
}

function UpgradeRecommendationCard({ blueprintData }) {
  const recommendation = blueprintData?.upgrade_recommendation;
  return (
    <ResultSectionCard title="Upgrade Recommendation" span="wide">
      <div className="starter-result__roadmap-grid">
        <div><h4>Recommended tier</h4><p>{compactText(recommendation?.recommended_tier)}</p></div>
        <div><h4>Why now</h4><p>{compactText(recommendation?.why_now)}</p></div>
        <div><h4>What unlocks next</h4><p>{compactText(recommendation?.what_unlocks_next)}</p></div>
      </div>
    </ResultSectionCard>
  );
}

function UpgradeCta({ accessLevel, onUpgradePro, onSeeElite }) {
  const isFree = accessLevel === "free";
  return (
    <section className="starter-upsell starter-upsell--join-now">
      <h3>Upgrade Your PEN2PRO Strategy</h3>
      <div className="starter-upsell__plans">
        <article className="starter-upsell__plan is-locked">
          <h4>Pro Plan</h4>
          <p>Locked on Free Forever until purchase.</p>
          <button className="starter-button starter-button--secondary" onClick={onUpgradePro}>{ctaLabel}</button>
        </article>
        <article className="starter-upsell__plan starter-upsell__plan--elite is-locked">
          <h4>Elite Plan</h4>
          <p>First month only $50</p>
          <button className="starter-button starter-button--primary" onClick={onSeeElite}>{ctaLabel}</button>
        </article>
      </div>
    </section>
  );
}

function StarterBlueprintResult({ response, intakeValues, onUpgradePro, onSeeElite, onStartAnother }) {
  const blueprintData = useMemo(() => normalizeBlueprintData(response, intakeValues), [response, intakeValues]);
  const sections = blueprintData.premium_sections || {};
function StarterBlueprintResult({ response, blueprint, intakeValues, onUpgradePro, onSeeElite, onStartAnother }) {
  const blueprintData = useMemo(() => resolveBlueprintData(response, blueprint), [response, blueprint]);

  const accessLevel = (intakeValues?.accessLevel || intakeValues?.accessTier || "free").toLowerCase();
  const businessName = normalizeText(intakeValues?.proposedBusinessName, normalizeText(blueprintData?.business_snapshot?.business_name, "your business"));
  const domain = normalizeText(intakeValues?.domainToCheck, normalizeText(blueprintData?.business_snapshot?.domain, "Not selected"));

  const startupChecklist = getChecklistEntries(blueprintData.startup_requirements || blueprintData.launch_plan_30_days);
  const timelineItems = getWindowTimelineEntries(blueprintData.next_steps_timeline).length
    ? getWindowTimelineEntries(blueprintData.next_steps_timeline)
    : getTimelineEntries(blueprintData.launch_plan_30_days, blueprintData.operations_plan_90_days);

  return (
    <div className="starter-result starter-reveal is-visible">
      <section className="starter-result__hero-card">
        <p className="starter-result__eyebrow">PEN2PRO 10M BUSINESS STRATEGIST</p>
        <h2 className="starter-result__hero-title">{intakeValues?.proposedBusinessName || "Your Business"} Blueprint</h2>
      </section>

      <section className="starter-result__bento">
        <SectionCard title="Executive Snapshot" value={sections.executive_snapshot} />
        <SectionCard title="Business Name Usage" value={sections.business_name_usage} />
        <SectionCard title="Market Positioning" value={sections.market_positioning} />
        <SectionCard title="Ideal Customer Profile" value={sections.ideal_customer_profile} />
        <SectionCard title="First Offer" value={sections.first_offer} />
        <SectionCard title="Revenue Model" value={sections.revenue_model} />
        <SectionCard title="Pricing Strategy" value={sections.pricing_strategy} />
        <SectionCard title="30-Day Launch Plan" value={sections.launch_plan_30_days} />
        <SectionCard title="90-Day Growth Plan" value={sections.growth_plan_90_days} />
        <SectionCard title="Brand Identity Direction" value={sections.brand_identity_direction} />
        <SectionCard title="Operations Checklist" value={sections.operations_checklist} />
        <SectionCard title="Lead Generation Strategy" value={sections.lead_generation_strategy} />
        <SectionCard title="Sales Script" value={sections.sales_script} />
        <SectionCard title="Content Strategy" value={sections.content_strategy} />
        <SectionCard title="Tools Needed" value={sections.tools_needed} />
        <SectionCard title="Risk Warnings" value={sections.risk_warnings} />
        <SectionCard title="Next Best Actions" value={sections.next_best_actions} />
        <StartupChecklistCard items={startupChecklist.length ? startupChecklist : [{ task: "Validate your business name and domain", priority: "High" }]} />
        <TimelineCard items={timelineItems} />
        <MonetizationRoadmapCard blueprintData={blueprintData} />
        <PositioningAvatarCard blueprintData={blueprintData} />
        <First30DaysCard blueprintData={blueprintData} />
        <UpgradeRecommendationCard blueprintData={blueprintData} />
      </section>

      <UpgradeCta onUpgradePro={onUpgradePro} onSeeElite={onSeeElite} ctaLabel={sections.upgrade_cta || "Unlock Full Strategy"} />

      <section className="starter-result__cta-block">
        <div className="starter-result__cta-actions">
          <button className="starter-button starter-button--secondary" onClick={onStartAnother}>Start Another Blueprint</button>
        </div>
      </section>
    </div>
  );
}

export default StarterBlueprintResult;

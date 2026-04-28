import { useMemo, useState } from "react";

function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function resolveBlueprintData(response, blueprint) {
  const candidates = [blueprint, response?.blueprint, response?.data?.blueprint, response?.data, response?.result?.blueprint, response?.result, response];
  return candidates.find((entry) => isPlainObject(entry)) || {};
}

function normalizeText(value, fallback = "Not provided") {
  if (typeof value === "string" && value.trim()) return value.trim();
  return fallback;
}

function toReadableLabel(value) {
  return String(value || "").replace(/_/g, " ").replace(/\s+/g, " ").trim();
}

function compactText(value, fallback = "Not provided") {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (Array.isArray(value)) {
    const lines = value
      .map((item) => (typeof item === "string" ? item : item?.task || item?.item || item?.step || ""))
      .map((item) => String(item).trim())
      .filter(Boolean);
    return lines.length ? lines.join(" • ") : fallback;
  }
  if (isPlainObject(value)) {
    const lines = Object.entries(value)
      .map(([key, detail]) => {
        if (typeof detail === "string") return `${toReadableLabel(key)}: ${detail}`;
        return "";
      })
      .filter(Boolean);
    return lines.length ? lines.join(" • ") : fallback;
  }
  return fallback;
}

function getChecklistEntries(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") return { task: item, priority: "Medium" };
        if (isPlainObject(item)) {
          const task = normalizeText(item.task || item.item || item.requirement || item.step, "");
          return task ? { task, priority: normalizeText(item.priority, "Medium") } : null;
        }
        return null;
      })
      .filter(Boolean);
  }

  if (isPlainObject(value)) {
    return Object.entries(value).map(([task, priority]) => ({ task: toReadableLabel(task), priority: typeof priority === "string" ? priority : "Medium" }));
  }

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

  return (
    <ResultSectionCard title="Startup Checklist" span="wide">
      <ul className="starter-result__checklist">
        {items.map((item, idx) => {
          const checked = !!checkedItems[idx];
          return (
            <li key={`${item.task}-${idx}`} className={checked ? "is-checked" : ""}>
              <label>
                <input type="checkbox" checked={checked} onChange={() => handleToggle(idx)} aria-label={`Mark ${item.task} as complete`} />
                <span>{item.task}</span>
              </label>
              <span className="starter-priority-badge">{item.priority}</span>
            </li>
          );
        })}
      </ul>
    </ResultSectionCard>
  );
}

function TimelineCard({ items }) {
  return (
    <ResultSectionCard title="Next Steps Timeline" span="wide">
      <ol className="starter-result__timeline-grid">
        {items.map((item, idx) => (
          <li key={`${item.label}-${idx}`} className="starter-result__timeline-card">
            <p>{item.label}</p>
            <span>{item.detail}</span>
          </li>
        ))}
      </ol>
    </ResultSectionCard>
  );
}

function MonetizationRoadmapCard({ blueprintData }) {
  const monetization = isPlainObject(blueprintData?.monetization_roadmap) ? blueprintData.monetization_roadmap : null;
  const rows = monetization
    ? [
        ["Revenue model", monetization.revenue_model],
        ["First offer", monetization.first_offer],
        ["Pricing idea", monetization.pricing_idea],
        ["Customer acquisition", monetization.customer_acquisition],
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
              <p>{compactText(value)}</p>
            </div>
          ))}
          <div>
            <h4>Launch actions</h4>
            <ul>
              {launchActions.map((action, idx) => (
                <li key={`${action}-${idx}`}>{action}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </ResultSectionCard>
  );
}

function UpgradeCta({ accessLevel, onUpgradePro, onSeeElite }) {
  const isFree = accessLevel === "free";
  return (
    <section className="starter-upsell starter-upsell--join-now">
      <h3>Join Now</h3>
      <p>Unlock strategist-level guidance and accelerate execution with PEN2PRO Pro or Elite.</p>
      <div className="starter-upsell__plans">
        <article className={`starter-upsell__plan ${isFree ? "is-locked" : ""}`} onClick={onUpgradePro} role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") onUpgradePro(); }}>
          <h4>Pro</h4>
          <p>Advanced strategy workflows, launch planning, and execution support.</p>
          {isFree && <span className="starter-upsell__lock">Locked for Free Forever</span>}
          <button className="starter-button starter-button--secondary" onClick={onUpgradePro}>Choose Pro</button>
        </article>
        <article className={`starter-upsell__plan starter-upsell__plan--elite ${isFree ? "is-locked" : ""}`} onClick={onSeeElite} role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") onSeeElite(); }}>
          <h4>Elite</h4>
          <p>Elite strategist roadmap, deep optimization, and scale execution plans.</p>
          <p className="starter-upsell__promo">$50 for the first month.</p>
          {isFree && <span className="starter-upsell__lock">Locked for Free Forever</span>}
          <button className="starter-button starter-button--primary" onClick={onSeeElite}>Choose Elite</button>
        </article>
      </div>
    </section>
  );
}

function StarterBlueprintResult({ response, blueprint, intakeValues, onUpgradePro, onSeeElite, onStartAnother }) {
  const blueprintData = useMemo(() => resolveBlueprintData(response, blueprint), [response, blueprint]);

  const accessLevel = (intakeValues?.accessLevel || intakeValues?.accessTier || "free").toLowerCase();
  const businessName = normalizeText(intakeValues?.proposedBusinessName, normalizeText(blueprintData?.business_snapshot?.business_name, "your business"));
  const domain = normalizeText(intakeValues?.domainToCheck, normalizeText(blueprintData?.business_snapshot?.domain, "Not selected"));

  const startupChecklist = getChecklistEntries(blueprintData.startup_requirements || blueprintData.launch_plan_30_days);
  const timelineItems = getTimelineEntries(blueprintData.launch_plan_30_days, blueprintData.operations_plan_90_days);

  return (
    <div className="starter-result starter-reveal">
      <HeroResultCard businessName={businessName} blueprintData={blueprintData} intakeValues={intakeValues} domain={domain} />

      <section className="starter-result__bento">
        <StartupChecklistCard items={startupChecklist.length ? startupChecklist : [{ task: "Validate your business name and domain", priority: "High" }]} />
        <TimelineCard items={timelineItems} />
        <MonetizationRoadmapCard blueprintData={blueprintData} />
      </section>

      <UpgradeCta accessLevel={accessLevel} onUpgradePro={onUpgradePro} onSeeElite={onSeeElite} />

      <section className="starter-result__cta-block">
        <div className="starter-result__cta-actions">
          {typeof onStartAnother === "function" && (
            <button className="starter-button starter-button--secondary" onClick={onStartAnother}>Start Another Blueprint</button>
          )}
        </div>
      </section>
    </div>
  );
}

export default StarterBlueprintResult;

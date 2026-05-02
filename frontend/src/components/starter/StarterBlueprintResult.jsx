import { useMemo } from "react";

function isObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asText(value, fallback = "PEN2PRO strategist guidance is available in this section.") {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number") return String(value);
  if (Array.isArray(value)) {
    const parts = value
      .map((item) => {
        if (typeof item === "string") return item;
        if (isObject(item)) {
          return Object.values(item).filter((entry) => typeof entry === "string" && entry.trim()).join(" • ");
        }
        return "";
      })
      .map((item) => String(item).trim())
      .filter(Boolean);
    return parts.length ? parts.join(" • ") : fallback;
  }
  if (isObject(value)) {
    const parts = Object.entries(value)
      .map(([, item]) => {
        if (typeof item === "string" && item.trim()) return item.trim();
        if (Array.isArray(item)) return asText(item, "");
        if (isObject(item)) return asText(item, "");
        return "";
      })
      .filter(Boolean);
    return parts.length ? parts.join(" • ") : fallback;
  }
  return fallback;
}

function read(obj, path, fallback = "") {
  try {
    const value = path.split(".").reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
    return value == null ? fallback : value;
  } catch {
    return fallback;
  }
}

function normalizeBlueprint(response) {
  if (isObject(response?.blueprint)) return response.blueprint;
  if (isObject(response?.result?.blueprint)) return response.result.blueprint;
  if (isObject(response?.result)) return response.result;
  if (isObject(response?.data?.blueprint)) return response.data.blueprint;
  if (isObject(response?.data)) return response.data;
  return {};
}

const ACCESS_RANK = { free: 0, pro: 1, elite: 2 };

function ResultCard({ title, content, locked = false, onUpgradePro, onSeeElite }) {
  if (locked) {
    const isProLocked = title === "Outreach Strategy" || title === "Content Strategy" || title === "30-Day Launch Plan" || title === "90-Day Operations Plan" || title === "Risk Flags" || title === "Beginner Mistakes to Avoid" || title === "Next 7 Actions" || title === "Weekly Execution Checklist" || title === "Lead Follow-Up Script" || title === "Basic CRM Pipeline" || title === "Customer Acquisition Plan" || title === "Local Partner Strategy" || title === "Review/Testimonial Collection Plan" || title === "Simple KPI Tracker";
    return (
      <article className="starter-result__bento-card starter-upsell__plan is-locked">
        <h3>{title}</h3>
        <p>{isProLocked ? "Upgrade to Pro to unlock this execution section." : "Upgrade to Elite to unlock this advanced strategy section."}</p>
        <span className="starter-upsell__lock">{isProLocked ? "Locked on Free Forever" : "Locked on Pro"}</span>
        <button className="starter-button starter-button--secondary" onClick={isProLocked ? onUpgradePro : onSeeElite}>
          {isProLocked ? "Upgrade to Pro" : "Unlock Elite"}
        </button>
      </article>
    );
  }
  return (
    <article className="starter-result__bento-card">
      <h3>{title}</h3>
      <p>{content}</p>
    </article>
  );
}

function LockedUpgradeCard({ onUpgradePro }) {
  return (
    <article className="starter-result__bento-card starter-upsell__plan is-locked" aria-label="Upgrade required">
      <h3>Unlock the Strategist Level</h3>
      <p>Free Forever gives you the foundation. Pro unlocks the execution strategy: outreach, content, launch planning, CRM, follow-up, and customer acquisition.</p>
      <button className="starter-button starter-button--secondary" type="button" onClick={onUpgradePro}>Upgrade to Pro</button>
    </article>
  );
}

function PartnerToolsCard() {
  const smartCreditAffiliateUrl = String(import.meta.env.VITE_SMARTCREDIT_AFFILIATE_URL || "").trim();

  return (
    <section className="starter-partner-tools" aria-label="PEN2PRO Partner Tools">
      <p className="starter-partner-tools__eyebrow">PEN2PRO Partner Tools</p>
      <article className="starter-result__bento-card starter-partner-tools__card">
        <h3>Credit &amp; Funding Readiness</h3>
        <p>Prepare your personal credit profile before applying for business funding.</p>
        <ul className="starter-result__list">
          <li>Monitor your credit profile</li>
          <li>Review TransUnion, Experian, and Equifax data</li>
          <li>Track score movement</li>
          <li>Identify potential negative items</li>
          <li>Prepare for business banking and funding applications</li>
        </ul>
        {smartCreditAffiliateUrl ? (
          <a
            className="starter-button starter-button--secondary starter-partner-tools__button"
            href={smartCreditAffiliateUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Start SmartCredit Trial
          </a>
        ) : (
          <p className="starter-partner-tools__fallback">Partner link coming soon.</p>
        )}
      </article>
    </section>
  );
}

function UpgradeCta({ onUpgradePro, onSeeElite, upgradeData = {} }) {
  return (
    <section className="starter-upsell starter-upsell--join-now">
      <h3>{upgradeData?.title || "Ready to unlock the full PEN2PRO business buildout?"}</h3>
      <p>{upgradeData?.copy || "Go beyond the starter roadmap and unlock the execution system. Pro gives you the strategy behind the business: outreach, content, customer acquisition, launch planning, CRM structure, follow-up scripts, weekly execution, and growth tracking. Free Forever gives you the foundation. Pro gives you the strategy. Elite gives you the full business buildout."}</p>
      <div className="starter-upsell__plans">
        <article className="starter-upsell__plan is-locked">
          <h4>Pro Plan</h4>
          <p>Conversion playbooks, deeper positioning, and advanced launch systems.</p>
          <span className="starter-upsell__lock">Locked on Free Forever</span>
          <button className="starter-button starter-button--secondary" onClick={onUpgradePro}>View Pricing</button>
        </article>
        <article className="starter-upsell__plan starter-upsell__plan--elite is-locked">
          <h4>Elite Plan</h4>
          <p>Elite growth systems and 10M strategist sequencing.</p>
          <p className="starter-upsell__promo">Elite Offer: First month only $99.</p>
          <span className="starter-upsell__lock">Locked on Free Forever</span>
          <button className="starter-button starter-button--primary" onClick={onSeeElite}>Unlock Elite Strategy</button>
        </article>
      </div>
    </section>
  );
}

function PartnerCard() {
  const partnerUrl = import.meta.env.VITE_SMARTCREDIT_AFFILIATE_URL;
  return (
    <article className="starter-result__bento-card">
      <h3>Credit & Funding Readiness Partner</h3>
      <p>Use this recommended partner resource to strengthen credit profile, funding readiness, and lender confidence before scaling.</p>
      {partnerUrl ? (
        <a className="starter-button starter-button--secondary" href={partnerUrl} target="_blank" rel="noreferrer">Start SmartCredit Trial</a>
      ) : (
        <p>Partner link coming soon.</p>
      )}
    </article>
  );
}

export default function StarterBlueprintResult({ response, intakeValues, tier = "free", onUpgradePro, onSeeElite, onStartAnother }) {
  const blueprint = useMemo(() => normalizeBlueprint(response), [response]);
  const normalizedTier = ["free", "pro", "elite", "founder"].includes(String(tier).toLowerCase()) ? String(tier).toLowerCase() : "free";
  const isFree = normalizedTier === "free";
  const isPro = normalizedTier === "pro";
  const sectionMap = {
    free: [["Executive Business Snapshot", "executive_business_snapshot"], ["Business Type Classification", "business_type_classification"], ["Customer Problem Breakdown", "customer_problem_breakdown"], ["Target Customer Profile", "target_customer_profile"], ["Core Promise", "core_promise"], ["First 7 Days Action Plan", "next_7_actions"]],
    pro: [["Executive Business Snapshot", "executive_business_snapshot"], ["Business Type Classification", "business_type_classification"], ["Customer Problem Breakdown", "customer_problem_breakdown"], ["Target Customer Profile", "target_customer_profile"], ["Market Positioning", "market_positioning"], ["Core Promise", "core_promise"], ["Offer Strategy", "first_paid_offer"], ["Pricing Strategy", "pricing_ladder"], ["Social Media Setup", "social_media_setup"], ["Sales Script", "sales_script"], ["30-Day Launch Plan", "launch_plan_30_days"], ["Upgrade Path", "upgrade_cta"]],
    elite: [["Executive Business Snapshot", "executive_business_snapshot"], ["Founder Readiness Level", "founder_readiness_level"], ["Business Type Classification", "business_type_classification"], ["Customer Problem Breakdown", "customer_problem_breakdown"], ["Target Customer Profile", "target_customer_profile"], ["Market Positioning", "market_positioning"], ["Core Promise", "core_promise"], ["Offer Strategy", "first_paid_offer"], ["Pricing Strategy", "pricing_ladder"], ["Sales Funnel", "customer_acquisition_plan"], ["Social Media Setup", "social_media_setup"], ["Sales Script", "sales_script"], ["Monetization Plan", "revenue_model"], ["Automation Plan", "crm_automation_plan"], ["Competitor Strategy", "local_partner_strategy"], ["Brand Positioning", "brand_identity_system"], ["90-Day Execution Plan", "operations_plan_90_days"], ["Founder Action Plan", "founder_action_plan"], ["App Improvement Opportunities", "ai_business_coach_next_steps"]],
  };
  const visibleSections = sectionMap[normalizedTier] || sectionMap.elite;

  const businessName = asText(read(blueprint, "business_snapshot.business_name", read(blueprint, "businessIdentity.displayBusinessName", intakeValues?.proposedBusinessName || "Your Business")), "Your Business");
  const upgradeData = read(blueprint, "upgrade_cta", {});

  return (
    <section className="starter-result" aria-live="polite">
      <header className="starter-result__hero-card">
        <p className="starter-result__eyebrow">PEN2PRO BLUEPRINT</p>
        <h2 className="starter-result__hero-title">Your Strategist Blueprint</h2>
        <p className="starter-result__subtitle">Built for {businessName}</p>
      </header>

      <div className="starter-result__bento-grid">
        {visibleSections.map(([title, key]) => (
          <ResultCard key={key} title={title} content={asText(read(blueprint, key, ""))} />
        ))}
        {isFree && ["Sales Script", "Monetization Plan", "30-Day Launch Plan", "Automation Plan"].map((section) => <ResultCard key={section} title={section} locked onUpgradePro={onUpgradePro} onSeeElite={onSeeElite} />)}
        {isPro && ["Advanced Automation Plan", "90-Day Execution Plan", "Investor-Ready Snapshot"].map((section) => <ResultCard key={section} title={section} locked onUpgradePro={onUpgradePro} onSeeElite={onSeeElite} />)}
        <PartnerCard />
      </div>

      <UpgradeCta onUpgradePro={onUpgradePro} onSeeElite={onSeeElite} upgradeData={upgradeData} />
      <PartnerToolsCard />

      <div className="starter-result__actions">
        <button type="button" className="starter-button starter-button--ghost" onClick={onStartAnother}>
          Start Another Blueprint
        </button>
      </div>
    </section>
  );
}

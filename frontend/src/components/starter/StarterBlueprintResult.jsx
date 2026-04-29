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

function ResultCard({ title, content }) {
  return (
    <article className="starter-result__bento-card">
      <h3>{title}</h3>
      <p>{content}</p>
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

function UpgradeCta({ onUpgradePro, onSeeElite }) {
  return (
    <section className="starter-upsell starter-upsell--join-now">
      <h3>{upgradeData?.title || "Ready to unlock the full PEN2PRO business buildout?"}</h3>
      <p>{upgradeData?.copy || "This free blueprint gives you the starting map. Elite unlocks deeper execution systems for launch and growth."}</p>
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

export default function StarterBlueprintResult({ response, intakeValues, onUpgradePro, onSeeElite, onStartAnother }) {
  const blueprint = useMemo(() => normalizeBlueprint(response), [response]);
  const sections = [
    ["Executive Business Snapshot", "executive_business_snapshot"],
    ["Business Type Classification", "business_type_classification"],
    ["Founder Readiness Level", "founder_readiness_level"],
    ["Customer Problem Breakdown", "customer_problem_breakdown"],
    ["Target Customer Profile", "target_customer_profile"],
    ["Market Positioning", "market_positioning"],
    ["Core Promise", "core_promise"],
    ["First Paid Offer", "first_paid_offer"],
    ["Pricing Ladder", "pricing_ladder"],
    ["Revenue Model", "revenue_model"],
    ["Business Name Strategy", "business_name_strategy"],
    ["Domain Strategy", "domain_strategy"],
    ["Legal Setup Roadmap", "legal_setup_roadmap"],
    ["Business Banking Setup", "business_banking_setup"],
    ["Payment Processing Setup", "payment_processing_setup"],
    ["Website / Landing Page Plan", "website_landing_page_plan"],
    ["Google Business Profile Setup", "google_business_profile_setup"],
    ["Apple Maps / Apple Business Connect Setup", "apple_maps_apple_business_connect_setup"],
    ["Social Media Setup", "social_media_setup"],
    ["Sales Script", "sales_script"],
    ["Outreach Strategy", "outreach_strategy"],
    ["Content Strategy", "content_strategy"],
    ["30-Day Launch Plan", "launch_plan_30_days"],
    ["90-Day Operations Plan", "operations_plan_90_days"],
    ["12-Month Scale Plan", "scale_plan_12_months"],
    ["Credit & Funding Readiness", "credit_funding_readiness"],
    ["Risk Flags", "risk_flags"],
    ["Beginner Mistakes to Avoid", "beginner_mistakes_to_avoid"],
    ["Next 7 Actions", "next_7_actions"],
    ["Upgrade CTA", "upgrade_cta"],
  ];

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
        {sections.map(([title, key]) => (
          <ResultCard key={key} title={title} content={asText(read(blueprint, key, ""))} />
        ))}
        <PartnerCard />
      </div>

      <UpgradeCta onUpgradePro={onUpgradePro} onSeeElite={onSeeElite} upgradeData={upgradeData} />
      <PartnerToolsCard />

      <UpgradeCta onUpgradePro={onUpgradePro} onSeeElite={onSeeElite} />

      <div className="starter-result__actions">
        <button type="button" className="starter-button starter-button--ghost" onClick={onStartAnother}>
          Start Another Blueprint
        </button>
      </div>
    </section>
  );
}

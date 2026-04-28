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
          ))}
        </ul>
      ) : (
        <p>{typeof value === "string" ? value : "Not provided"}</p>
      )}
    </article>
  );
}

function UpgradeCta({ onUpgradePro, onSeeElite, ctaLabel }) {
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

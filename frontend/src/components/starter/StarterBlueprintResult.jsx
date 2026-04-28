import { useMemo } from "react";

function isObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toText(value, fallback = "Not provided") {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (Array.isArray(value)) {
    const rows = value
      .map((item) => (typeof item === "string" ? item : item?.task || item?.note || item?.requirement || item?.tool || ""))
      .map((item) => String(item).trim())
      .filter(Boolean);
    return rows.length ? rows.join(" • ") : fallback;
  }
  if (isObject(value)) {
    const rows = Object.entries(value)
      .map(([key, detail]) => `${key.replace(/_/g, " ")}: ${typeof detail === "string" ? detail : ""}`)
      .filter((row) => row.trim().length > 2);
    return rows.length ? rows.join(" • ") : fallback;
  }
  return fallback;
}

function normalizeBlueprintPayload(response, blueprint) {
  if (isObject(blueprint)) return blueprint;
  if (isObject(response?.blueprint)) return response.blueprint;
  if (isObject(response?.result?.blueprint)) return response.result.blueprint;
  if (isObject(response?.result)) return response.result;
  if (typeof response?.blueprint === "string") return { narrative: response.blueprint };
  if (typeof response?.result === "string") return { narrative: response.result };
  if (typeof response === "string") return { narrative: response };
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

function UpgradeCta({ onUpgradePro, onSeeElite }) {
  return (
    <section className="starter-upsell starter-upsell--join-now">
      <h3>Unlock Full Strategy</h3>
      <p>Free Forever is active. Upgrade to unlock deeper strategist execution systems.</p>
      <div className="starter-upsell__plans">
        <article className="starter-upsell__plan is-locked">
          <h4>Pro Plan</h4>
          <p>Conversion playbooks, deeper positioning, and advanced launch systems.</p>
          <span className="starter-upsell__lock">Locked on Free Forever</span>
          <button className="starter-button starter-button--secondary" onClick={onUpgradePro}>Unlock Full Strategy</button>
        </article>
        <article className="starter-upsell__plan starter-upsell__plan--elite is-locked">
          <h4>Elite Plan</h4>
          <p>Elite growth systems and 10M strategist sequencing.</p>
          <p className="starter-upsell__promo">First month only $50</p>
          <span className="starter-upsell__lock">Locked on Free Forever</span>
          <button className="starter-button starter-button--primary" onClick={onSeeElite}>Unlock Full Strategy</button>
        </article>
      </div>
    </section>
  );
}

function StarterBlueprintResult({ response, blueprint, intakeValues, onUpgradePro, onSeeElite, onStartAnother }) {
  const blueprintData = useMemo(() => normalizeBlueprintPayload(response, blueprint), [response, blueprint]);
  const businessName = toText(intakeValues?.proposedBusinessName || intakeValues?.businessName || blueprintData?.business_snapshot?.business_name, "Your Business");

  const sections = [
    ["Executive Snapshot", toText(blueprintData?.business_snapshot, `${businessName} is positioned to launch with a focused starter offer and weekly execution cadence.`)],
    ["Business Name Usage", `${businessName} should be used consistently across domain, social handles, invoice templates, and offer pages.`],
    ["Market Positioning", toText(blueprintData?.offer_positioning?.core_promise || blueprintData?.ventureSummary?.brandPositioning, `${businessName} should position around one measurable customer outcome with fixed scope.`)],
    ["Ideal Customer Profile", toText(blueprintData?.customer_avatar?.primary_segment || intakeValues?.targetCustomer)],
    ["First Offer", toText(blueprintData?.monetization_roadmap?.first_offer || blueprintData?.business_snapshot?.product_or_service || intakeValues?.productOrService)],
    ["Revenue Model", toText(blueprintData?.monetization_roadmap?.revenue_model)],
    ["Pricing Strategy", toText(blueprintData?.pricing_strategy?.direction || blueprintData?.monetization_roadmap?.pricing_idea)],
    ["30-Day Launch Plan", toText(blueprintData?.launch_plan_30_days || blueprintData?.first_30_day_execution_plan)],
    ["90-Day Growth Plan", toText(blueprintData?.operations_plan_90_days)],
    ["Brand Identity Direction", toText(blueprintData?.ventureSummary?.brandPositioning, `${businessName} should use clear, practical, no-fluff brand language tied to outcomes.`)],
    ["Operations Checklist", toText(blueprintData?.startup_requirements)],
    ["Lead Generation Strategy", toText(blueprintData?.proPlan?.leadGenerationChannels || blueprintData?.monetization_roadmap?.customer_acquisition)],
    ["Sales Script", toText(blueprintData?.proPlan?.salesProcess, `Use a pain-first script: diagnose problem, quantify cost of delay, present ${businessName}'s fixed-scope paid pilot, and close with one CTA.`)],
    ["Content Strategy", toText(blueprintData?.scale_plan_12_months?.strategic_targets, `Publish 3 weekly proof-led content pieces showing ${businessName}'s before/after outcomes.`)],
    ["Tools Needed", toText(blueprintData?.tools_and_software || blueprintData?.proPlan?.toolsNeeded)],
    ["Risk Warnings", toText(blueprintData?.risk_flags)],
    ["Next Best Actions", toText(blueprintData?.ai_strategist_recommendation?.next_best_move || blueprintData?.next_steps_timeline)],
    ["Upgrade CTA", toText(blueprintData?.upgrade_recommendation?.why_now, "Upgrade to Pro or Elite to unlock deeper strategist systems and scaling plans.")],
  ];

  return (
    <div className="starter-result starter-reveal is-visible">
      <section className="starter-result__hero-card">
        <p className="starter-result__eyebrow">PEN2PRO BLUEPRINT</p>
        <h2 className="starter-result__hero-title">{businessName} — 10M Business Strategist Blueprint</h2>
        <p className="starter-result__subtitle">Generated and ready to execute now.</p>
      </section>

      <section className="starter-result__bento">
        {sections.map(([title, content]) => (
          <ResultCard key={title} title={title} content={content} />
        ))}
      </section>

      <UpgradeCta onUpgradePro={onUpgradePro} onSeeElite={onSeeElite} />

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

import { useEffect, useMemo, useRef, useState } from "react";

import { sectionDefinitions } from "./starterWorkflow.js";

const deliveryOptions = [
  { value: "online", label: "Online" },
  { value: "local", label: "Local" },
  { value: "both", label: "Both" },
];

const accessTiers = [
  { value: "free", label: "Free Forever Blueprint" },
  { value: "pro", label: "Pro Strategist Blueprint — Upgrade Required" },
  { value: "elite", label: "Elite 10M Strategist Blueprint — Upgrade Required" },
];

const strategistFocusOptions = [
  { value: "startup", label: "Startup Strategist" },
  { value: "brand", label: "Brand Strategist" },
  { value: "monetization", label: "Monetization Strategist" },
  { value: "marketing", label: "Marketing Strategist" },
  { value: "operations", label: "Operations Strategist" },
  { value: "legal_foundation", label: "Legal/Foundation Strategist" },
];

const urgencyOptions = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

function FieldError({ error }) {
  if (!error) return null;
  return <p className="starter-form__error">{error}</p>;
}

function SelectMenu({ label, name, value, options, onChange, disabled }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = useMemo(() => options.find((option) => option.value === value) || options[0], [options, value]);

  useEffect(() => {
    const handleOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  return (
    <div className="starter-form__field">
      <span className="starter-form__label">{label}</span>
      <div className={`starter-select ${open ? "is-open" : ""}`} ref={ref}>
        <button
          className="starter-select__trigger"
          type="button"
          onClick={() => !disabled && setOpen((current) => !current)}
          aria-expanded={open}
          aria-haspopup="listbox"
          disabled={disabled}
        >
          <span>{selected?.label || "Choose one"}</span>
          <span className="starter-select__arrow">⌄</span>
        </button>
        <input type="hidden" name={name} value={value} />
        <div className={`starter-select__menu ${open ? "is-visible" : ""}`} role="listbox" aria-label={label}>
          {options.map((option) => (
            <button
              key={option.value}
              className={`starter-select__option ${option.value === value ? "is-selected" : ""}`}
              type="button"
              role="option"
              aria-selected={option.value === value}
              onClick={() => {
                onChange(name, option.value);
                setOpen(false);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const rawRegistrarUrl = import.meta.env.VITE_DOMAIN_REGISTRAR_URL || "";
const registrarBaseUrl = rawRegistrarUrl.trim() || "https://www.namecheap.com/domains/registration/results/?domain=";

function generateSuggestedDomain(name) {
  const normalized = String(name || "").toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, "");
  return normalized ? `${normalized}.com` : "";
}

function StatusChip({ status }) {
  return <span className={`starter-status-chip starter-status-chip--${status.toLowerCase().replace(/\s+/g, "-")}`}>{status}</span>;
}

function StepCard({ step, title, helper, status, children }) {
  return (
    <section className="starter-step-card starter-reveal" aria-label={title}>
      <div className="starter-step-card__header">
        <div>
          <p className="starter-step-card__step">{step}</p>
          <h3>{title}</h3>
          <p className="starter-form__helper">{helper}</p>
        </div>
        <StatusChip status={status} />
      </div>
      <div className="starter-step-card__body">{children}</div>
    </section>
  );
}

function StarterIntakeForm({ values, errors, loading, onChange, onSubmit, sectionStatuses, onSaveDraft, onClearDraft, hasProAccess, hasEliteAccess }) {
  const suggestedDomain = generateSuggestedDomain(values.proposedBusinessName);
  const domainToCheck = values.domainToCheck || suggestedDomain;
  const isPaidTier = ["pro", "elite"].includes(values.accessLevel);
  const accessLevel = values.accessLevel || "free";
  const isLockedPro = accessLevel === "pro" && !hasProAccess;
  const isLockedElite = accessLevel === "elite" && !hasEliteAccess;
  const generateButtonLabel = isLockedPro ? "Upgrade to Pro" : isLockedElite ? "Unlock Elite" : "Generate Blueprint";

  const openRegistrarSearch = () => {
    const domain = (domainToCheck || "").trim();
    if (!domain) return;
    window.open(`${registrarBaseUrl}${encodeURIComponent(domain)}`, "_blank", "noopener,noreferrer");
    onChange("domainSearchAttempted", "true");
  };

  const statusByKey = sectionStatuses.reduce((acc, section) => ({ ...acc, [section.key]: section.status }), {});

  return (
    <form className="starter-form" onSubmit={onSubmit} noValidate>
      <StepCard step={sectionDefinitions[0].stepLabel} title={sectionDefinitions[0].title} helper={sectionDefinitions[0].helper} status={statusByKey.businessIdentity || "Not started"}>
        <div className="starter-form__grid">
          <label className="starter-form__field">
            <span className="starter-form__label">Business Name</span>
            <input className="starter-form__input" name="proposedBusinessName" value={values.proposedBusinessName} onChange={(event) => onChange("proposedBusinessName", event.target.value)} placeholder="Example: Greenway Exterior Solutions" disabled={loading} />
            <FieldError error={errors.proposedBusinessName} />
          </label>
          <label className="starter-form__field">
            <span className="starter-form__label">Domain</span>
            <input className="starter-form__input" name="domainToCheck" value={domainToCheck} onChange={(event) => onChange("domainToCheck", event.target.value)} placeholder="greenwayexteriorsolutions.com" disabled={loading} />
            {suggestedDomain && <p className="starter-form__helper">Suggested domain: {suggestedDomain}</p>}
          </label>
          <label className="starter-form__field">
            <span className="starter-form__label">Category</span>
            <input className="starter-form__input" name="businessType" value={values.businessType} onChange={(event) => onChange("businessType", event.target.value)} placeholder="Local service, ecommerce, consulting, SaaS" disabled={loading} />
            <FieldError error={errors.businessType} />
          </label>
          <label className="starter-form__field">
            <span className="starter-form__label">Location</span>
            <input className="starter-form__input" name="location" value={values.location} onChange={(event) => onChange("location", event.target.value)} placeholder="City, state, or region" disabled={loading} />
            <FieldError error={errors.location} />
          </label>
          <label className="starter-form__field">
            <span className="starter-form__label">Market Location</span>
            <input className="starter-form__input" name="marketLocation" value={values.marketLocation} onChange={(event) => onChange("marketLocation", event.target.value)} placeholder="Where will you sell or operate?" disabled={loading} />
            <FieldError error={errors.marketLocation} />
          </label>
        </div>
        <div className="starter-form__domain-actions">
          <button className="starter-button starter-button--secondary" type="button" onClick={openRegistrarSearch} disabled={loading || !String(domainToCheck || "").trim()}>
            Check Domain Availability
          </button>
        </div>
      </StepCard>

      <StepCard step={sectionDefinitions[1].stepLabel} title={sectionDefinitions[1].title} helper={sectionDefinitions[1].helper} status={statusByKey.offerDetails || "Not started"}>
        <div className="starter-form__grid">
          <label className="starter-form__field starter-form__field--full">
            <span className="starter-form__label">Business Idea</span>
            <textarea className="starter-form__input starter-form__textarea" name="businessIdea" value={values.businessIdea} onChange={(event) => onChange("businessIdea", event.target.value)} placeholder="Describe the business idea you want to turn into a real offer." rows={4} disabled={loading} />
            <FieldError error={errors.businessIdea} />
          </label>
          <label className="starter-form__field">
            <span className="starter-form__label">Product or Service</span>
            <input className="starter-form__input" name="productOrService" value={values.productOrService} onChange={(event) => onChange("productOrService", event.target.value)} placeholder="What are you planning to sell first?" disabled={loading} />
            <FieldError error={errors.productOrService} />
          </label>
          <label className="starter-form__field">
            <span className="starter-form__label">Target Customer</span>
            <input className="starter-form__input" name="targetCustomer" value={values.targetCustomer} onChange={(event) => onChange("targetCustomer", event.target.value)} placeholder="Who is most likely to buy this first?" disabled={loading} />
            <FieldError error={errors.targetCustomer} />
          </label>
          <SelectMenu label="Delivery Preference" name="deliveryPreference" value={values.deliveryPreference || "both"} options={deliveryOptions} onChange={onChange} disabled={loading} />
        </div>
      </StepCard>

      <StepCard step={sectionDefinitions[2].stepLabel} title={sectionDefinitions[2].title} helper={sectionDefinitions[2].helper} status={statusByKey.founderReadiness || "Not started"}>
        <div className="starter-form__grid">
          <label className="starter-form__field">
            <span className="starter-form__label">Skill Level</span>
            <input className="starter-form__input" name="skillLevel" value={values.skillLevel} onChange={(event) => onChange("skillLevel", event.target.value)} placeholder="Beginner, intermediate, or advanced" disabled={loading} />
            <FieldError error={errors.skillLevel} />
          </label>
          <label className="starter-form__field">
            <span className="starter-form__label">Current Stage</span>
            <input className="starter-form__input" name="currentStage" value={values.currentStage} onChange={(event) => onChange("currentStage", event.target.value)} placeholder="Idea, pre-revenue, first clients, growth" disabled={loading} />
            <FieldError error={errors.currentStage} />
          </label>
          <label className="starter-form__field starter-form__field--full">
            <span className="starter-form__label">Skills and Resources</span>
            <textarea className="starter-form__input starter-form__textarea" name="skillsResources" value={values.skillsResources} onChange={(event) => onChange("skillsResources", event.target.value)} placeholder="What skills, tools, audience, or resources do you already have?" rows={3} disabled={loading} />
            <FieldError error={errors.skillsResources} />
          </label>
          <label className="starter-form__field">
            <span className="starter-form__label">Time Availability</span>
            <input className="starter-form__input" name="timeAvailability" value={values.timeAvailability} onChange={(event) => onChange("timeAvailability", event.target.value)} placeholder="How much time can you commit weekly?" disabled={loading} />
            <FieldError error={errors.timeAvailability} />
          </label>
        </div>
      </StepCard>

      <StepCard step={sectionDefinitions[3].stepLabel} title={sectionDefinitions[3].title} helper={sectionDefinitions[3].helper} status={statusByKey.goalsAndConstraints || "Not started"}>
        <div className="starter-form__grid">
          <label className="starter-form__field">
            <span className="starter-form__label">Income Goal</span>
            <input className="starter-form__input" name="incomeGoal" value={values.incomeGoal} onChange={(event) => onChange("incomeGoal", event.target.value)} placeholder="What is your first revenue target?" disabled={loading} />
            <FieldError error={errors.incomeGoal} />
          </label>
          <label className="starter-form__field starter-form__field--full">
            <span className="starter-form__label">Biggest Obstacle</span>
            <textarea className="starter-form__input starter-form__textarea" name="biggestObstacle" value={values.biggestObstacle} onChange={(event) => onChange("biggestObstacle", event.target.value)} placeholder="What is the main thing slowing you down right now?" rows={3} disabled={loading} />
            <FieldError error={errors.biggestObstacle} />
          </label>
          <SelectMenu label="Urgency Level" name="urgencyLevel" value={values.urgencyLevel} options={urgencyOptions} onChange={onChange} disabled={loading} />
        </div>
      </StepCard>

      <StepCard step={sectionDefinitions[4].stepLabel} title={sectionDefinitions[4].title} helper={sectionDefinitions[4].helper} status={statusByKey.blueprintAccess || "Not started"}>
        <div className="starter-form__grid">
          <SelectMenu label="Blueprint Access Level" name="accessLevel" value={values.accessLevel} options={accessTiers} onChange={onChange} disabled={loading} />
          {isPaidTier && (
            <div className="starter-form__focus-reveal">
              <SelectMenu label="Strategist Focus" name="strategistFocus" value={values.strategistFocus} options={strategistFocusOptions} onChange={onChange} disabled={loading} />
            </div>
          )}
          {!isPaidTier && (
            <div className="starter-tier-notice" role="status">
              <strong>Unlock the Strategist Level.</strong> Free Forever gives you the foundation. Pro unlocks outreach, content, launch planning, CRM, follow-up, and customer acquisition. Upgrade to Pro to continue.
            </div>
          )}
        </div>
      </StepCard>

      <div className="starter-form__actions">
        <button className="starter-button starter-button--secondary" type="button" onClick={onSaveDraft} disabled={loading}>Save Draft</button>
        <button className="starter-button starter-button--secondary" type="button" onClick={onClearDraft} disabled={loading}>Clear Draft</button>
        <button className={`starter-button starter-button--primary starter-button--pulse ${loading ? "is-disabled" : ""}`} type="submit" disabled={loading}>
          {loading ? <span className="starter-button__loading"><span className="starter-spinner" aria-hidden="true" />Building your PEN2PRO blueprint…</span> : generateButtonLabel}
        </button>
      </div>
    </form>
  );
}

export default StarterIntakeForm;

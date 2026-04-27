import { useEffect, useMemo, useRef, useState } from "react";

const deliveryOptions = [
  { value: "online", label: "Online" },
  { value: "local", label: "Local" },
  { value: "both", label: "Both" },
];

const accessTiers = [
  { value: "free", label: "Free Forever Blueprint" },
  { value: "pro", label: "Pro Strategist Blueprint" },
  { value: "elite", label: "Elite 10M Strategist Blueprint" },
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

const fields = [
  { name: "businessIdea", label: "Business idea", placeholder: "Describe the business idea you want to turn into a real offer.", type: "textarea" },
  { name: "businessType", label: "Business type", placeholder: "Local service, e-commerce, consulting, SaaS, etc." },
  { name: "productOrService", label: "Product or service", placeholder: "What are you planning to sell first?" },
  { name: "targetCustomer", label: "Target customer", placeholder: "Who is most likely to buy this first?" },
  { name: "location", label: "Location", placeholder: "City, state, or region where you will operate." },
  { name: "marketLocation", label: "Market location", placeholder: "Where will you sell or operate?" },
  { name: "budget", label: "Budget", placeholder: "What budget do you have for the next 30 days?" },
  { name: "startupBudget", label: "Startup budget", placeholder: "What budget are you starting with?" },
  { name: "skillLevel", label: "Skill level", placeholder: "Beginner, intermediate, or advanced" },
  { name: "timeAvailability", label: "Time availability", placeholder: "How much time can you commit weekly?" },
  { name: "currentStage", label: "Current stage", placeholder: "Idea, pre-revenue, first clients, growth" },
  { name: "skillsResources", label: "Skills and resources", placeholder: "What skills, tools, audience, or resources do you already have?", type: "textarea" },
  { name: "incomeGoal", label: "Income goal", placeholder: "What is your first revenue target?" },
  { name: "biggestObstacle", label: "Biggest obstacle", placeholder: "What is the main thing slowing you down right now?", type: "textarea" },
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

  const handleKeyDown = (event) => {
    if (disabled) return;
    if (["Enter", " ", "ArrowDown"].includes(event.key)) {
      event.preventDefault();
      setOpen(true);
    }
    if (event.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div className="starter-form__field">
      <span className="starter-form__label">{label}</span>
      <div className={`starter-select ${open ? "is-open" : ""}`} ref={ref}>
        <button
          className="starter-select__trigger"
          type="button"
          onClick={() => !disabled && setOpen((current) => !current)}
          onKeyDown={handleKeyDown}
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

function StarterIntakeForm({ values, errors, loading, onChange, onSubmit }) {
  const suggestedDomain = generateSuggestedDomain(values.proposedBusinessName);
  const domainToCheck = values.domainToCheck || suggestedDomain;
  const isPaidTier = ["pro", "elite"].includes(values.accessLevel);

  const openRegistrarSearch = () => {
    const domain = (domainToCheck || "").trim();
    if (!domain) return;
    window.open(`${registrarBaseUrl}${encodeURIComponent(domain)}`, "_blank", "noopener,noreferrer");
    onChange("domainSearchAttempted", "true");
  };

  return (
    <form className="starter-form" onSubmit={onSubmit} noValidate>
      <section className="starter-form__name-card starter-reveal" aria-label="Confirm your business name">
        <h3>Confirm Your Business Name</h3>
        <p className="starter-form__helper">
          Enter the name you want to build your blueprint around. This name will appear throughout your PEN2PRO blueprint.
        </p>

        <label className="starter-form__field">
          <span className="starter-form__label">Business Name</span>
          <input className="starter-form__input" name="proposedBusinessName" value={values.proposedBusinessName} onChange={(event) => onChange("proposedBusinessName", event.target.value)} placeholder="Example: Greenway Exterior Solutions" disabled={loading} />
          <FieldError error={errors.proposedBusinessName} />
        </label>

        <label className="starter-form__field">
          <span className="starter-form__label">Check Domain Availability</span>
          <input className="starter-form__input" name="domainToCheck" value={domainToCheck} onChange={(event) => onChange("domainToCheck", event.target.value)} placeholder="greenwayexteriorsolutions.com" disabled={loading} />
          {suggestedDomain && <p className="starter-form__helper">Suggested domain: {suggestedDomain}</p>}
        </label>

        <div className="starter-form__domain-actions">
          <button className="starter-button starter-button--secondary" type="button" onClick={openRegistrarSearch} disabled={loading || !String(domainToCheck || "").trim()}>
            Check Domain Availability
          </button>

          {values.domainSearchAttempted === "true" && (
            <button className="starter-button starter-button--secondary" type="button" onClick={openRegistrarSearch} disabled={loading || !String(domainToCheck || "").trim()}>
              Register This Domain
            </button>
          )}
        </div>
      </section>

      <div className="starter-form__grid">
        <SelectMenu label="Blueprint Access Level" name="accessLevel" value={values.accessLevel} options={accessTiers} onChange={onChange} disabled={loading} />
        <FieldError error={errors.accessLevel} />

        {isPaidTier && (
          <div className="starter-form__focus-reveal">
            <SelectMenu label="Choose Your Strategist Focus" name="strategistFocus" value={values.strategistFocus} options={strategistFocusOptions} onChange={onChange} disabled={loading} />
          </div>
        )}

        {!isPaidTier && (
          <div className="starter-tier-notice" role="status">
            Free Forever gives you a starter blueprint with your business idea, business name, domain check, target customer, basic offer, and first-step checklist.
            <br />
            <br />
            Upgrade to Pro or Elite to unlock strategist modes for branding, monetization, marketing, operations, and legal/foundation planning.
          </div>
        )}

        {fields.map((field) => (
          <label className="starter-form__field" key={field.name}>
            <span className="starter-form__label">{field.label}</span>
            {field.type === "textarea" ? (
              <textarea className="starter-form__input starter-form__textarea" name={field.name} value={values[field.name]} onChange={(event) => onChange(field.name, event.target.value)} placeholder={field.placeholder} rows={field.name === "businessIdea" ? 4 : 3} disabled={loading} />
            ) : (
              <input className="starter-form__input" name={field.name} value={values[field.name]} onChange={(event) => onChange(field.name, event.target.value)} placeholder={field.placeholder} disabled={loading} />
            )}
            <FieldError error={errors[field.name]} />
          </label>
        ))}

        <SelectMenu label="Urgency level" name="urgencyLevel" value={values.urgencyLevel} options={urgencyOptions} onChange={onChange} disabled={loading} />
        <SelectMenu label="Delivery preference" name="deliveryPreference" value={values.deliveryPreference || "both"} options={deliveryOptions} onChange={onChange} disabled={loading} />
      </div>

      <button className="starter-button starter-button--primary starter-button--pulse" type="submit" disabled={loading}>
        {loading ? "Building your Starter Business Blueprint..." : "Generate My Blueprint"}
      </button>
    </form>
  );
}

export default StarterIntakeForm;

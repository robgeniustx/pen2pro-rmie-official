const deliveryOptions = [
  { value: "online", label: "Online" },
  { value: "local", label: "Local" },
  { value: "both", label: "Both" },
];

const accessTiers = [
  { value: "free", label: "Free (limited strategist output)" },
  { value: "pro", label: "Pro (full strategist breakdown)" },
  { value: "elite", label: "Elite (advanced insights + projections)" },
];

const urgencyOptions = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

const fields = [
  {
    name: "businessIdea",
    label: "Business idea",
    placeholder: "Describe the business idea you want to turn into a real offer.",
    type: "textarea",
  },
  {
    name: "businessType",
    label: "Business type",
    placeholder: "Local service, e-commerce, consulting, SaaS, etc.",
  },
  {
    name: "productOrService",
    label: "Product or service",
    placeholder: "What are you planning to sell first?",
  },
  {
    name: "targetCustomer",
    label: "Target customer",
    placeholder: "Who is most likely to buy this first?",
  },
  {
    name: "location",
    label: "Location",
    placeholder: "City, state, or region where you will operate.",
  },
  {
    name: "marketLocation",
    label: "Market location",
    placeholder: "Where will you sell or operate?",
  },
  {
    name: "budget",
    label: "Budget",
    placeholder: "What budget do you have for the next 30 days?",
  },
  {
    name: "startupBudget",
    label: "Startup budget",
    placeholder: "What budget are you starting with?",
  },
  {
    name: "skillLevel",
    label: "Skill level",
    placeholder: "Beginner, intermediate, or advanced",
  },
  {
    name: "timeAvailability",
    label: "Time availability",
    placeholder: "How much time can you commit weekly?",
  },
  {
    name: "currentStage",
    label: "Current stage",
    placeholder: "Idea, pre-revenue, first clients, growth",
  },
  {
    name: "skillsResources",
    label: "Skills and resources",
    placeholder: "What skills, tools, audience, or resources do you already have?",
    type: "textarea",
  },
  {
    name: "incomeGoal",
    label: "Income goal",
    placeholder: "What is your first revenue target?",
  },
  {
    name: "biggestObstacle",
    label: "Biggest obstacle",
    placeholder: "What is the main thing slowing you down right now?",
    type: "textarea",
  },
];

function FieldError({ error }) {
  if (!error) {
    return null;
  }

  return <p className="starter-form__error">{error}</p>;
}

const rawRegistrarUrl = import.meta.env.VITE_DOMAIN_REGISTRAR_URL || "";
const registrarBaseUrl =
  rawRegistrarUrl.trim() || "https://www.namecheap.com/domains/registration/results/?domain=";

function generateSuggestedDomain(name) {
  const normalized = String(name || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, "");

  return normalized ? `${normalized}.com` : "";
}

function StarterIntakeForm({ values, errors, loading, onChange, onSubmit }) {
  const suggestedDomain = generateSuggestedDomain(values.proposedBusinessName);
  const domainToCheck = values.domainToCheck || suggestedDomain;

  const openRegistrarSearch = () => {
    const domain = (domainToCheck || "").trim();

    if (!domain) {
      return;
    }

    window.open(`${registrarBaseUrl}${encodeURIComponent(domain)}`, "_blank", "noopener,noreferrer");
    onChange("domainSearchAttempted", "true");
  };

  return (
    <form className="starter-form" onSubmit={onSubmit} noValidate>
      <section className="starter-form__name-card" aria-label="Confirm your business name">
        <h3>Confirm Your Business Name</h3>
        <p className="starter-form__helper">
          Enter the name you want to build your blueprint around. This name will appear throughout your business plan,
          printout, and emailed blueprint.
        </p>

        <label className="starter-form__field">
          <span className="starter-form__label">Business Name</span>
          <input
            className="starter-form__input"
            name="proposedBusinessName"
            value={values.proposedBusinessName}
            onChange={(event) => onChange("proposedBusinessName", event.target.value)}
            placeholder="Example: Greenway Exterior Solutions"
            disabled={loading}
          />
          <FieldError error={errors.proposedBusinessName} />
        </label>

        <label className="starter-form__field">
          <span className="starter-form__label">Check Domain Availability</span>
          <input
            className="starter-form__input"
            name="domainToCheck"
            value={domainToCheck}
            onChange={(event) => onChange("domainToCheck", event.target.value)}
            placeholder="greenwayexteriorsolutions.com"
            disabled={loading}
          />
          {suggestedDomain && (
            <p className="starter-form__helper">Suggested domain: {suggestedDomain}</p>
          )}
        </label>

        <div className="starter-form__domain-actions">
          <button
            className="starter-button starter-button--secondary"
            type="button"
            onClick={openRegistrarSearch}
            disabled={loading || !String(domainToCheck || "").trim()}
          >
            Check Domain Availability
          </button>

          {values.domainSearchAttempted === "true" && (
            <>
              <p className="starter-form__domain-note">Domain availability will be confirmed by the registrar.</p>
              <button
                className="starter-button starter-button--secondary"
                type="button"
                onClick={openRegistrarSearch}
                disabled={loading || !String(domainToCheck || "").trim()}
              >
                Register This Domain
              </button>
            </>
          )}
        </div>
      </section>

      <div className="starter-form__grid">
        <label className="starter-form__field">
          <span className="starter-form__label">Strategist access</span>
          <select
            className="starter-form__input"
            name="accessTier"
            value={values.accessTier}
            onChange={(event) => onChange("accessTier", event.target.value)}
            disabled={loading}
          >
            {accessTiers.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <FieldError error={errors.accessTier} />
        </label>

        {fields.map((field) => (
          <label className="starter-form__field" key={field.name}>
            <span className="starter-form__label">{field.label}</span>
            {field.type === "textarea" ? (
              <textarea
                className="starter-form__input starter-form__textarea"
                name={field.name}
                value={values[field.name]}
                onChange={(event) => onChange(field.name, event.target.value)}
                placeholder={field.placeholder}
                rows={field.name === "businessIdea" ? 4 : 3}
                disabled={loading}
              />
            ) : (
              <input
                className="starter-form__input"
                name={field.name}
                value={values[field.name]}
                onChange={(event) => onChange(field.name, event.target.value)}
                placeholder={field.placeholder}
                disabled={loading}
              />
            )}
            <FieldError error={errors[field.name]} />
          </label>
        ))}

        <label className="starter-form__field">
          <span className="starter-form__label">Urgency level</span>
          <select
            className="starter-form__input"
            name="urgencyLevel"
            value={values.urgencyLevel}
            onChange={(event) => onChange("urgencyLevel", event.target.value)}
            disabled={loading}
          >
            {urgencyOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <FieldError error={errors.urgencyLevel} />
        </label>

        <label className="starter-form__field">
          <span className="starter-form__label">Delivery preference</span>
          <select
            className="starter-form__input"
            name="deliveryPreference"
            value={values.deliveryPreference}
            onChange={(event) => onChange("deliveryPreference", event.target.value)}
            disabled={loading}
          >
            <option value="">Choose one</option>
            {deliveryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <FieldError error={errors.deliveryPreference} />
        </label>
      </div>

      <button className="starter-button starter-button--primary" type="submit" disabled={loading}>
        {loading ? "Building your Starter Business Blueprint..." : "Generate Starter Business Blueprint"}
      </button>
    </form>
  );
}

export default StarterIntakeForm;

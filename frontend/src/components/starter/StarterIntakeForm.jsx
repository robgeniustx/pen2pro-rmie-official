const deliveryOptions = [
  { value: "online", label: "Online" },
  { value: "local", label: "Local" },
  { value: "both", label: "Both" },
];

const fields = [
  {
    name: "businessIdea",
    label: "Business idea",
    placeholder: "Describe the business idea you want to turn into a real offer.",
    type: "textarea",
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
    name: "marketLocation",
    label: "Market location",
    placeholder: "Where will you sell or operate?",
  },
  {
    name: "startupBudget",
    label: "Startup budget",
    placeholder: "What budget are you starting with?",
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

const brandBuilderOptions = [
  { id: "momentum-labs", name: "Momentum Labs" },
  { id: "northstar-studio", name: "Northstar Studio" },
  { id: "summit-growth", name: "Summit Growth Co." },
];

function StarterIntakeForm({ values, errors, loading, onChange, onSubmit }) {
  return (
    <form className="starter-form" onSubmit={onSubmit} noValidate>
      <section className="starter-form__name-card" aria-label="Confirm your business name">
        <h3>Confirm Your Business Name</h3>
        <p className="starter-form__helper">
          Use one of the suggested names or enter your own before printing or emailing your blueprint.
        </p>

        <label className="starter-form__field">
          <span className="starter-form__label">Brand Builder suggestion</span>
          <select
            className="starter-form__input"
            name="selectedBrandName"
            value={values.selectedBrandName}
            onChange={(event) => onChange("selectedBrandName", event.target.value)}
            disabled={loading}
          >
            <option value="">Select a suggested brand name</option>
            {brandBuilderOptions.map((option) => (
              <option key={option.id} value={option.name}>
                {option.name}
              </option>
            ))}
          </select>
        </label>

        <label className="starter-form__field">
          <span className="starter-form__label">Your Proposed Business Name</span>
          <input
            className="starter-form__input"
            name="proposedBusinessName"
            value={values.proposedBusinessName}
            onChange={(event) => onChange("proposedBusinessName", event.target.value)}
            placeholder="Enter your business name or select one from the Brand Builder"
            disabled={loading}
          />
          <FieldError error={errors.proposedBusinessName} />
        </label>
      </section>

      <div className="starter-form__grid">
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

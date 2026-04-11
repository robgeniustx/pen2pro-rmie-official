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

function StarterIntakeForm({ values, errors, loading, onChange, onSubmit }) {
  return (
    <form className="starter-form" onSubmit={onSubmit} noValidate>
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
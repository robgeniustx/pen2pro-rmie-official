import { useMemo, useState } from "react";

import StarterIntakeForm from "../components/starter/StarterIntakeForm.jsx";
import StarterBlueprintResult from "../components/starter/StarterBlueprintResult.jsx";
import { generateStarterBlueprint } from "../services/api.js";

const initialValues = {
  tier: "starter",
  accessTier: "free",
  proposedBusinessName: "",
  domainToCheck: "",
  domainSearchAttempted: "",
  businessIdea: "",
  businessType: "",
  productOrService: "",
  targetCustomer: "",
  location: "",
  marketLocation: "",
  budget: "",
  startupBudget: "",
  skillLevel: "",
  timeAvailability: "",
  urgencyLevel: "medium",
  currentStage: "",
  skillsResources: "",
  incomeGoal: "",
  biggestObstacle: "",
  deliveryPreference: "",
};

const requiredFields = [
  "proposedBusinessName",
  "businessIdea",
  "businessType",
  "productOrService",
  "targetCustomer",
  "location",
  "marketLocation",
  "budget",
  "startupBudget",
  "skillLevel",
  "timeAvailability",
  "currentStage",
  "skillsResources",
  "incomeGoal",
  "biggestObstacle",
  "deliveryPreference",
];

function validate(values) {
  return requiredFields.reduce((errors, field) => {
    if (!String(values[field] || "").trim()) {
      errors[field] = "This field is required.";
    }

    return errors;
  }, {});
}

function resolveBlueprint(data) {
  if (!data || typeof data !== "object") {
    return null;
  }

  if (data.blueprint && typeof data.blueprint === "object" && !Array.isArray(data.blueprint)) {
    return data.blueprint;
  }

  if (
    data.data &&
    typeof data.data === "object" &&
    data.data.blueprint &&
    typeof data.data.blueprint === "object" &&
    !Array.isArray(data.data.blueprint)
  ) {
    return data.data.blueprint;
  }

  if (!Array.isArray(data)) {
    if (data.result && typeof data.result === "object" && !Array.isArray(data.result)) {
      return data.result.blueprint || data.result;
    }

    if (data.data && typeof data.data === "object" && !Array.isArray(data.data)) {
      return data.data;
    }

    return data;
  }

  return null;
}

function StarterPage({ navigateTo }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const [submitError, setSubmitError] = useState("");
  const [blueprintResponse, setBlueprintResponse] = useState(null);

  const isLoading = status === "loading";
  const hasResult = status === "success";
  const hasError = status === "error";

  const pageSubtitle = useMemo(
    () => "Turn your idea into a clear business starter plan in minutes.",
    []
  );

  const handleChange = (field, value) => {
    setValues((current) => {
      if (field === "proposedBusinessName") {
        const previousSuggestion = String(current.proposedBusinessName || "")
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, "")
          .replace(/\s+/g, "");
        const nextSuggestion = String(value || "")
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, "")
          .replace(/\s+/g, "");
        const previousSuggestedDomain = previousSuggestion ? `${previousSuggestion}.com` : "";
        const nextSuggestedDomain = nextSuggestion ? `${nextSuggestion}.com` : "";
        const shouldSyncDomain =
          !String(current.domainToCheck || "").trim() || current.domainToCheck === previousSuggestedDomain;

        return {
          ...current,
          proposedBusinessName: value,
          domainToCheck: shouldSyncDomain ? nextSuggestedDomain : current.domainToCheck,
          domainSearchAttempted: "",
        };
      }

      if (field === "domainToCheck") {
        return {
          ...current,
          domainToCheck: value,
          domainSearchAttempted: "",
        };
      }

      return { ...current, [field]: value };
    });
    setErrors((current) => ({ ...current, [field]: "" }));
    setSubmitError("");
    if (status === "error") {
      setStatus("idle");
    }
  };

  const submitBlueprint = async () => {
    const nextErrors = validate(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setStatus("loading");
    setSubmitError("");

    try {
      const response = await generateStarterBlueprint(values);
      console.log("Starter blueprint response:", response);

      const resolvedBlueprint = resolveBlueprint(response);
      setBlueprintResponse(response);

      if (!resolvedBlueprint) {
        setSubmitError(
          "Your blueprint was generated with missing sections. Showing available details below."
        );
      }

      setStatus("success");
    } catch (error) {
      setSubmitError(error.message || "We could not build your Starter Business Blueprint right now.");
      setStatus("error");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await submitBlueprint();
  };

  const handleStartAnother = () => {
    setValues(initialValues);
    setErrors({});
    setStatus("idle");
    setSubmitError("");
    setBlueprintResponse(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="starter-page">
      <header className="starter-page__header">
        <div className="starter-page__nav">
          <button className="starter-page__brand" onClick={() => navigateTo("/")}>
            PEN2PRO
          </button>
          <div className="starter-page__nav-links">
            <button onClick={() => navigateTo("/#pricing")}>Pricing</button>
            <button onClick={() => navigateTo("/#waitlist")}>Join Waitlist</button>
          </div>
        </div>
      </header>

      <main className="starter-page__content">
        <section className="starter-page__hero">
          <p className="starter-page__eyebrow">PEN2PRO STARTER</p>
          <h1>Starter — Free Forever</h1>
          <p className="starter-page__subtitle">{pageSubtitle}</p>
          <p className="starter-page__reassurance">
            Get your niche, audience, offer, pricing direction, and first action steps free.
          </p>
        </section>

        {!hasResult && (
          <section className="starter-page__panel">
            <StarterIntakeForm
              values={values}
              errors={errors}
              loading={isLoading}
              onChange={handleChange}
              onSubmit={handleSubmit}
            />

            {isLoading && (
              <div className="starter-state-card starter-state-card--loading">
                <h2>Building your Starter Business Blueprint...</h2>
                <p>
                  PEN2PRO is organizing your inputs into a focused starter plan you can act on.
                </p>
              </div>
            )}

            {hasError && (
              <div className="starter-state-card starter-state-card--error">
                <h2>Generation failed</h2>
                <p>{submitError || "We could not build your Starter Business Blueprint right now."}</p>
                <button className="starter-button starter-button--secondary" onClick={submitBlueprint}>
                  Retry
                </button>
              </div>
            )}
          </section>
        )}

        {hasResult && (
          <>
            {submitError && (
              <div className="starter-state-card starter-state-card--error" role="alert">
                <h2>Some blueprint sections are unavailable</h2>
                <p>{submitError}</p>
              </div>
            )}

            <StarterBlueprintResult
              response={blueprintResponse}
              intakeValues={values}
              onUpgradePro={() => navigateTo("/?goal=upgrade&plan=pro#pricing")}
              onSeeElite={() => navigateTo("/?goal=upgrade&plan=elite#pricing")}
              onStartAnother={handleStartAnother}
            />
          </>
        )}
      </main>
    </div>
  );
}

export default StarterPage;

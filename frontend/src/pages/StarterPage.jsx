import { useEffect, useMemo, useState } from "react";

import StarterIntakeForm from "../components/starter/StarterIntakeForm.jsx";
import StarterBlueprintResult from "../components/starter/StarterBlueprintResult.jsx";
import ProgressSidebar from "../components/starter/StarterWorkflowSidebar.jsx";
import { getChecklistItems, getProgressSummary, getRecommendedNextAction } from "../components/starter/starterWorkflow.js";
import { generateStarterBlueprint } from "../services/api.js";

const DRAFT_KEY = "pen2pro_starter_draft_v2";

const initialValues = {
  tier: "starter",
  accessLevel: "free",
  strategistFocus: "startup",
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
  deliveryPreference: "both",
};

const requiredFields = ["proposedBusinessName", "businessIdea", "businessType", "productOrService", "targetCustomer", "location", "marketLocation", "budget", "startupBudget", "skillLevel", "timeAvailability", "currentStage", "skillsResources", "incomeGoal", "biggestObstacle", "deliveryPreference"];

function validate(values) {
  return requiredFields.reduce((errors, field) => {
    if (!String(values[field] || "").trim()) errors[field] = "This field is required.";
    return errors;
  }, {});
}

function getReadableError(error) {
  if (!error) return "Blueprint generation failed. Please try again.";
  if (typeof error === "string") return error;
  if (error.message) return error.message;
  if (error.detail) return typeof error.detail === "string" ? error.detail : JSON.stringify(error.detail);
  if (error.error) return typeof error.error === "string" ? error.error : JSON.stringify(error.error);

  try {
    return JSON.stringify(error);
  } catch {
    return "Blueprint generation failed. Please try again.";
  }
}

function StarterPage({ navigateTo }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState("");
  const [blueprintResult, setBlueprintResult] = useState("");
  const [hasAttemptedGeneration, setHasAttemptedGeneration] = useState(false);
  const [blueprintResponse, setBlueprintResponse] = useState(null);

  const hasResult = Boolean(blueprintResponse);
  const hasError = Boolean(generationError);

  const pageSubtitle = useMemo(() => "Turn your idea into a clear PEN2PRO business starter plan in minutes.", []);
  const progress = useMemo(() => getProgressSummary(values), [values]);
  const checklistItems = useMemo(() => getChecklistItems(values, values.accessLevel), [values]);
  const nextAction = useMemo(() => getRecommendedNextAction(values, values.accessLevel), [values]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setValues((current) => ({ ...current, ...parsed }));
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...values, completion: progress.completion }));
    } catch {
      // ignore storage errors
    }
  }, [values, progress.completion]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll(".starter-reveal").forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [hasResult]);

  const handleChange = (field, value) => {
    setValues((current) => {
      if (field === "accessLevel") {
        const nextAccess = value;
        return {
          ...current,
          accessLevel: nextAccess,
          strategistFocus: ["pro", "elite"].includes(nextAccess) ? current.strategistFocus || "startup" : "startup",
        };
      }
      if (field === "proposedBusinessName") {
        const previousSuggestion = String(current.proposedBusinessName || "").toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, "");
        const nextSuggestion = String(value || "").toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, "");
        const previousSuggestedDomain = previousSuggestion ? `${previousSuggestion}.com` : "";
        const nextSuggestedDomain = nextSuggestion ? `${nextSuggestion}.com` : "";
        const shouldSyncDomain = !String(current.domainToCheck || "").trim() || current.domainToCheck === previousSuggestedDomain;
        return { ...current, proposedBusinessName: value, domainToCheck: shouldSyncDomain ? nextSuggestedDomain : current.domainToCheck, domainSearchAttempted: "" };
      }
      if (field === "domainToCheck") return { ...current, domainToCheck: value, domainSearchAttempted: "" };
      return { ...current, [field]: value };
    });

    setErrors((current) => ({ ...current, [field]: "" }));
    setGenerationError("");
  };

  const handleGenerateBlueprint = async () => {
    if (isGenerating) return;

    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setHasAttemptedGeneration(true);
    const accessLevel = ["free", "pro", "elite"].includes(values.accessLevel) ? values.accessLevel : "free";
    const strategistFocus = accessLevel === "free" ? "basic" : values.strategistFocus || "startup";
    const payload = {
      businessName: String(values.proposedBusinessName || "").trim() || "your business",
      domain: String(values.domainToCheck || "").trim(),
      suggestedDomain: String(values.proposedBusinessName || "").toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, "") ? `${String(values.proposedBusinessName || "").toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, "")}.com` : "",
      businessIdea: values.businessIdea,
      category: values.businessType,
      productOrService: values.productOrService,
      targetCustomer: values.targetCustomer,
      location: values.location,
      skillLevel: values.skillLevel,
      timeAvailability: values.timeAvailability,
      currentStage: values.currentStage,
      skillsAndResources: values.skillsResources,
      incomeGoal: values.incomeGoal,
      biggestObstacle: values.biggestObstacle,
      urgencyLevel: values.urgencyLevel || "medium",
      deliveryPreference: values.deliveryPreference || "both",
      accessLevel,
      strategistFocus,
      proposedBusinessName: String(values.proposedBusinessName || "").trim() || "your business",
      domainToCheck: String(values.domainToCheck || "").trim(),
      businessType: values.businessType,
      marketLocation: values.marketLocation,
      budget: values.budget,
      startupBudget: values.startupBudget,
      skillsResources: values.skillsResources,
      tier: "starter",
    };

    setIsGenerating(true);
    setGenerationError("");
    setBlueprintResult("");
    setBlueprintResponse(null);

    try {
      const response = await generateStarterBlueprint(payload);
      const blueprintText = response?.blueprint || response?.result || response?.content || response?.output || response?.plan || "";
      const normalizedBlueprint = typeof blueprintText === "object" ? JSON.stringify(blueprintText, null, 2) : blueprintText;
      setBlueprintResult(normalizedBlueprint || "Blueprint generated, but no blueprint text was returned.");
      setBlueprintResponse(response);
    } catch (error) {
      setGenerationError(getReadableError(error));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await handleGenerateBlueprint();
  };

  const handleStartAnother = () => {
    setValues(initialValues);
    setErrors({});
    setIsGenerating(false);
    setGenerationError("");
    setBlueprintResult("");
    setHasAttemptedGeneration(false);
    setBlueprintResponse(null);
    window.localStorage.removeItem(DRAFT_KEY);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSaveDraft = () => {
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...values, completion: progress.completion }));
  };

  const handleClearDraft = () => {
    window.localStorage.removeItem(DRAFT_KEY);
    setValues(initialValues);
  };

  return (
    <div className="starter-page">
      <header className="starter-page__header">
        <div className="starter-page__nav">
          <button className="starter-page__brand" onClick={() => navigateTo("/")}>PEN2PRO</button>
          <div className="starter-page__nav-links">
            <button onClick={() => navigateTo("/#pricing")}>Pricing</button>
            <button onClick={() => navigateTo("/#waitlist")}>Join Waitlist</button>
          </div>
        </div>
      </header>

      <main className="starter-page__content">
        <section className="starter-page__hero starter-reveal">
          <p className="starter-page__eyebrow">PEN2PRO STARTER</p>
          <h1>Starter Blueprint Access</h1>
          <p className="starter-page__subtitle">{pageSubtitle}</p>
          <p className="starter-page__reassurance">Premium guidance, structured execution, and clear upgrade paths from Free Forever to Elite 10M Strategist.</p>
        </section>

        {!hasResult && (
          <section className="starter-workspace starter-reveal">
            <div className="starter-workspace__main starter-page__panel">
              <StarterIntakeForm
                values={values}
                errors={errors}
                loading={isGenerating}
                onChange={handleChange}
                onSubmit={handleSubmit}
                sectionStatuses={progress.sectionStatuses}
                onSaveDraft={handleSaveDraft}
                onClearDraft={handleClearDraft}
              />
              {!hasAttemptedGeneration && !hasResult && !isGenerating && !hasError && (
                <div className="starter-state-card starter-state-card--idle" role="status">
                  <h2>Complete your blueprint intake, then generate your starter plan.</h2>
                </div>
              )}
              {isGenerating && (
                <div className="starter-state-card starter-state-card--loading" role="status" aria-live="polite">
                  <h2>Generating your PEN2PRO Blueprint...</h2>
                  <p>Your request was received. PEN2PRO is analyzing your business idea, offer, target customer, domain, access level, and launch path.</p>
                  <ul className="starter-loading-steps">
                    <li>Reviewing your business details</li>
                    <li>Structuring your offer</li>
                    <li>Building your launch checklist</li>
                    <li>Preparing your blueprint</li>
                  </ul>
                </div>
              )}
              {hasError && !isGenerating && (
                <div className="starter-state-card starter-state-card--error" role="alert">
                  <h2>Generation failed</h2>
                  <p>{generationError || "We could not build your Starter Business Blueprint right now."}</p>
                  <button className="starter-button starter-button--secondary" type="button" onClick={handleGenerateBlueprint} disabled={isGenerating}>Retry</button>
                </div>
              )}
            </div>
            <ProgressSidebar
              values={values}
              progress={progress}
              checklistItems={checklistItems}
              nextAction={nextAction}
              onUpgradePro={() => navigateTo("/?goal=upgrade&plan=pro#pricing")}
              onSeeElite={() => navigateTo("/?goal=upgrade&plan=elite#pricing")}
            />
          </section>
        )}

        {hasResult && (
          <>
            {generationError && <div className="starter-state-card starter-state-card--error" role="alert"><h2>Some blueprint sections are unavailable</h2><p>{generationError}</p></div>}
            <StarterBlueprintResult response={blueprintResponse} blueprintText={blueprintResult} intakeValues={values} onUpgradePro={() => navigateTo("/?goal=upgrade&plan=pro#pricing")} onSeeElite={() => navigateTo("/?goal=upgrade&plan=elite#pricing")} onStartAnother={handleStartAnother} />
          </>
        )}
      </main>
    </div>
  );
}

export default StarterPage;

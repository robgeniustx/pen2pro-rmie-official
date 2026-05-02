import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import StarterIntakeForm from "../components/starter/StarterIntakeForm.jsx";
import StarterBlueprintResult from "../components/starter/StarterBlueprintResult.jsx";
import ProgressSidebar from "../components/starter/StarterWorkflowSidebar.jsx";
import { freeRequiredFields, getChecklistItems, getProgressSummary, getRecommendedNextAction } from "../components/starter/starterWorkflow.js";
import { createFounderCheckout, generateStarterBlueprint } from "../services/api.js";
import { buildLocalStarterBlueprint } from "../components/starter/localStrategistEngine.js";

const DRAFT_KEY = "pen2pro_starter_draft_v2";

const initialValues = {
  tier: "starter",
  accessLevel: "free",
  strategistFocus: "basic",
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

const hasProAccess = false;
const hasEliteAccess = false;
const ALLOWED_TEST_TIERS = ["free", "pro", "elite", "founder"];
const TIER_CONFIG = {
  free: {
    label: "Free Starter Blueprint",
    badge: "Free",
    headline: "Build your first business roadmap for free.",
    subheadline: "Get a simple PEN2PRO roadmap to clarify your idea and next steps.",
    maxSections: 6,
    outputDepth: "basic",
    ctaText: "Upgrade to Pro for a deeper business plan",
    ctaLink: "/pricing",
    generateButtonText: "Generate Free Blueprint",
    lockedSections: ["Sales Script", "Monetization Plan", "30-Day Launch Plan", "Automation Plan"],
  },
  pro: {
    label: "Pro Business Blueprint",
    badge: "Pro",
    headline: "Build a deeper business plan with PEN2PRO Pro.",
    subheadline: "Get pricing, positioning, customer targeting, and launch strategy.",
    maxSections: 12,
    outputDepth: "detailed",
    ctaText: "Upgrade to Elite for execution strategy",
    ctaLink: "/pricing",
    generateButtonText: "Generate Pro Blueprint",
    lockedSections: ["Advanced Automation Plan", "90-Day Execution Plan", "Investor-Ready Snapshot"],
  },
  elite: {
    label: "Elite Execution Blueprint",
    badge: "Elite",
    headline: "Build an advanced execution plan with PEN2PRO Elite.",
    subheadline: "Get a high-level business strategy, sales funnel, launch system, and founder roadmap.",
    maxSections: 20,
    outputDepth: "advanced",
    ctaText: "Go to Dashboard",
    ctaLink: "/dashboard",
    generateButtonText: "Generate Elite Execution Plan",
    lockedSections: [],
  },
  founder: {
    label: "Founder Lifetime Blueprint",
    badge: "Founder",
    headline: "Build with full lifetime PEN2PRO access.",
    subheadline: "Get every available strategist section and future-ready execution plan.",
    maxSections: 25,
    outputDepth: "founder",
    ctaText: "Go to Dashboard",
    ctaLink: "/dashboard",
    generateButtonText: "Generate Founder Lifetime Blueprint",
    lockedSections: [],
  },
};

// DEV/TESTING ONLY: URL tier override allows testing tier outputs before Stripe gating is finalized.
// Remove or protect this before production launch.

function getTestTierFromQuery() {
  if (typeof window === "undefined") return "free";
  const params = new URLSearchParams(window.location.search);
  const rawTier = params.get("tier") || "free";
  const testTier = ALLOWED_TEST_TIERS.includes(rawTier.toLowerCase()) ? rawTier.toLowerCase() : "free";
  return testTier;
}

function getValidationErrorForAccessLevel(values, accessLevel) {
  if (accessLevel === "free") {
    if (!String(values.proposedBusinessName || "").trim()) return "Please enter your business name before generating your blueprint.";
    if (!String(values.businessIdea || "").trim()) return "Please describe the business idea before generating your blueprint.";
    if (!String(values.productOrService || "").trim()) return "Please enter the product or service you plan to sell.";
    if (!String(values.targetCustomer || "").trim()) return "Please identify your target customer.";
    return "";
  }
  return "Upgrade required. Choose a paid plan to unlock this strategist blueprint.";
}

function getFieldErrors(values, accessLevel) {
  if (accessLevel !== "free") return {};
  return freeRequiredFields.reduce((errors, field) => {
    if (!String(values[field] || "").trim()) errors[field] = "This field is required.";
    return errors;
  }, {});
}

function StarterPage({ navigateTo }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState("");
  const [hasAttemptedGeneration, setHasAttemptedGeneration] = useState(false);
  const [blueprintResponse, setBlueprintResponse] = useState(null);
  const [testTier, setTestTier] = useState(() => getTestTierFromQuery());
  const isTierTestMode = typeof window !== "undefined" && new URLSearchParams(window.location.search).has("tier");
  const resultPanelRef = useRef(null);

  const hasResult = Boolean(blueprintResponse);
  const hasError = Boolean(generationError);
  const tierConfig = TIER_CONFIG[testTier] || TIER_CONFIG.free;
  const hasPaidTierAccess = useMemo(() => (values.accessLevel === "pro" && hasProAccess) || (values.accessLevel === "elite" && hasEliteAccess), [values.accessLevel]);
  const progress = useMemo(() => getProgressSummary(values, { hasPaidTierAccess }), [hasPaidTierAccess, values]);
  const checklistItems = useMemo(() => getChecklistItems(values, values.accessLevel, { hasPaidTierAccess }), [hasPaidTierAccess, values]);
  const nextAction = useMemo(() => getRecommendedNextAction(values, values.accessLevel, { hasPaidTierAccess }), [hasPaidTierAccess, values]);
  const freeRequiredComplete = useMemo(() => freeRequiredFields.every((field) => String(values[field] || "").trim()), [values]);

  const handlePricingRedirect = useCallback(() => navigateTo("/pricing"), [navigateTo]);

  const handleEliteUpgrade = async () => {
    try {
      const checkoutData = await createFounderCheckout("elite");
      if (checkoutData?.checkoutUrl) {
        window.location.href = checkoutData.checkoutUrl;
        return;
      }
      if (checkoutData?.url) {
        window.location.href = checkoutData.url;
        return;
      }
    } catch {
      // Fallback to pricing route when Stripe checkout is unavailable.
    }
    handlePricingRedirect();
  };

  const handleAccessLevelChange = (nextAccessLevel) => {
    if (!isTierTestMode && nextAccessLevel === "pro" && !hasProAccess) {
      handlePricingRedirect();
      return;
    }

    if (!isTierTestMode && nextAccessLevel === "elite" && !hasEliteAccess) {
      handlePricingRedirect();
      return;
    }

    setValues((current) => ({
      ...current,
      accessLevel: nextAccessLevel,
      strategistFocus: nextAccessLevel === "free" ? "basic" : current.strategistFocus || "startup",
    }));
  };

  useEffect(() => {
    setTestTier(getTestTierFromQuery());
    const handlePopState = () => setTestTier(getTestTierFromQuery());
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);
  useEffect(() => {
    setValues((current) => ({ ...current, accessLevel: testTier === "founder" ? "elite" : testTier }));
    console.log("Starter tier:", testTier);
    console.log("Starter config:", TIER_CONFIG[testTier] || TIER_CONFIG.free);
  }, [testTier]);

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

  useEffect(() => {
    if (!isTierTestMode && ((values.accessLevel === "pro" && !hasProAccess) || (values.accessLevel === "elite" && !hasEliteAccess))) {
      handlePricingRedirect();
    }
  }, [isTierTestMode, values.accessLevel, handlePricingRedirect]);

  const handleChange = (field, value) => {
    if (field === "accessLevel") {
      handleAccessLevelChange(value);
      setErrors((current) => ({ ...current, [field]: "" }));
      setGenerationError("");
      return;
    }

    setValues((current) => {
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

  const handleGenerateBlueprint = async (event) => {
    if (event?.preventDefault) event.preventDefault();
    if (isGenerating) return;

    setHasAttemptedGeneration(true);
    setGenerationError("");

    const normalizedAccessLevel = values.accessLevel || "free";
    if (!isTierTestMode && normalizedAccessLevel === "pro" && !hasProAccess) {
      handlePricingRedirect();
      return;
    }

    if (!isTierTestMode && normalizedAccessLevel === "elite" && !hasEliteAccess) {
      handlePricingRedirect();
      return;
    }

    const nextErrors = getFieldErrors(values, normalizedAccessLevel);
    setErrors(nextErrors);
    const validationError = getValidationErrorForAccessLevel(values, normalizedAccessLevel);
    if (validationError || Object.keys(nextErrors).length > 0) {
      setGenerationError(validationError || "Please complete the required fields before generating your blueprint.");
      resultPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

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
      accessLevel: testTier === "founder" ? "elite" : testTier,
      strategistFocus: testTier === "free" ? "basic" : "startup",
      proposedBusinessName: String(values.proposedBusinessName || "").trim() || "your business",
      domainToCheck: String(values.domainToCheck || "").trim(),
      businessType: values.businessType,
      marketLocation: values.marketLocation,
      budget: values.budget,
      startupBudget: values.startupBudget,
      skillsResources: values.skillsResources,
      tier: testTier,
      userTier: testTier,
      outputDepth: tierConfig.outputDepth,
    };

    console.log("Submitting PEN2PRO blueprint with tier:", testTier);
    console.info("PEN2PRO starter form submission:", payload);

    setIsGenerating(true);
    setGenerationError("");
    setBlueprintResponse(null);


    try {
      const response = await generateStarterBlueprint(payload);
      console.info("PEN2PRO starter API response:", response);
      if (!response?.blueprint) {
        throw new Error("Starter API returned without blueprint payload.");
      }
      if (response?.source === "local-fallback") {
        setGenerationError("Live strategist service is temporarily unavailable. PEN2PRO generated your blueprint with local premium strategy mode.");
      }
      setBlueprintResponse(response);
    } catch (error) {
      console.error("PEN2PRO starter generation failed, using local strategist engine:", error);
      const fallbackBlueprint = buildLocalStarterBlueprint(payload);
      setBlueprintResponse({
        success: true,
        source: "local-fallback",
        blueprint: fallbackBlueprint,
      });
      setGenerationError("Live strategist is temporarily unavailable. PEN2PRO generated your blueprint using the local strategy engine.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (event) => {
    await handleGenerateBlueprint(event);
  };

  const handleStartAnother = () => {
    setValues(initialValues);
    setErrors({});
    setIsGenerating(false);
    setGenerationError("");
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

  const emptyStateMessage = useMemo(() => {
    const accessLevel = values.accessLevel || "free";
    if ((accessLevel === "pro" && !hasProAccess) || (accessLevel === "elite" && !hasEliteAccess)) {
      return "Upgrade required. Choose a paid plan to unlock this strategist blueprint.";
    }
    if (freeRequiredComplete) return "Your Free Forever blueprint is ready to generate.";
    return "Complete the required fields to generate your Free Forever starter blueprint.";
  }, [freeRequiredComplete, values.accessLevel]);

  return (
    <div className="starter-page">
      <header className="starter-page__header">
        <div className="starter-page__nav">
          <button className="starter-page__brand" onClick={() => navigateTo("/")}>PEN2PRO</button>
          <div className="starter-page__nav-links">
            <button onClick={() => navigateTo("/pricing")}>Pricing</button>
            <button onClick={() => navigateTo("/#waitlist")}>Join Waitlist</button>
          </div>
        </div>
      </header>

      <main className="starter-page__content">
        <section className="starter-page__hero starter-reveal">
          <p className="starter-page__eyebrow">PEN2PRO STARTER · {tierConfig.badge}</p>
          <h1>{tierConfig.headline}</h1>
          <p className="starter-page__subtitle">{tierConfig.subheadline}</p>
          <p><strong>Current Plan:</strong> {tierConfig.badge}</p>
          <p className="starter-page__reassurance">Premium guidance, structured execution, and clear upgrade paths from Free Forever to Elite 10M Strategist.</p>
          <div className="starter-page__hero-stats">
            <span>✅ Structured output blocks</span>
            <span>⚡ 30/90/365-day planning</span>
            <span>📱 Mobile-ready intake</span>
          </div>
        </section>

        {!hasResult && (
          <section className="starter-workspace starter-reveal">
            <div className="starter-workspace__main starter-page__panel">
              <div className="text-sm font-semibold">Current Plan: {tierConfig.badge}</div>
              <StarterIntakeForm
                values={values}
                errors={errors}
                loading={isGenerating}
                onChange={handleChange}
                onSubmit={handleSubmit}
                sectionStatuses={progress.sectionStatuses}
                onSaveDraft={handleSaveDraft}
                onClearDraft={handleClearDraft}
                hasProAccess={hasProAccess}
                hasEliteAccess={hasEliteAccess}
                generateButtonText={tierConfig.generateButtonText}
              />
              <div ref={resultPanelRef} />
              {!hasAttemptedGeneration && !hasResult && !isGenerating && !hasError && (
                <div className="starter-state-card starter-state-card--idle" role="status">
                  <h2>{emptyStateMessage}</h2>
                </div>
              )}
              {isGenerating && (
                <div className="starter-state-card starter-state-card--loading" role="status" aria-live="polite">
                  <h2>Building your PEN2PRO strategist blueprint…</h2>
                  <p>Your request was received. PEN2PRO is analyzing your business idea, offer, target customer, domain, access level, and launch path.</p>
                  <ul className="starter-loading-steps">
                    <li>✅ Reviewing your business details</li>
                    <li>⏳ Structuring your premium offer</li>
                    <li>⏳ Building your launch and growth plans</li>
                    <li>⏳ Finalizing your strategist blueprint</li>
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
              onUpgradePro={handlePricingRedirect}
              onSeeElite={handleEliteUpgrade}
            />
          </section>
        )}

        {hasResult && (
          <>
            {generationError && <div className="starter-state-card starter-state-card--error" role="alert"><h2>Some blueprint sections are unavailable</h2><p>{generationError}</p></div>}
            <div className="starter-state-card starter-state-card--idle" role="status">
              <p><strong>Testing Tier:</strong> {String(blueprintResponse?.tier || testTier || "free").toUpperCase()}</p>
              {blueprintResponse?.model ? <p><strong>Testing Model:</strong> {blueprintResponse.model}</p> : null}
            </div>
            <StarterBlueprintResult response={blueprintResponse} intakeValues={values} tier={testTier} tierConfig={tierConfig} onUpgradePro={() => navigateTo("/pricing")} onSeeElite={handleEliteUpgrade} onStartAnother={handleStartAnother} />
          </>
        )}
      </main>
    </div>
  );
}

export default StarterPage;

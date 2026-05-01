const isFilled = (value) => String(value || "").trim().length > 0;

export const freeRequiredFields = ["proposedBusinessName", "businessIdea", "productOrService", "targetCustomer"];
export const freeOptionalFields = ["domainToCheck", "businessType", "location", "skillLevel", "timeAvailability", "currentStage", "skillsResources", "incomeGoal", "biggestObstacle", "urgencyLevel", "deliveryPreference"];

export const sectionDefinitions = [
  {
    key: "businessIdentity",
    stepLabel: "Step 1",
    title: "Business Identity",
    helper: "Lock in your business foundation so your blueprint has clear context.",
    fields: ["proposedBusinessName", "domainToCheck", "businessType", "location", "marketLocation"],
  },
  {
    key: "offerDetails",
    stepLabel: "Step 2",
    title: "Offer Details",
    helper: "Define what you sell, who you serve, and how you'll deliver it.",
    fields: ["businessIdea", "productOrService", "targetCustomer", "deliveryPreference"],
  },
  {
    key: "founderReadiness",
    stepLabel: "Step 3",
    title: "Founder Readiness",
    helper: "Assess skills, stage, and available capacity for execution.",
    fields: ["skillLevel", "currentStage", "skillsResources", "timeAvailability"],
  },
  {
    key: "goalsAndConstraints",
    stepLabel: "Step 4",
    title: "Goals and Constraints",
    helper: "Share your goals, urgency, and the bottleneck to solve first.",
    fields: ["incomeGoal", "biggestObstacle", "urgencyLevel"],
  },
  {
    key: "blueprintAccess",
    stepLabel: "Step 5",
    title: "Blueprint Access",
    helper: "Choose your plan access and strategist depth.",
    fields: ["accessLevel", "strategistFocus"],
  },
];

const freeProgressChecks = [...freeRequiredFields, ...freeOptionalFields];
const paidProgressChecks = [...freeProgressChecks, "strategistFocus"];

export function getCompletionPercentage(values, { hasPaidTierAccess = false } = {}) {
  const checks = hasPaidTierAccess ? paidProgressChecks : freeProgressChecks;
  const completed = checks.filter((field) => isFilled(values[field])).length;
  return Math.min(100, Math.round((completed / checks.length) * 100));
}

export function getSectionStatus(sectionName, values) {
  const section = sectionDefinitions.find((entry) => entry.key === sectionName);
  if (!section) return "Not started";

  const relevantFields = section.fields.filter((field) => field !== "strategistFocus" || ["pro", "elite"].includes(values.accessLevel));
  const completed = relevantFields.filter((field) => isFilled(values[field])).length;

  if (completed === 0) return "Not started";
  if (completed === relevantFields.length) return "Complete";
  return "In progress";
}

export function getChecklistItems(formState, accessLevel, { hasPaidTierAccess = false } = {}) {
  const isPaidTier = ["pro", "elite"].includes(accessLevel) && hasPaidTierAccess;

  return [
    { key: "businessName", label: "Business name confirmed", state: isFilled(formState.proposedBusinessName) ? "complete" : "incomplete" },
    { key: "domain", label: "Domain entered", state: isFilled(formState.domainToCheck) ? "complete" : "incomplete" },
    { key: "businessIdea", label: "Business idea described", state: isFilled(formState.businessIdea) ? "complete" : "incomplete" },
    { key: "offer", label: "Product or service identified", state: isFilled(formState.productOrService) ? "complete" : "incomplete" },
    { key: "customer", label: "Target customer defined", state: isFilled(formState.targetCustomer) ? "complete" : "incomplete" },
    { key: "skills", label: "Skill level selected", state: isFilled(formState.skillLevel) ? "complete" : "incomplete" },
    { key: "income", label: "Income goal added", state: isFilled(formState.incomeGoal) ? "complete" : "incomplete" },
    { key: "obstacle", label: "Biggest obstacle added", state: isFilled(formState.biggestObstacle) ? "complete" : "incomplete" },
    { key: "access", label: "Access level selected", state: isFilled(formState.accessLevel) ? "complete" : "incomplete" },
    {
      key: "focus",
      label: !isPaidTier ? "Strategist focus locked on Free Forever" : "Strategist focus selected",
      state: !isPaidTier ? "locked" : isFilled(formState.strategistFocus) ? "complete" : "incomplete",
    },
  ];
}

export function getRecommendedNextAction(formState, accessLevel, { hasPaidTierAccess = false } = {}) {
  const checklist = getChecklistItems(formState, accessLevel, { hasPaidTierAccess });
  const firstIncomplete = checklist.find((item) => item.state === "incomplete");
  if (firstIncomplete) return `Next: ${firstIncomplete.label}.`;
  if (accessLevel === "free") return "Unlock the Strategist Level: Upgrade to Pro to continue with outreach, content, launch planning, CRM, follow-up, and customer acquisition.";
  return "Generate your blueprint now — your core inputs are complete.";
}

export function getProgressSummary(values, { hasPaidTierAccess = false } = {}) {
  const completion = getCompletionPercentage(values, { hasPaidTierAccess });
  const sectionStatuses = sectionDefinitions.map((section) => ({
    ...section,
    status: getSectionStatus(section.key, values),
  }));
  const completedSections = sectionStatuses.filter((section) => section.status === "Complete").length;
  const currentStep = sectionStatuses.find((section) => section.status !== "Complete")?.title || "Ready to Generate";

  return {
    completion,
    sectionStatuses,
    completedSections,
    totalSections: sectionDefinitions.length,
    currentStep,
  };
}

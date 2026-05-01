function safe(value, fallback = "Not provided") {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function lowBudget(budget) {
  const text = safe(budget, "").toLowerCase();
  return ["0", "low", "tight", "lean", "bootstrap", "under"].some((token) => text.includes(token));
}

export function buildLocalStarterBlueprint(payload = {}) {
  const businessName = safe(payload.proposedBusinessName || payload.businessName, "Your Business");
  const businessIdea = safe(payload.businessIdea, "A practical founder-led business offer");
  const targetCustomer = safe(payload.targetCustomer, "Local and online buyers");
  const location = safe(payload.location || payload.marketLocation, "your market");
  const productOrService = safe(payload.productOrService, "a scoped starter offer");
  const startupBudget = safe(payload.startupBudget || payload.budget, "lean budget");
  const currentStage = safe(payload.currentStage, "idea");
  const domain = safe(payload.domainToCheck || payload.domain, `${businessName.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`);

  const launchPrice = lowBudget(startupBudget) ? "$99-$299" : "$300-$900";

  return {
    business_snapshot: {
      business_name: businessName,
      business_idea: businessIdea,
      target_customer: targetCustomer,
      market_location: location,
      current_stage: currentStage,
      startup_budget: startupBudget,
      domain,
    },
    startup_requirements: [
      { task: `Finalize the ${businessName} core offer and one-line promise`, priority: "High" },
      { task: "Set up a simple booking and payment flow", priority: "High" },
      { task: `Run 10 direct outreach conversations with ${targetCustomer}`, priority: "High" },
    ],
    licenses_and_compliance: [
      { note: "Verify state and local registration and licensing requirements before first paid delivery." },
      { note: "Open dedicated business banking and maintain clean bookkeeping from day one." },
    ],
    tools_and_software: [
      { tool: "CRM (HubSpot Free/Pipedrive)", purpose: "Track lead pipeline and follow-up" },
      { tool: "Stripe or Square", purpose: "Collect deposits and invoices" },
      { tool: "Calendar + intake form", purpose: "Pre-qualify and schedule calls" },
    ],
    pricing_strategy: {
      direction: `Launch with a ${launchPrice} paid pilot, then increase pricing after 2-3 proof-backed wins.`,
      model: "Starter / Standard / Premium with fixed scope and outcomes",
    },
    launch_plan_30_days: {
      week_1: `Define ${businessName}'s offer stack, sales script, and qualification criteria.`,
      week_2: `Book and run discovery calls with ${targetCustomer}.`,
      week_3: "Close 1-2 paid pilots and deliver fast measurable wins.",
      week_4: "Collect testimonials and repeat the highest-performing channel.",
    },
    operations_plan_90_days: {
      focus_areas: [
        "Systemize onboarding and delivery checklist",
        "Create weekly KPI review for leads, calls, closes, and cash",
        "Delegate admin tasks to protect founder sales time",
      ],
    },
    scale_plan_12_months: {
      milestones: [
        "Build one predictable lead channel and one referral channel",
        "Raise prices after consistent outcomes",
        "Document SOPs before adding team capacity",
      ],
    },
    risk_flags: [
      "Overbuilding brand assets before first paying customers.",
      "Selling broad outcomes without a fixed-scope first offer.",
      "Ignoring follow-up cadence after discovery calls.",
    ],
    sources: [
      { name: "SBA business guide", url: "https://www.sba.gov/business-guide" },
      { name: "IRS EIN guide", url: "https://www.irs.gov/businesses/small-businesses-self-employed/employer-id-numbers" },
    ],
    upgrade_recommendation: {
      recommended_tier: "Elite",
      why_now: `Upgrade when ${businessName} needs deeper channel optimization and scaling systems.`,
      what_unlocks_next: [
        "Advanced conversion strategy",
        "Elite 10M roadmap sequencing",
        "Execution accountability loops",
      ],
    },
  };
}

function text(value, fallback = "Not provided") {
  const normalized = String(value ?? "").trim();
  return normalized || fallback;
}

function cleanName(name) {
  const value = text(name, "Your Business");
  return value.toLowerCase() === "pen2pro" ? "Your Business" : value;
}

function list(items) {
  return items.filter(Boolean);
}

export function buildLocalStarterBlueprint(payload = {}) {
  const businessName = cleanName(payload.proposedBusinessName || payload.businessName);
  const businessIdea = text(payload.businessIdea);
  const targetCustomer = text(payload.targetCustomer);
  const location = text(payload.location || payload.marketLocation, "Your local market");
  const startupBudget = text(payload.startupBudget || payload.budget, "$500-$2,000");
  const stage = text(payload.currentStage, "Idea stage");
  const productOrService = text(payload.productOrService);

  return {
    business_snapshot: {
      business_name: businessName,
      business_summary: `${businessName} helps ${targetCustomer} by delivering ${productOrService} in ${location}.`,
      stage,
      startup_budget: startupBudget,
    },
    startup_requirements: [
      { task: `Secure ${businessName} business registration and EIN`, priority: "High" },
      { task: "Set up a one-page offer and booking funnel", priority: "High" },
      { task: "Run 10 customer discovery calls", priority: "High" },
    ],
    licenses_and_compliance: [
      { note: `Check city/state licensing requirements in ${location}` },
      { note: "Create basic client agreement, terms, and privacy policy" },
    ],
    tools_and_software: [
      { tool: "CRM (HubSpot Free)", purpose: "Track leads and follow-up" },
      { tool: "Stripe", purpose: "Payments and invoices" },
      { tool: "Canva + Notion", purpose: "Brand assets and SOPs" },
    ],
    pricing_strategy: {
      direction: `Launch ${businessName} with a 3-tier package anchored around clear outcomes and fast wins.`,
      offer_floor: "Entry offer: $149-$499",
      core_offer: "Main offer: $500-$2,500",
      premium_offer: "Premium offer: $2,500+",
    },
    launch_plan_30_days: {
      week_1: `Finalize ${businessName} positioning, first offer, and target ICP list of 50 prospects.`,
      weeks_2_4: "Run outbound + referral sprint, close 1-3 pilot customers, collect testimonials.",
    },
    operations_plan_90_days: {
      focus: "Build repeatable delivery SOPs, pipeline review rhythm, and weekly KPI dashboard.",
    },
    scale_plan_12_months: {
      focus: "Add one repeatable acquisition channel, one referral channel, and delegate non-sales operations.",
    },
    risk_flags: [
      "Underpricing offers without a clear scope and outcome.",
      "Trying to scale before proving repeatable conversions.",
      "Ignoring fulfillment capacity while increasing acquisition.",
    ],
    sources: [
      { name: "SBA Business Guide", url: "https://www.sba.gov/business-guide" },
      { name: "IRS EIN", url: "https://www.irs.gov/businesses/small-businesses-self-employed/employer-id-numbers" },
    ],
    premium_sections: {
      executive_snapshot: `${businessName} is positioned as a focused offer-first business for ${targetCustomer} in ${location}.`,
      business_name_usage: `Use ${businessName} consistently in website headers, invoices, social handles, and sales scripts for trust consistency.`,
      market_positioning: `${businessName} should position against slow generic competitors by promising speed, clarity, and measurable outcomes.`,
      ideal_customer_profile: `${targetCustomer} with urgent pain, buying authority, and budget to act in the next 30 days.`,
      first_offer: `Launch a fixed-scope ${productOrService} starter package with a 7-14 day delivery timeline.`,
      revenue_model: "Primary: service/package revenue. Secondary: retainers and upsells after proof.",
      pricing_strategy: `Anchor ${businessName} pricing with three tiers and outcome-based naming to avoid commodity pricing.`,
      launch_plan_30_days: list([
        "Week 1: Positioning, offer packaging, booking funnel setup.",
        "Week 2: 20 direct outreaches + 5 discovery calls.",
        "Week 3: Close pilots, deliver quick wins, collect proof.",
        "Week 4: Raise pricing 10-15% with testimonial assets.",
      ]),
      growth_plan_90_days: list([
        "Productize delivery into repeatable SOPs.",
        "Launch referral loop and one content channel.",
        "Install CRM pipeline reviews and weekly KPI check-ins.",
      ]),
      brand_identity_direction: `${businessName} brand voice: confident, practical, and founder-friendly. Design direction: clean premium with trust cues and proof assets.`,
      operations_checklist: list([
        "Business registration + banking complete.",
        "CRM + calendar + payment stack live.",
        "Offer SOP and onboarding checklist documented.",
      ]),
      lead_generation_strategy: "Prioritize founder-led outbound, warm referrals, and short-form educational content tied to one CTA.",
      sales_script: `"Hi, I'm from ${businessName}. We help ${targetCustomer} achieve [specific outcome] in [timeframe]. Can I ask 3 questions to see if this fits your goals?"`,
      content_strategy: "Publish 3 weekly assets: one proof post, one educational post, one objection-handling post.",
      tools_needed: list(["HubSpot", "Stripe", "Canva", "Notion", "Google Workspace"]),
      risk_warnings: "Avoid custom one-off fulfillment for every client; force standardization early.",
      next_best_actions: list([
        `Finalize ${businessName} starter offer today.`,
        "Build booking page and payment link.",
        "Book first 5 discovery calls this week.",
      ]),
      upgrade_cta: "Unlock Full Strategy",
    },
  };
}

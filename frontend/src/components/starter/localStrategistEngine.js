function text(value, fallback) {
  const normalized = String(value ?? "").trim();
  return normalized || fallback;
}

export function buildLocalStarterBlueprint(payload = {}) {
  const businessName = text(payload.proposedBusinessName || payload.businessName, "Your Business");
  const idea = text(payload.businessIdea, "A practical service solving an urgent business problem");
  const customer = text(payload.targetCustomer, "Busy professionals and local business owners");
  const offer = text(payload.productOrService, "Done-for-you launch support");
  const location = text(payload.location || payload.marketLocation, "Online + local market");
  const domainBase = businessName.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 24) || "founderlaunch";
  const domain = text(payload.domainToCheck || payload.domain, `${domainBase}.com`);

  return {
    executive_business_snapshot: { what_to_do: `Launch ${businessName} with one paid offer tied to a measurable customer result.`, why_it_matters: "Focused execution creates faster revenue proof and confidence.", execution_order: ["Define one outcome", "Package offer", "Sell pilot", "Deliver + capture proof"] },
    business_type_classification: { primary_model: "Service-led startup", go_to_market: "Outreach + proof content + referrals" },
    founder_readiness_level: { level: "Beginner-ready", support_note: "Built for founders with no prior business education.", first_skill_to_build: "Confident sales conversations" },
    customer_problem_breakdown: { core_problem: `${customer} are struggling to solve ${idea} reliably.`, cost_of_inaction: "Lost time, lost revenue, and delayed growth.", problem_signals: ["No repeatable workflow", "Inconsistent lead flow", "Unclear next steps"] },
    target_customer_profile: { ideal_buyer: customer, buying_trigger: "They need a practical result fast.", where_to_reach: ["LinkedIn", "Local communities", "Referral partners"] },
    market_positioning: { positioning_statement: `${businessName} is the beginner-friendly execution partner for ${customer}.`, differentiators: ["Simple action order", "Fast time-to-value", "Founder-friendly language"] },
    core_promise: `Deliver a visible progress win in 14 days with ${offer}.`,
    first_paid_offer: { offer_name: "14-Day Launch Sprint", deliverables: ["Audit", "Action plan", "Hands-on setup", "Review"], starter_price_range: "$149-$499" },
    pricing_ladder: { free: "Mini audit/checklist", pro: "Implementation sprint", elite: "Ongoing optimization advisory" },
    revenue_model: { primary: "Paid implementation", recurring: "Monthly support retainers", expansion: "Upsells and partner referrals" },
    business_name_strategy: { rules: ["Use 2-3 clear words", "Make it easy to spell", "Tie to customer outcome"], example: businessName },
    domain_strategy: { primary_domain: domain, alternatives: [`${domainBase}hq.com`, `join${domainBase}.com`], screening_rules: ["Easy to pronounce", "No hyphens", "No awkward spelling"] },
    legal_setup_roadmap: [{ step: 1, action: "Choose entity structure", why: "Liability and tax setup" }, { step: 2, action: "Apply for EIN", why: "Required for bank and payments" }, { step: 3, action: "Check local/state licenses", why: "Avoid delays and fines" }],
    business_banking_setup: { order: ["Open business checking", "Separate business expenses", "Track weekly cashflow"] },
    payment_processing_setup: { providers: ["Stripe", "Square"], setup_order: ["Create account", "Connect bank", "Create payment links", "Test checkout"] },
    website_landing_page_plan: { sections: ["Problem", "Promise", "Offer", "Proof", "CTA"], cta: "Book strategy call" },
    google_business_profile_setup: { relevant_when: "Local or hybrid business", steps: ["Claim listing", "Add services", "Add photos", "Request first reviews"] },
    apple_maps_apple_business_connect_setup: { relevant_when: "Local or hybrid business", steps: ["Create account", "Verify business", "Publish details"] },
    social_media_setup: { priority_channels: ["LinkedIn", "Instagram", "YouTube Shorts/TikTok"], setup_order: ["Brand bio", "Pinned offer post", "Proof content loop"] },
    sales_script: { script: "You shared [pain]. We solve that by [offer]. In 14 days you get [result]. Want the pilot this week?" },
    outreach_strategy: { daily_activity: "10 targeted messages + 2 follow-ups", weekly_target: "5 discovery calls", sequence: ["Warm network", "Partners", "Direct outbound"] },
    content_strategy: { weekly_plan: ["2 pain-education posts", "1 proof post", "1 CTA post"], goal: "Turn attention into booked calls" },
    launch_plan_30_days: { week_1: "Package offer and script", week_2: "Run outreach and calls", week_3: "Close + deliver pilots", week_4: "Collect testimonials and optimize pricing" },
    operations_plan_90_days: { focus: ["Document SOPs", "Track KPIs weekly", "Install follow-up automation"] },
    scale_plan_12_months: { focus: ["Add referral partners", "Raise pricing with proof", "Delegate repeat tasks"] },
    credit_funding_readiness: { foundation_steps: ["Keep personal and business finances separate", "Maintain on-time payments", "Track monthly profit and cashflow"], documents_to_prepare: ["EIN confirmation", "Business bank statements", "Simple P&L"], starter_guidance: "Use funding after validated demand and delivery consistency." },
    risk_flags: ["Overbuilding before validation", "Underpricing too long", "Ignoring follow-up discipline"],
    beginner_mistakes_to_avoid: ["Launching too many offers at once", "Waiting for perfect branding", "Avoiding direct sales asks"],
    next_7_actions: ["Define one customer outcome", "Finalize offer scope", "Publish landing page", "Set up Stripe or Square", "Claim Google profile", "Set up Apple Business Connect", "Start outreach today"],
    upgrade_cta: { title: "Ready to unlock the full PEN2PRO business buildout?", copy: "This free blueprint gives you the starting map. Elite unlocks deeper execution systems for launch and growth.", offer: "Elite Offer: First month only $99.", button: "Unlock Elite Strategy", route: "/pricing" },
  };
}

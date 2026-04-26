def _clean_text(value: str, fallback: str) -> str:
	cleaned = value.strip()
	return cleaned or fallback


def _compact(value: str) -> str:
	return " ".join(value.split())


def _delivery_model(preference: str) -> str:
	if preference == "online":
		return "online-first delivery with simple digital fulfillment"
	if preference == "local":
		return "local delivery with direct community reach"
	return "a hybrid delivery model that mixes online scale with local trust"


def _pricing_direction(budget: str, delivery_preference: str) -> str:
	budget_lower = budget.lower()
	if "0" in budget_lower or "low" in budget_lower or "tight" in budget_lower:
		return "Start with a low-friction entry offer priced to win quick proof and testimonials."
	if delivery_preference == "local":
		return "Package a premium local starter offer with a clear outcome and fixed scope."
	return "Offer a focused starter package with one core outcome and a simple monthly or project price."


def _build_growth_channels(delivery_preference: str, target_customer: str, market_location: str) -> list[str]:
	if delivery_preference == "local":
		return [
			f"Partnerships with 3 local businesses that already serve {target_customer} in {market_location}.",
			"Direct outreach to warm local referrals with a same-week consultation slot.",
			"Community-led workshops or demos to convert in-person trust into paid pilots.",
		]
	if delivery_preference == "online":
		return [
			f"Niche LinkedIn or creator-led content that names the exact pain point of {target_customer}.",
			"Outbound DM + email cadence with a one-page offer and a clear paid pilot CTA.",
			"Retargeting or remarketing to interested visitors using proof-driven conversion assets.",
		]
	return [
		f"Online outbound cadence to {target_customer} plus local referral loops in {market_location}.",
		"One authority content channel and one direct-response channel running weekly in parallel.",
		"Partner distribution through aligned communities, associations, or ecosystem operators.",
	]


def build_starter_business_blueprint(payload: dict) -> dict:
	business_idea = _clean_text(payload.get("businessIdea", ""), "a practical business concept")
	product_or_service = _clean_text(payload.get("productOrService", ""), "a focused service")
	target_customer = _clean_text(payload.get("targetCustomer", ""), "a clearly defined customer group")
	market_location = _clean_text(payload.get("marketLocation", ""), "your target market")
	startup_budget = _clean_text(payload.get("startupBudget", ""), "a lean startup budget")
	skills_resources = _clean_text(payload.get("skillsResources", ""), "your current skills and available resources")
	income_goal = _clean_text(payload.get("incomeGoal", ""), "your first consistent income milestone")
	biggest_obstacle = _clean_text(payload.get("biggestObstacle", ""), "unclear positioning")
	delivery_preference = payload.get("deliveryPreference", "both")

	delivery_model = _delivery_model(delivery_preference)
	pricing_direction = _pricing_direction(startup_budget, delivery_preference)
	short_goal = _compact(income_goal)
	short_obstacle = _compact(biggest_obstacle)
	short_skills = _compact(skills_resources)
	short_idea = _compact(business_idea)
	short_offer = _compact(product_or_service)
	channels = _build_growth_channels(delivery_preference, target_customer, market_location)

	return {
		"ventureSummary": {
			"businessModel": (
				f"Build {short_idea} as a focused {short_offer} venture for {target_customer} in {market_location}. "
				f"Lead with a paid starter offer that solves one high-urgency outcome, then expand into repeat engagements "
				"or retainers once proof is documented."
			),
			"targetCustomer": (
				f"Primary segment: {target_customer}. Prioritize buyers with active pain, budget authority, and a short decision window. "
				f"Use discovery calls to rank subsegments by urgency, willingness to pay, and ease of delivery in {market_location}."
			),
			"coreOffer": (
				f"Core offer: a scoped {short_offer} package with defined inputs, timeline, and measurable result. "
				"Package it in three tiers (starter, standard, premium) to anchor value while keeping fulfillment predictable."
			),
			"brandPositioning": (
				f"Position PEN2PRO as the no-fluff execution partner for {target_customer}: clear diagnosis, specific action plan, and tracked outcomes. "
				f"Differentiate by combining {short_skills} with fast implementation and transparent milestones."
			),
			"marketOpportunity": (
				f"Market edge in {market_location}: buyers are already spending to solve {short_idea}, but many providers compete on vague promises. "
				"Win by offering tighter scope, faster time-to-value, and strong case-based proof."
			),
			"commonRisksOrMistakes": [
				"Selling broad outcomes without a precise first-result promise.",
				f"Building assets too early instead of validating paid demand against goal: {short_goal}.",
				f"Ignoring constraint '{short_obstacle}' instead of designing a workaround in the operating plan.",
			],
		},
		"starterPlan": {
			"pricingDirection": pricing_direction,
			"top3Actions": [
				"Define a single sentence value proposition with a measurable before/after outcome.",
				"Create a one-page offer with scope, timeline, price anchor, and social proof placeholder.",
				"Run direct outreach to 20 qualified prospects and book at least 5 discovery calls.",
			],
			"first7Days": [
				f"Day 1: Tighten messaging around {short_idea} and draft qualifying questions for {target_customer}.",
				"Day 2: Build a no-code landing page with clear CTA for a paid starter engagement.",
				f"Day 3-4: Conduct 5 problem interviews in {market_location} and refine objections script.",
				"Day 5: Launch first outbound batch (email/DM/referrals) and track replies in a simple CRM.",
				"Day 6-7: Run sales calls, close paid pilot slots, and document objections and win patterns.",
			],
			"thirtyDayActionPlan": [
				"Week 1: Validate messaging, finalize offer terms, and book discovery calls.",
				"Week 2: Close first 1-2 paid clients and deliver fast wins with documented outcomes.",
				"Week 3: Publish first proof assets (testimonial/case snapshot) and double top channel.",
				"Week 4: Standardize delivery checklist, raise price modestly, and target repeatable pipeline.",
			],
			"fastestPathToFirstMoney": (
				f"Sell a fixed-scope paid pilot for {short_offer} before building full systems. "
				"Use direct outreach and referral asks to secure first cash in 7-14 days."
			),
			"strategistInsight": (
				f"With {startup_budget}, spend only on revenue-critical assets: booking page, CRM, and follow-up automation. "
				"Everything else is optional until you hit a repeatable close rate tied to income goal ({short_goal})."
			),
		},
		"proPlan": {
			"days8to30": [
				"Convert discovery feedback into a sharper ICP and objection-handling script.",
				"Introduce a two-call sales flow (diagnostic + close) to increase conversion consistency.",
				"Document delivery SOPs after each client so service quality remains consistent while volume grows.",
			],
			"leadGenerationChannels": channels,
			"salesProcess": [
				"Pre-call qualification form to filter low-fit leads.",
				"Structured discovery call to quantify pain, timeline, and buying criteria.",
				"Same-day proposal with clear scope, milestone-based payment terms, and urgency trigger.",
			],
			"toolsNeeded": [
				"CRM for outreach and follow-up tracking (e.g., HubSpot Free or Pipedrive).",
				"Calendar + intake form for frictionless booking and pre-call qualification.",
				"Proposal/invoicing workflow with e-sign and deposit collection.",
			],
			"weeklyKpis": [
				"Qualified conversations booked",
				"Discovery-to-proposal conversion rate",
				"Proposal-to-paid conversion rate",
				"Average deal value and cash collected",
				"Delivery NPS/testimonial capture rate",
			],
		},
		"elitePlan": {
			"days31to90": [
				"Productize the best-performing offer into repeatable delivery tracks.",
				"Add authority assets (case studies, ROI calculator, webinar/workshop funnel).",
				"Build partner referral pipeline and test one scalable paid acquisition channel.",
			],
			"scalingStrategy": [
				"Move from founder-led selling to a predictable pipeline with channel specialization.",
				"Raise pricing after every 3 successful outcomes to protect margins and brand position.",
				"Use cohort-based or standardized delivery where possible to increase capacity.",
			],
			"systemsToBuild": [
				"Lead scoring and follow-up automation with weekly pipeline reviews.",
				"Client onboarding and delivery SOPs with quality checkpoints.",
				"Weekly business dashboard covering pipeline, conversion, cashflow, and fulfillment.",
			],
			"hiringDelegation": [
				"First delegate: admin + follow-up coordination to protect founder selling time.",
				"Second delegate: fulfillment support for repeatable components of the core offer.",
				"Retain strategic tasks (positioning, pricing, key sales) until process maturity is proven.",
			],
			"highestLeverageGrowthMove": (
				f"Turn your top result for {target_customer} into a flagship case-study engine and partner co-selling motion in {market_location}; "
				"this compounds trust, lead quality, and close rates faster than adding random channels."
			),
		},
		"upgradeHooks": {
			"proReason": (
				f"Upgrade to Pro when you need a repeatable lead engine, tighter sales scripts, and operating cadence built around your constraint ({short_obstacle})."
			),
			"eliteReason": (
				"Upgrade to Elite when demand is proven and your bottleneck shifts from getting clients to scaling delivery, team capacity, and margin control."
			),
		},
	}

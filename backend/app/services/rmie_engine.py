import re


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


def _resolve_business_name(payload: dict) -> str:
	proposed_business_name = _clean_text(payload.get("proposedBusinessName", ""), "")
	return proposed_business_name or "Your Company Name"


def _inject_business_name(value, business_name: str):
	if isinstance(value, str):
		result = re.sub(r"\byour company\b", business_name, value, flags=re.IGNORECASE)
		return re.sub(r"\byour business\b", business_name, result, flags=re.IGNORECASE)
	if isinstance(value, list):
		return [_inject_business_name(item, business_name) for item in value]
	if isinstance(value, dict):
		return {key: _inject_business_name(item, business_name) for key, item in value.items()}
	return value


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


def _is_beginner(skill_level: str, skills_resources: str) -> bool:
	text = f"{skill_level} {skills_resources}".lower()
	return any(keyword in text for keyword in ["beginner", "new", "novice", "no experience"])


def _is_low_budget(budget: str) -> bool:
	text = budget.lower()
	return any(keyword in text for keyword in ["$0", "0", "low", "tight", "lean", "bootstrap", "under 1000"])


def _is_high_urgency(urgency_level: str) -> bool:
	return urgency_level.lower() in {"high", "urgent", "immediate", "asap"}


def _is_local_business(business_type: str, delivery_preference: str) -> bool:
	type_text = business_type.lower()
	return delivery_preference == "local" or "local" in type_text or "brick" in type_text or "service area" in type_text


def _build_strategist_engine(payload: dict) -> dict:
	business_idea = _clean_text(payload.get("businessIdea", ""), "your business offer")
	business_type = _clean_text(payload.get("businessType", ""), "service")
	target_customer = _clean_text(payload.get("targetCustomer", ""), "your ideal customer")
	location = _clean_text(payload.get("location", payload.get("marketLocation", "")), "your local market")
	budget = _clean_text(payload.get("budget", payload.get("startupBudget", "")), "lean budget")
	skill_level = _clean_text(payload.get("skillLevel", ""), "intermediate")
	time_availability = _clean_text(payload.get("timeAvailability", ""), "part-time")
	urgency_level = _clean_text(payload.get("urgencyLevel", ""), "medium")
	current_stage = _clean_text(payload.get("currentStage", ""), "idea")
	access_tier = _clean_text(payload.get("accessTier", "free"), "free").lower()

	beginner = _is_beginner(skill_level, payload.get("skillsResources", ""))
	low_budget = _is_low_budget(budget)
	high_urgency = _is_high_urgency(urgency_level)
	local_business = _is_local_business(business_type, payload.get("deliveryPreference", "both"))

	if high_urgency:
		next_best_move = (
			f"Within 24 hours, message 10 high-fit {target_customer} prospects with a paid pilot offer for {business_idea} and 3 call slots."
		)
	else:
		next_best_move = (
			f"Define one paid starter offer for {business_idea} with fixed scope, a clear result, and a single call-to-action for {target_customer}."
		)

	fast_path_steps = [
		"Define a fixed-scope 'first result' offer that can be delivered in 3-7 days.",
		f"Create a simple one-page offer (problem, outcome, price, proof placeholder) for {target_customer}.",
	]
	if beginner:
		fast_path_steps.append("Use one channel only this week (direct outreach or local referrals), not multiple growth experiments.")
	if local_business:
		fast_path_steps.append(f"Visit or call 5 local partner businesses in {location} and ask for warm introductions.")
	else:
		fast_path_steps.append("Send 20 personalized DMs/emails to ideal buyers with one pain-point-led message and booking link.")
	fast_path_steps.extend(
		[
			"Book 5 discovery calls, diagnose urgency, and close 1-2 paid pilots.",
			"Deliver quickly, collect one testimonial, and reinvest into the same channel until $1K is reached.",
		]
	)

	avoid_list = [
		"Do not spend days on logos, decks, or websites before your first paid customer.",
		"Do not offer broad custom work without fixed scope and price.",
		"Do not chase multiple customer segments at once.",
	]
	if low_budget:
		avoid_list.append("Do not buy tools or subscriptions that are not directly tied to lead generation or getting paid.")
	if beginner:
		avoid_list.append("Do not build complex automations early; use simple checklists and manual follow-up first.")

	execution_plan = [
		{"task": "Finalize first-offer promise + fixed price", "priority": "High", "time_estimate": "45 min"},
		{"task": "Publish one-page offer and booking link", "priority": "High", "time_estimate": "90 min"},
		{"task": "Run outreach/referral batch and follow-up", "priority": "High", "time_estimate": "2-3 hours"},
		{"task": "Run discovery calls and close paid pilot(s)", "priority": "High", "time_estimate": "3-4 hours"},
		{"task": "Deliver first result and request testimonial", "priority": "Medium", "time_estimate": "4-8 hours"},
	]

	insight_parts = [
		f"Given your stage ({current_stage}), the only metric that matters now is first sale velocity.",
		f"With {time_availability} availability and a {budget} budget, focus on one offer + one channel until repeatable closes.",
	]
	if local_business:
		insight_parts.append(f"Your location ({location}) is a growth asset—use local trust loops before paid ads.")
	if high_urgency:
		insight_parts.append("Urgency is high, so compress execution into 7-day sales sprints and optimize for cash this week.")

	advanced_insights = {
		"projection_model": "At a $500 starter offer, 2 sales = $1K. At 30% close rate, target 7 qualified sales calls.",
		"kpi_focus": ["Daily outreach sent", "Calls booked", "Close rate", "Cash collected this week"],
		"scaling_trigger": "Scale only after two consecutive weeks of predictable lead flow and stable delivery quality.",
	}

	result = {
		"label": "AI Strategist Recommendation",
		"input_profile": {
			"businessIdea": business_idea,
			"businessType": business_type,
			"targetCustomer": target_customer,
			"location": location,
			"budget": budget,
			"skillLevel": skill_level,
			"timeAvailability": time_availability,
			"urgencyLevel": urgency_level,
			"currentStage": current_stage,
		},
		"next_best_move": next_best_move,
		"fastest_path_to_first_1k": fast_path_steps,
		"what_to_avoid": avoid_list[:5],
		"execution_plan": execution_plan,
		"strategist_insight": " ".join(insight_parts),
	}

	if access_tier in {"pro", "elite"}:
		result["pro_breakdown"] = {
			"offer_validation_loop": "Run 10 calls, capture objections, revise script every 48 hours.",
			"channel_priority": "Double down on the highest response channel for two weeks before adding another.",
			"pricing_upgrade_rule": "Increase price by 10-20% after every 3 documented client wins.",
		}

	if access_tier == "elite":
		result["advanced_insights_and_projections"] = advanced_insights

	return result


def build_starter_business_blueprint(payload: dict) -> dict:
	business_name = _resolve_business_name(payload)
	business_idea = _clean_text(payload.get("businessIdea", ""), "a practical business concept")
	product_or_service = _clean_text(payload.get("productOrService", ""), "a focused service")
	target_customer = _clean_text(payload.get("targetCustomer", ""), "a clearly defined customer group")
	market_location = _clean_text(payload.get("marketLocation", ""), "your target market")
	startup_budget = _clean_text(payload.get("startupBudget", ""), "a lean startup budget")
	skills_resources = _clean_text(payload.get("skillsResources", ""), "your current skills and available resources")
	income_goal = _clean_text(payload.get("incomeGoal", ""), "your first consistent income milestone")
	biggest_obstacle = _clean_text(payload.get("biggestObstacle", ""), "unclear positioning")
	delivery_preference = payload.get("deliveryPreference", "both")
	strategist_engine = _build_strategist_engine(payload)

	delivery_model = _delivery_model(delivery_preference)
	pricing_direction = _pricing_direction(startup_budget, delivery_preference)
	short_goal = _compact(income_goal)
	short_obstacle = _compact(biggest_obstacle)
	short_skills = _compact(skills_resources)
	short_idea = _compact(business_idea)
	short_offer = _compact(product_or_service)
	channels = _build_growth_channels(delivery_preference, target_customer, market_location)
	startup_requirements = [
		{
			"task": "Register LLC",
			"link_label": "Secretary of State",
			"estimated_time": "30 min",
			"priority": "High",
		},
		{
			"task": "Get EIN",
			"link_label": "IRS",
			"estimated_time": "10 min",
			"priority": "High",
		},
		{
			"task": "Open business bank account",
			"suggested_banks": ["Chase", "Navy Federal"],
			"estimated_time": "1-2 business days",
			"priority": "High",
		},
	]
	licenses_and_compliance = [
		{
			"requirement": "Verify state and local licensing rules",
			"owner": "Founder",
			"due_window": "Before first paid delivery",
		},
		{
			"requirement": "Collect basic legal docs (privacy policy, terms, client agreement)",
			"owner": "Founder + legal advisor",
			"due_window": "Week 1",
		},
		{
			"requirement": "Set up tax calendar for estimated payments and filing deadlines",
			"owner": "Founder + CPA",
			"due_window": "Week 2",
		},
	]
	tools_and_software = [
		{"category": "CRM", "recommended": "HubSpot Free or Pipedrive", "stage": "0-30 days"},
		{"category": "Scheduling", "recommended": "Google Calendar + intake form", "stage": "0-7 days"},
		{"category": "Payments", "recommended": "Stripe or Square invoicing", "stage": "0-14 days"},
		{"category": "Bookkeeping", "recommended": "Wave or QuickBooks Simple Start", "stage": "0-30 days"},
	]
	sources = [
		{"name": "IRS EIN Online", "url": "https://www.irs.gov/businesses/small-businesses-self-employed/employer-id-numbers"},
		{"name": "SBA business guide", "url": "https://www.sba.gov/business-guide"},
		{"name": "State Secretary of State portal", "url": "https://www.usa.gov/state-business"},
	]

	blueprint = {
		"business_snapshot": {
			"business_name": business_name,
			"business_idea": business_idea,
			"product_or_service": product_or_service,
			"target_customer": target_customer,
			"market_location": market_location,
			"delivery_model": delivery_model,
			"income_goal": income_goal,
			"primary_constraint": biggest_obstacle,
		},
		"ai_strategist_recommendation": strategist_engine,
		"startup_requirements": startup_requirements,
		"licenses_and_compliance": licenses_and_compliance,
		"tools_and_software": tools_and_software,
		"pricing_strategy": {
			"direction": pricing_direction,
			"model": "Three-tier offer (starter, standard, premium) with clear scope and timeline.",
			"near_term_goal": "Validate paid demand first, then increase price after documented wins.",
		},
		"launch_plan_30_days": {
			"top3_actions": [
				"Define a single sentence value proposition with a measurable before/after outcome.",
				"Create a one-page offer with scope, timeline, price anchor, and social proof placeholder.",
				"Run direct outreach to 20 qualified prospects and book at least 5 discovery calls.",
			],
			"week_by_week": [
				"Week 1: Validate messaging, finalize offer terms, and book discovery calls.",
				"Week 2: Close first 1-2 paid clients and deliver fast wins with documented outcomes.",
				"Week 3: Publish first proof assets (testimonial/case snapshot) and double top channel.",
				"Week 4: Standardize delivery checklist, raise price modestly, and target repeatable pipeline.",
			],
		},
		"operations_plan_90_days": {
			"focus_areas": [
				"Productize the best-performing offer into repeatable delivery tracks.",
				"Build lead scoring, follow-up automation, and weekly pipeline reviews.",
				"Track sales conversion, cashflow, and fulfillment quality with one dashboard.",
			],
			"delegation_sequence": [
				"First delegate: admin + follow-up coordination.",
				"Second delegate: fulfillment support for repeatable components.",
			],
		},
		"scale_plan_12_months": {
			"strategic_targets": [
				"Establish one repeatable inbound channel and one partner referral channel.",
				"Systemize onboarding and delivery for consistency at higher volume.",
				"Protect margin through periodic pricing increases tied to proven outcomes.",
			],
			"milestones": [
				"Quarter 1: Consistent monthly revenue and documented case studies.",
				"Quarter 2: Standardized delivery SOPs and delegated operations support.",
				"Quarter 3-4: Expand distribution partnerships and test one scalable paid channel.",
			],
		},
		"risk_flags": [
			"Selling broad outcomes without a precise first-result promise.",
			f"Building assets too early instead of validating paid demand against goal: {short_goal}.",
			f"Ignoring constraint '{short_obstacle}' instead of designing a workaround in the operating plan.",
		],
		"sources": sources,
		"businessIdentity": {
			"proposedBusinessName": _clean_text(payload.get("proposedBusinessName", ""), ""),
			"domainToCheck": _clean_text(payload.get("domainToCheck", ""), ""),
			"displayBusinessName": business_name,
		},
		"ventureSummary": {
			"businessModel": (
				f"Build {business_name} as a focused {short_offer} venture for {target_customer} in {market_location}. "
				f"Use {short_idea} as the core growth wedge. "
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
				f"Position {business_name} as the no-fluff execution partner for {target_customer}: clear diagnosis, specific action plan, and tracked outcomes. "
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

	return _inject_business_name(blueprint, business_name)

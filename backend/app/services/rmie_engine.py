def _clean_text(value: str, fallback: str) -> str:
	cleaned = value.strip()
	return cleaned or fallback


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

	return {
		"businessConceptSummary": {
			"oneLiner": f"PEN2PRO Starter frames {business_idea} as a {product_or_service} business for {target_customer} in {market_location}.",
			"starterFocus": f"Launch the simplest version first, prove demand quickly, and use {delivery_model} to reduce friction.",
		},
		"idealCustomer": {
			"primaryCustomer": target_customer,
			"problemContext": f"This customer is actively trying to solve the problem behind {business_idea} but needs a solution that feels practical and trustworthy.",
			"marketLocation": market_location,
		},
		"coreOffer": {
			"offerType": product_or_service,
			"starterOffer": f"Create a starter offer that helps {target_customer} achieve one clear result related to {business_idea} without extra complexity.",
			"deliveryModel": delivery_model,
		},
		"revenueDirection": {
			"incomeGoal": income_goal,
			"pricingDirection": pricing_direction,
			"budgetApproach": f"Use {startup_budget} carefully and put early spend only into tools or outreach that help close first customers faster.",
		},
		"brandPositioning": {
			"brandPromise": f"PEN2PRO should position this offer as a clear, outcome-focused way for {target_customer} to make progress without guesswork.",
			"differentiator": f"Lean into these advantages: {skills_resources}.",
			"trustSignal": f"Address the main buyer hesitation around {biggest_obstacle} directly in messaging and proof points.",
		},
		"starterActionPlan": [
			f"Clarify the exact outcome your {product_or_service} delivers for {target_customer} in one sentence.",
			f"Talk to 5 people in {market_location} who match {target_customer} and collect exact language about their pain points.",
			"Draft a one-page offer with the problem, promise, scope, delivery method, and a direct call to action.",
			"Reach out to your first 20 qualified prospects through the fastest channel you can realistically sustain this week.",
			"Use early conversations to tighten your message, objection handling, and pricing before expanding outreach.",
		],
		"fastestPathToFirstMoney": [
			f"Sell a narrow starter version of {product_or_service} before building a bigger offer.",
			"Ask for a paid pilot, beta package, or fixed-scope first project rather than waiting for a perfect brand or website.",
			f"Use your current strengths in {skills_resources} to create momentum immediately.",
		],
		"commonRisksOrMistakes": [
			"Trying to serve too many customer types before proving one strong niche angle.",
			f"Overbuilding assets before validating whether buyers will pay to solve {business_idea}.",
			f"Letting {biggest_obstacle} delay direct outreach, offer testing, or first sales conversations.",
		],
		"upgradeRecommendation": {
			"summary": "Upgrade when you want deeper strategy, more automation, and a tighter execution system.",
			"pro": "PEN2PRO Pro fits when you need better offer refinement, repeatable lead generation, and stronger monetization structure.",
			"elite": "PEN2PRO Elite fits when you want higher-touch implementation support, advanced growth planning, and a more complete operating system.",
		},
	}

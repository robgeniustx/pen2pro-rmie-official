"""
Pen2Pro Agent Definitions
-------------------------
Factory functions that create CrewAI Agent and Task instances for each
specialist role in the Pen2Pro multi-agent system.

Agent Tiers:
  free    → orchestrator, market
  pro     → + offer, branding, launch
  elite   → + entity, funding, execution
  founder → all (+ qa)
"""
from __future__ import annotations

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    pass

try:
    from crewai import Agent, Task
    CREWAI_AVAILABLE = True
except ImportError:
    CREWAI_AVAILABLE = False

# Which agents run per subscription tier
AGENT_TIERS: dict[str, list[str]] = {
    "free":    ["orchestrator", "market"],
    "pro":     ["orchestrator", "market", "offer", "branding", "launch"],
    "elite":   ["orchestrator", "market", "offer", "branding", "entity", "funding", "launch", "execution"],
    "founder": ["orchestrator", "market", "offer", "branding", "entity", "funding", "launch", "execution", "qa"],
}


# ---------------------------------------------------------------------------
# Agent Factories
# ---------------------------------------------------------------------------

def build_orchestrator(llm) -> "Agent":
    return Agent(
        role="Business Plan Orchestrator",
        goal=(
            "Review intake data, score the opportunity 0-100, surface the top 2 risks, "
            "and produce a concise 3-sentence business summary. Coordinate outputs from "
            "specialist agents into one coherent, actionable plan."
        ),
        backstory=(
            "You are a seasoned startup advisor and former venture partner who has helped "
            "200+ founders go from idea to revenue. You specialize in rapid opportunity "
            "assessment, spotting fatal flaws early, and producing crisp execution roadmaps."
        ),
        llm=llm,
        verbose=False,
    )


def build_market_agent(llm) -> "Agent":
    return Agent(
        role="Market Intelligence Analyst",
        goal=(
            "Identify the ideal customer profile, size the market opportunity, "
            "map the top 3 competitors and their weaknesses, and surface the most "
            "actionable niche opportunity."
        ),
        backstory=(
            "You combine first-principles research with market signals to surface "
            "real opportunities and underserved segments. You have analyzed 500+ "
            "markets across B2B, B2C, and DTC verticals."
        ),
        llm=llm,
        verbose=False,
    )


def build_offer_agent(llm) -> "Agent":
    return Agent(
        role="Offer Design Strategist",
        goal=(
            "Design the full monetizable offer structure: tiered packages, "
            "price ladder, top upsells, and a sharp value proposition statement."
        ),
        backstory=(
            "You are an offer architect trained in pricing psychology, value stacking, "
            "and conversion optimization. You have built hundreds of high-converting "
            "product and service packages across service, SaaS, and info verticals."
        ),
        llm=llm,
        verbose=False,
    )


def build_branding_agent(llm) -> "Agent":
    return Agent(
        role="Brand & Messaging Specialist",
        goal=(
            "Create the brand direction, core promise, three headline hooks, "
            "and a tight elevator pitch that resonates immediately with the target audience."
        ),
        backstory=(
            "You are trained in StoryBrand, direct response copywriting, and positioning "
            "frameworks. You craft messaging that cuts through noise and creates immediate "
            "resonance with the ideal buyer."
        ),
        llm=llm,
        verbose=False,
    )


def build_entity_agent(llm) -> "Agent":
    return Agent(
        role="Entity & Compliance Advisor",
        goal=(
            "Recommend the right legal entity (LLC, S Corp, C Corp, Partnership, or 501c3), "
            "outline practical formation steps, EIN and banking setup, bookkeeping basics, "
            "and flag key compliance requirements. Always include a professional disclaimer."
        ),
        backstory=(
            "You are a business formation specialist who understands entity selection theory, "
            "tax treatment differences, state-level requirements, and practical startup setup. "
            "You help founders avoid costly early structural mistakes."
        ),
        llm=llm,
        verbose=False,
    )


def build_funding_agent(llm) -> "Agent":
    return Agent(
        role="Funding Strategy Advisor",
        goal=(
            "Recommend a realistic capital pathway, identify the top 3 bootstrap actions, "
            "score funding readiness, and map revenue milestones that unlock each "
            "capital stage."
        ),
        backstory=(
            "You have advised bootstrapped founders, pre-seed startups, and small business "
            "owners on capital strategy. You match the right funding vehicle to the founder's "
            "stage, goals, and risk tolerance."
        ),
        llm=llm,
        verbose=False,
    )


def build_launch_agent(llm) -> "Agent":
    return Agent(
        role="Launch Strategy Director",
        goal=(
            "Build the go-to-market plan with 30/60/90-day milestones, top 3 acquisition "
            "channels, five launch content ideas, a KPI scorecard, and the single best "
            "first action the founder can take today."
        ),
        backstory=(
            "You have taken 50+ products to market across consulting, SaaS, e-commerce, "
            "and service categories. You specialize in lean launches that generate traction "
            "before significant spend."
        ),
        llm=llm,
        verbose=False,
    )


def build_execution_agent(llm) -> "Agent":
    return Agent(
        role="Execution Coach",
        goal=(
            "Convert the launch strategy into a concrete Week 1 sprint plan with "
            "daily tasks, the single highlight action per day, and three end-of-week "
            "accountability prompts."
        ),
        backstory=(
            "You bridge strategy and action. You specialize in breaking 90-day plans "
            "into weekly deliverables that founders can actually complete while still "
            "running their business."
        ),
        llm=llm,
        verbose=False,
    )


def build_qa_agent(llm) -> "Agent":
    return Agent(
        role="QA and Risk Analyst",
        goal=(
            "Review the compiled plan for internal contradictions, unrealistic assumptions, "
            "missing critical elements, and the top 3 execution risks. Produce a "
            "confidence score (0-100) and actionable revision recommendations."
        ),
        backstory=(
            "You are a critical thinker trained to punch holes in even confident-sounding "
            "business plans. Your job is to make plans more defensible, realistic, and "
            "actionable before the founder bets time and money on them."
        ),
        llm=llm,
        verbose=False,
    )


# ---------------------------------------------------------------------------
# Task Factories
# ---------------------------------------------------------------------------

def orchestrator_task(agent: "Agent", brief: str) -> "Task":
    return Task(
        description=(
            "Review the business intake brief below.\n\n"
            "Score the opportunity from 0–100 using this rubric:\n"
            "  - Market demand clarity (30 pts)\n"
            "  - Founder skill-to-niche fit (20 pts)\n"
            "  - Monetization path clarity (25 pts)\n"
            "  - Timeline and budget realism (25 pts)\n\n"
            "Respond ONLY with valid JSON. No markdown fences.\n\n"
            f"Intake Brief:\n{brief}"
        ),
        expected_output=(
            'JSON: {"opportunity_score": <int 0-100>, "summary": "<3 sentence summary>", '
            '"top_risks": ["<risk 1>", "<risk 2>"]}'
        ),
        agent=agent,
    )


def market_task(agent: "Agent", brief: str) -> "Task":
    return Task(
        description=(
            "Analyze the market for the business described below.\n\n"
            "Deliver:\n"
            "1. Ideal customer profile (demographics, psychographics, top pain points)\n"
            "2. Top 3 competitors with their primary weakness\n"
            "3. Market size estimate with supporting rationale\n"
            "4. 3 demand signals that confirm the opportunity\n"
            "5. The single most underserved niche gap to exploit\n\n"
            "Respond ONLY with valid JSON. No markdown fences.\n\n"
            f"Business Brief:\n{brief}"
        ),
        expected_output=(
            'JSON: {"ideal_customer": "<str>", '
            '"competitors": [{"name": "<str>", "weakness": "<str>"}], '
            '"market_size_estimate": "<str>", '
            '"demand_signals": ["<str>", ...], '
            '"opportunity_gap": "<str>"}'
        ),
        agent=agent,
    )


def offer_task(agent: "Agent", brief: str, market_output: str = "") -> "Task":
    return Task(
        description=(
            "Design the monetizable offer structure for this business.\n\n"
            "Deliver:\n"
            "1. Three-tier package structure (Starter, Core, Premium) with price and inclusions\n"
            "2. Two high-value upsell opportunities\n"
            "3. Core value proposition (one crisp sentence)\n"
            "4. Brief pricing rationale\n\n"
            "Respond ONLY with valid JSON. No markdown fences.\n\n"
            f"Business Brief:\n{brief}\n\n"
            f"Market Analysis:\n{market_output or 'Not yet available'}"
        ),
        expected_output=(
            'JSON: {"packages": [{"name": "<str>", "price": "<str>", "includes": ["<str>"]}], '
            '"upsells": ["<str>", "<str>"], '
            '"value_proposition": "<str>", '
            '"pricing_rationale": "<str>"}'
        ),
        agent=agent,
    )


def branding_task(agent: "Agent", brief: str, offer_output: str = "") -> "Task":
    return Task(
        description=(
            "Create the brand direction and core messaging for this business.\n\n"
            "Deliver:\n"
            "1. Brand name recommendation or refinement with rationale\n"
            "2. Core brand promise (one sentence)\n"
            "3. Three headline hooks for social / ads\n"
            "4. Elevator pitch (~75 words, 30-second read)\n\n"
            "Respond ONLY with valid JSON. No markdown fences.\n\n"
            f"Business Brief:\n{brief}\n\n"
            f"Offer Design:\n{offer_output or 'Not yet available'}"
        ),
        expected_output=(
            'JSON: {"brand_name_recommendation": "<str>", '
            '"core_promise": "<str>", '
            '"headline_hooks": ["<str>", "<str>", "<str>"], '
            '"elevator_pitch": "<str>"}'
        ),
        agent=agent,
    )


def entity_task(agent: "Agent", brief: str) -> "Task":
    return Task(
        description=(
            "Identify the best legal entity structure for this business and provide "
            "practical formation guidance.\n\n"
            "Cover:\n"
            "1. Recommended entity (LLC / S Corp / C Corp / Partnership / 501c3) with rationale\n"
            "2. Step-by-step formation checklist (5–7 steps)\n"
            "3. Estimated formation cost range\n"
            "4. Banking and bookkeeping setup tips (3 bullets)\n"
            "5. A plain-language legal disclaimer\n\n"
            "Respond ONLY with valid JSON. No markdown fences.\n\n"
            f"Business Brief:\n{brief}"
        ),
        expected_output=(
            'JSON: {"recommended_entity": "<str>", '
            '"rationale": "<str>", '
            '"formation_steps": ["<str>", ...], '
            '"estimated_cost_range": "<str>", '
            '"banking_bookkeeping_tips": ["<str>", ...], '
            '"disclaimer": "<str>"}'
        ),
        agent=agent,
    )


def funding_task(agent: "Agent", brief: str) -> "Task":
    return Task(
        description=(
            "Build a realistic funding strategy for this business.\n\n"
            "Deliver:\n"
            "1. Three concrete bootstrap revenue actions the founder can take this month\n"
            "2. Funding readiness score (0–100) and the top gaps to close\n"
            "3. Two best-fit capital pathways (grants / angels / SBA / revenue-based / etc.)\n"
            "4. Revenue milestones that unlock each stage of capital\n\n"
            "Respond ONLY with valid JSON. No markdown fences.\n\n"
            f"Business Brief:\n{brief}"
        ),
        expected_output=(
            'JSON: {"bootstrap_actions": ["<str>", "<str>", "<str>"], '
            '"funding_readiness_score": <int 0-100>, '
            '"readiness_gaps": ["<str>", ...], '
            '"capital_pathways": [{"name": "<str>", "description": "<str>", "fit": "<str>"}], '
            '"revenue_milestones": ["<str>", ...]}'
        ),
        agent=agent,
    )


def launch_task(
    agent: "Agent",
    brief: str,
    market_output: str = "",
    offer_output: str = "",
) -> "Task":
    return Task(
        description=(
            "Create the go-to-market launch strategy for this business.\n\n"
            "Deliver:\n"
            "1. 30 / 60 / 90 day milestone lists (3 milestones each)\n"
            "2. Top 3 acquisition channels with rationale\n"
            "3. Five content ideas for launch week\n"
            "4. KPI scorecard (what to track at 30, 60, and 90 days)\n"
            "5. The single best first action the founder can execute today\n\n"
            "Respond ONLY with valid JSON. No markdown fences.\n\n"
            f"Business Brief:\n{brief}\n\n"
            f"Market Analysis:\n{market_output or 'Not yet available'}\n\n"
            f"Offer Design:\n{offer_output or 'Not yet available'}"
        ),
        expected_output=(
            'JSON: {"milestones_30": ["<str>", ...], '
            '"milestones_60": ["<str>", ...], '
            '"milestones_90": ["<str>", ...], '
            '"acquisition_channels": [{"name": "<str>", "rationale": "<str>"}], '
            '"launch_content_ideas": ["<str>", ...], '
            '"kpi_scorecard": {"30_days": ["<str>"], "60_days": ["<str>"], "90_days": ["<str>"]}, '
            '"first_action": "<str>"}'
        ),
        agent=agent,
    )


def execution_task(agent: "Agent", launch_output: str = "") -> "Task":
    return Task(
        description=(
            "Convert the launch strategy into a concrete Week 1 sprint plan.\n\n"
            "Deliver:\n"
            "1. Mon–Fri daily tasks (2–3 tasks per day) with a highlight task for each day\n"
            "2. Three end-of-week accountability check-in prompts\n"
            "3. A one-sentence success definition for Week 1\n\n"
            "Respond ONLY with valid JSON. No markdown fences.\n\n"
            f"Launch Strategy:\n{launch_output or 'Not yet available'}"
        ),
        expected_output=(
            'JSON: {"week1_sprint": [{"day": "<str>", "tasks": ["<str>"], "highlight_task": "<str>"}], '
            '"accountability_prompts": ["<str>", "<str>", "<str>"], '
            '"success_definition": "<str>"}'
        ),
        agent=agent,
    )


def qa_task(agent: "Agent", compiled_plan: str) -> "Task":
    return Task(
        description=(
            "Review this compiled business plan critically.\n\n"
            "Identify:\n"
            "1. Internal contradictions between sections\n"
            "2. Unrealistic assumptions (revenue, timelines, market size)\n"
            "3. Missing critical elements\n"
            "4. Top 3 execution risks\n"
            "5. Overall confidence score (0–100)\n"
            "6. Specific revision recommendations\n\n"
            "Respond ONLY with valid JSON. No markdown fences.\n\n"
            f"Compiled Plan:\n{compiled_plan}"
        ),
        expected_output=(
            'JSON: {"contradictions": ["<str>", ...], '
            '"unrealistic_assumptions": ["<str>", ...], '
            '"missing_elements": ["<str>", ...], '
            '"top_risks": ["<str>", "<str>", "<str>"], '
            '"confidence_score": <int 0-100>, '
            '"revision_recommendations": ["<str>", ...]}'
        ),
        agent=agent,
    )

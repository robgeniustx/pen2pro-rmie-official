"""
Pen2Pro Multi-Agent Plan Generation Engine
------------------------------------------
Orchestrates 9 specialist CrewAI agents across subscription tiers.
Falls back to a structured template plan when OpenAI is unavailable.

Tier → Agent access:
  free    → orchestrator, market
  pro     → + offer, branding, launch
  elite   → + entity, funding, execution
  founder → all (including QA)
"""
from __future__ import annotations

import json
import os
import time
import uuid
from typing import Any

try:
    from crewai import Crew, LLM, Process
    CREWAI_AVAILABLE = True
except ImportError:
    CREWAI_AVAILABLE = False

from app.agents.definitions import (
    AGENT_TIERS,
    build_orchestrator, build_market_agent, build_offer_agent,
    build_branding_agent, build_entity_agent, build_funding_agent,
    build_launch_agent, build_execution_agent, build_qa_agent,
    orchestrator_task, market_task, offer_task, branding_task,
    entity_task, funding_task, launch_task, execution_task, qa_task,
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _safe_json(raw: str) -> dict[str, Any]:
    """Best-effort JSON extraction from agent output."""
    if not raw:
        return {}
    raw = raw.strip()
    # Strip markdown code fences if present
    for fence in ("```json", "```"):
        if fence in raw:
            try:
                start = raw.index(fence) + len(fence)
                end = raw.index("```", start)
                raw = raw[start:end].strip()
                break
            except ValueError:
                pass
    # Try first { ... } block
    try:
        brace_start = raw.index("{")
        brace_end = raw.rindex("}") + 1
        return json.loads(raw[brace_start:brace_end])
    except (ValueError, json.JSONDecodeError):
        return {"raw_output": raw}


def _run_crew_task(agent, task) -> dict[str, Any]:
    """Run a single agent+task as a minimal sequential Crew."""
    try:
        crew = Crew(
            agents=[agent],
            tasks=[task],
            process=Process.sequential,
            verbose=False,
        )
        result = crew.kickoff()
        return _safe_json(str(result))
    except Exception as exc:  # noqa: BLE001
        return {"error": str(exc)}


# ---------------------------------------------------------------------------
# Fallback plan (no LLM connected)
# ---------------------------------------------------------------------------

def _build_fallback(intake: Any) -> dict[str, Any]:
    """Return a structured template plan when CrewAI / OpenAI is unavailable."""
    biz = intake.business_name
    niche = intake.niche or "your market"
    goals = intake.goals or ["Build audience", "Generate qualified leads", "Drive consistent revenue"]
    platforms = intake.platforms or ["Instagram", "Facebook", "TikTok"]
    revenue = intake.revenue_goal
    months = intake.timeline_months

    return {
        "orchestrator": {
            "opportunity_score": 65,
            "summary": (
                f"{biz} shows genuine opportunity in the {niche} space. "
                f"With {months} months and ${intake.budget_monthly:.0f}/month, "
                "the priority is rapid validation of one core offer before scaling spend."
            ),
            "top_risks": [
                "Limited budget narrows testing cycles — prioritize organic first",
                "Competitive market requires a sharp niche focus to differentiate",
            ],
        },
        "market": {
            "ideal_customer": (
                f"Motivated individuals or small businesses in {niche} "
                "seeking practical, results-driven support"
            ),
            "competitors": [
                {"name": "Large generalist agencies", "weakness": "High cost, poor personalization"},
                {"name": "DIY online courses", "weakness": "No accountability or implementation support"},
                {"name": "Generic consultants", "weakness": "Not niche-specific, slow results"},
            ],
            "market_size_estimate": f"Growing segment — online {niche} services expanding 15–25% YOY",
            "demand_signals": [
                "Rising search volume for niche-specific solutions",
                "Active communities seeking guidance",
                "Underserved mid-market segment",
            ],
            "opportunity_gap": f"Affordable, specialized service in {niche} with clear, measurable ROI",
        },
        "offer": {
            "packages": [
                {"name": "Starter", "price": "$297", "includes": ["Core deliverable", "30-min strategy call", "Email support"]},
                {"name": "Core",    "price": "$697", "includes": ["Full implementation", "2 calls/month", "Async support"]},
                {"name": "Premium", "price": "$1,497", "includes": ["Done-with-you", "Weekly check-ins", "90-day guarantee"]},
            ],
            "upsells": ["Ongoing maintenance retainer ($297/month)", "Group workshop access ($197/seat)"],
            "value_proposition": f"Faster path from idea to ${revenue:,.0f}/month without guesswork",
            "pricing_rationale": "Tiered structure minimises entry friction while maximising LTV through upgrade path",
        },
        "branding": {
            "brand_name_recommendation": biz,
            "core_promise": f"The clearest path from {intake.offer_idea or 'idea'} to consistent monthly revenue",
            "headline_hooks": [
                f"Stop guessing. Start growing {biz}.",
                "Your results. Our roadmap.",
                f"From zero to ${revenue:,.0f}/month in {months} months.",
            ],
            "elevator_pitch": (
                f"{biz} helps {intake.target_customer or 'founders and small businesses'} "
                f"achieve {goals[0]} through a proven system "
                f"that delivers clear results in {months} months or less."
            ),
        },
        "entity": {
            "recommended_entity": "LLC",
            "rationale": (
                "Best balance of liability protection, tax flexibility, and low setup cost "
                "for most early-stage service businesses. S-Corp election available later for tax savings."
            ),
            "formation_steps": [
                "Choose and verify business name availability in your state",
                "File Articles of Organization with your state ($50–$500 depending on state)",
                "Obtain an EIN from the IRS — free at irs.gov, takes under 10 minutes",
                "Open a dedicated business checking account",
                "Set up bookkeeping software (Wave — free, or QuickBooks Simple Start)",
                "Keep personal and business finances completely separate from day one",
            ],
            "estimated_cost_range": "$150–$800 depending on state + registered agent fee",
            "banking_bookkeeping_tips": [
                "Never mix personal and business transactions",
                "Track every expense with a digital receipt from day one",
                "Reconcile accounts weekly, not monthly",
            ],
            "disclaimer": (
                "This is general educational guidance only. Consult a licensed attorney "
                "and/or CPA for advice specific to your circumstances before making any "
                "legal or tax decisions."
            ),
        },
        "funding": {
            "bootstrap_actions": [
                f"Pre-sell the Core package to 2–3 warm contacts this month",
                "Build a simple landing page and collect 50 email leads before spending on ads",
                "Offer a 30% beta discount to first 5 clients in exchange for video testimonials",
            ],
            "funding_readiness_score": 40,
            "readiness_gaps": [
                "No revenue history yet",
                "No formal legal entity in place",
                "Limited social proof / case studies",
            ],
            "capital_pathways": [
                {
                    "name": "Revenue-Based Bootstrap",
                    "description": "Reinvest first client revenue into content + ads",
                    "fit": "Best for service businesses with low overhead",
                },
                {
                    "name": "CDFI Microloan",
                    "description": "$5K–$50K community development loans with flexible terms",
                    "fit": "Good once you have a basic business plan and entity formed",
                },
            ],
            "revenue_milestones": [
                "$1,000/month → Validate the offer works",
                "$3,000/month → Hire first part-time contractor",
                f"${revenue:,.0f}/month → Primary income replacement goal",
            ],
        },
        "launch": {
            "milestones_30": [
                "Website / landing page live with clear offer",
                "First 2 paying clients secured",
                "Content publishing routine established (3× / week)",
            ],
            "milestones_60": [
                f"Reach ${min(revenue * 0.4, 3000):,.0f} MRR",
                "Referral program launched",
                "First paid ad test completed with data",
            ],
            "milestones_90": [
                f"Hit ${min(revenue, 5000):,.0f}/month revenue target",
                "Client delivery systematized",
                "Testimonial collection process in place",
            ],
            "acquisition_channels": [
                {"name": "Organic Social",   "rationale": "Zero cost, builds trust and audience before paid spend"},
                {"name": "Direct Outreach",  "rationale": "Fastest path to first paying client conversations"},
                {"name": "Referral Network", "rationale": "Highest conversion rate at the lowest cost-per-client"},
            ],
            "launch_content_ideas": [
                f"Why I started {biz} (founder story post)",
                f"The #1 mistake most {niche} founders make",
                "Quick win tip your audience can act on today",
                "Behind-the-scenes: how the system works",
                "Client result story or projected outcome (clearly labelled)",
            ],
            "kpi_scorecard": {
                "30_days": ["2 paying clients", "100 net new followers", "Landing page live with opt-in"],
                "60_days": ["$2K+ revenue/month", "5%+ email open rate", "1 referred client"],
                "90_days": [f"${min(revenue, 5000):,.0f} revenue/month", "10 testimonials collected", "Repeatable delivery checklist"],
            },
            "first_action": (
                "Write and publish a 3-sentence social post about your offer today — "
                "no perfection required, just visible"
            ),
        },
        "execution": {
            "week1_sprint": [
                {"day": "Monday",    "tasks": ["Finalise offer copy", "Publish landing page"],            "highlight_task": "Landing page live"},
                {"day": "Tuesday",   "tasks": ["Write 3 social posts (schedule for week)", "List 10 warm outreach contacts"], "highlight_task": "Schedule all social content"},
                {"day": "Wednesday", "tasks": ["Send outreach to 5 warm contacts", "Record 60-second intro video"], "highlight_task": "Send outreach messages"},
                {"day": "Thursday",  "tasks": ["Follow up on all outreach", "Research 3 potential partners"],      "highlight_task": "Follow up on every lead"},
                {"day": "Friday",    "tasks": ["Review all week metrics", "Document what worked + set Week 2 goals"], "highlight_task": "Weekly metrics review"},
            ],
            "accountability_prompts": [
                "Did you publish content at least 3 times this week?",
                "Did you reach out to at least 5 potential clients?",
                "Did you generate any revenue this week? If not, what is the single blocker?",
            ],
            "success_definition": (
                "Week 1 is complete when: landing page is live, "
                "5 outreach messages sent, 3 posts published"
            ),
        },
    }


# ---------------------------------------------------------------------------
# Pen2Pro Engine
# ---------------------------------------------------------------------------

class Pen2ProEngine:
    """
    Multi-agent business plan generation engine.

    When OPENAI_API_KEY is present and crewai is installed, runs the full
    specialist agent crew. Otherwise returns a comprehensive structured
    fallback plan.
    """

    def __init__(self) -> None:
        self.openai_api_key: str = os.getenv("OPENAI_API_KEY", "")
        default_model = "gpt-5.4-mini"
        self.model_by_tier: dict[str, str] = {
            "free": os.getenv("OPENAI_MODEL_FREE", default_model),
            "pro": os.getenv("OPENAI_MODEL_PRO", default_model),
            "elite": os.getenv("OPENAI_MODEL_ELITE", default_model),
            "founder": os.getenv("OPENAI_MODEL_FOUNDER", default_model),
        }

    def _resolve_model(self, user_tier: str | None) -> str:
        tier = (user_tier or "").lower()
        return self.model_by_tier.get(tier, self.model_by_tier["free"])

    def _get_llm(self, user_tier: str | None) -> Any:
        selected_model = self._resolve_model(user_tier)
        return LLM(
            model=f"openai/{selected_model}",
            api_key=self.openai_api_key,
        )

    def _build_brief(self, intake: Any) -> str:
        goals_str = ", ".join(intake.goals) if intake.goals else "Not specified"
        skills_str = ", ".join(intake.skill_set) if intake.skill_set else "Not specified"
        platforms_str = ", ".join(intake.platforms) if intake.platforms else "Instagram, Facebook, TikTok"
        return (
            f"Business Name: {intake.business_name}\n"
            f"Niche / Industry: {intake.niche or 'Not specified'}\n"
            f"Business Stage: {intake.business_stage}\n"
            f"Founder Skills: {skills_str}\n"
            f"Monthly Budget: ${intake.budget_monthly:.2f}\n"
            f"Timeline: {intake.timeline_months} months\n"
            f"Target Customer: {intake.target_customer or 'Not specified'}\n"
            f"Offer / Product Idea: {intake.offer_idea or 'Not specified'}\n"
            f"Revenue Goal: ${intake.revenue_goal:,.2f}/month\n"
            f"Local vs Online: {intake.local_or_online}\n"
            f"Constraints: {intake.constraints or 'None'}\n"
            f"Primary Goals: {goals_str}\n"
            f"Social Platforms: {platforms_str}\n"
        )

    def _run_agents(self, intake: Any, brief: str) -> dict[str, Any]:
        """Run enabled agents sequentially, accumulating results."""
        llm = self._get_llm(intake.user_tier)
        allowed = set(AGENT_TIERS.get(intake.user_tier, AGENT_TIERS["free"]))
        results: dict[str, Any] = {}

        if "orchestrator" in allowed:
            agent = build_orchestrator(llm)
            task = orchestrator_task(agent, brief)
            results["orchestrator"] = _run_crew_task(agent, task)

        if "market" in allowed:
            agent = build_market_agent(llm)
            task = market_task(agent, brief)
            results["market"] = _run_crew_task(agent, task)

        if "offer" in allowed:
            agent = build_offer_agent(llm)
            task = offer_task(agent, brief, json.dumps(results.get("market", {})))
            results["offer"] = _run_crew_task(agent, task)

        if "branding" in allowed:
            agent = build_branding_agent(llm)
            task = branding_task(agent, brief, json.dumps(results.get("offer", {})))
            results["branding"] = _run_crew_task(agent, task)

        if "entity" in allowed:
            agent = build_entity_agent(llm)
            task = entity_task(agent, brief)
            results["entity"] = _run_crew_task(agent, task)

        if "funding" in allowed:
            agent = build_funding_agent(llm)
            task = funding_task(agent, brief)
            results["funding"] = _run_crew_task(agent, task)

        if "launch" in allowed:
            agent = build_launch_agent(llm)
            task = launch_task(
                agent, brief,
                json.dumps(results.get("market", {})),
                json.dumps(results.get("offer", {})),
            )
            results["launch"] = _run_crew_task(agent, task)

        if "execution" in allowed:
            agent = build_execution_agent(llm)
            task = execution_task(agent, json.dumps(results.get("launch", {})))
            results["execution"] = _run_crew_task(agent, task)

        if "qa" in allowed:
            agent = build_qa_agent(llm)
            task = qa_task(agent, json.dumps(results, default=str)[:8000])
            results["qa"] = _run_crew_task(agent, task)

        return results

    def generate(self, intake: Any) -> dict[str, Any]:
        """
        Run the full plan generation pipeline.
        Returns a structured dict compatible with the PlanOutput schema.
        """
        start_time = time.time()
        plan_id = str(uuid.uuid4())
        brief = self._build_brief(intake)
        can_use_llm = CREWAI_AVAILABLE and bool(self.openai_api_key)

        if can_use_llm:
            try:
                sections = self._run_agents(intake, brief)
                engine_name = "crewai"
            except Exception as exc:  # noqa: BLE001
                sections = _build_fallback(intake)
                sections["_error"] = str(exc)
                engine_name = "fallback-error"
        else:
            sections = _build_fallback(intake)
            engine_name = "fallback"

        orch = sections.get("orchestrator") or {}
        opportunity_score = int(orch.get("opportunity_score", 65)) if isinstance(orch, dict) else 65
        summary = str(orch.get("summary", f"Plan generated for {intake.business_name}")) if isinstance(orch, dict) else ""

        return {
            "plan_id": plan_id,
            "session_id": intake.session_id,
            "user_tier": intake.user_tier,
            "engine": engine_name,
            "opportunity_score": opportunity_score,
            "summary": summary,
            "sections": sections,
            "run_duration_seconds": round(time.time() - start_time, 2),
            "meta": {
                "crewai_available": CREWAI_AVAILABLE,
                "llm_connected": can_use_llm,
                "agents_run": list(sections.keys()),
                "model": self._resolve_model(intake.user_tier) if can_use_llm else "none",
            },
        }


# Singleton used by routes
pen2pro_engine = Pen2ProEngine()

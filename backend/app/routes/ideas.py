from typing import Any

from fastapi import APIRouter
from pydantic import BaseModel, Field

router = APIRouter()


class StarterBlueprintRequest(BaseModel):
    idea: str = Field(..., min_length=8, max_length=240)
    business_name: str = Field(default="", max_length=120)
    audience: str = Field(default="", max_length=140)
    revenue_goal: str = Field(default="", max_length=80)
    time_commitment: str = Field(default="", max_length=80)


def _headline_from_idea(idea: str) -> str:
    topic = idea.strip().rstrip(".")
    return f"Build a traction-first business around {topic}."


def _format_offer(idea: str) -> str:
    topic = idea.strip().rstrip(".")
    return f"Starter Offer: 1:1 '{topic}' mini-sprint with clear before/after outcome."


@router.get("/ideas")
def get_ideas(niche: str = "general business"):
    ideas = [
        f"{niche} lead generation system",
        f"{niche} monetization blueprint",
        f"{niche} AI content workflow",
        f"{niche} offer creation engine",
        f"{niche} customer acquisition assistant"
    ]
    return {"niche": niche, "ideas": ideas}


@router.post("/starter-blueprint")
def generate_starter_blueprint(payload: StarterBlueprintRequest) -> dict[str, Any]:
    idea = payload.idea.strip()
    business_name = payload.business_name.strip() or "Your New Venture"
    audience = payload.audience.strip() or "busy professionals with a painful, expensive problem"
    revenue_goal = payload.revenue_goal.strip() or "$1,000 first month"
    time_commitment = payload.time_commitment.strip() or "5-7 hours per week"

    blueprint = {
        "business_snapshot": {
            "business_name": business_name,
            "headline": _headline_from_idea(idea),
            "target_customer": audience,
            "revenue_target": revenue_goal,
        },
        "startup_requirements": [
            {"task": "Define one paid starter offer with fixed scope and outcome.", "priority": "High"},
            {"task": "Set up a one-page offer + booking flow.", "priority": "High"},
            {"task": "Prepare a 20-message outreach list and call script.", "priority": "High"},
        ],
        "next_steps_timeline": [
            {"window": "Next 24 hours", "action": f"Finalize your first paid '{idea}' offer and pricing."},
            {"window": "Days 2-7", "action": "Interview 5 potential buyers and launch your one-page offer."},
            {"window": "Days 8-14", "action": "Reach out to 30 prospects and book 5 sales calls."},
            {"window": "Days 15-30", "action": "Close first 3 clients, deliver fast wins, and collect testimonials."},
        ],
        "monetization_roadmap": {
            "revenue_model": "Starter sprint offer → standard package → monthly retainer upsell.",
            "first_offer": _format_offer(idea),
            "pricing_idea": "Beta at $49-$149, then move to $199-$499 after first 3 wins.",
            "customer_acquisition": "Direct outreach + referral asks + short proof-based content.",
            "launch_actions": [
                "Publish offer page with clear deliverables and timeline.",
                "Run daily outreach with one pain-first script.",
                "Track replies, calls, close rate, and cash collected weekly.",
            ],
        },
        "offer_positioning": {
            "core_promise": "Deliver a measurable result in 14 days using a simple execution system.",
            "problem_statement": f"People struggle to execute '{idea}' consistently.",
            "differentiator": "Fast implementation, fixed scope, and beginner-friendly support.",
        },
        "customer_avatar": {
            "primary_segment": audience,
            "buying_triggers": ["Needs a quick win.", "Prefers fixed pricing.", "Wants practical execution help."],
            "top_pains": ["No clear action plan.", "Inconsistent execution.", "Slow results from generic advice."],
        },
        "first_30_day_execution_plan": {
            "week_1": "Validate offer language and pricing with customer interviews.",
            "week_2": "Launch outreach and book calls.",
            "week_3": "Close paid pilots and deliver results fast.",
            "week_4": "Gather testimonials and optimize script for repeat sales.",
        },
        "upgrade_recommendation": {
            "recommended_tier": "pro",
            "why_now": "Upgrade after first 3 customers to improve conversion consistency and systemize growth.",
            "what_unlocks_next": [
                "Weekly strategist execution plans",
                "Offer and pricing optimization",
                "More advanced growth and operations support",
            ],
        },
    }

    return {"blueprint": blueprint}

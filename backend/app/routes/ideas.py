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
            "idea": idea,
            "target_customer": audience,
            "revenue_goal": revenue_goal,
            "time_commitment": time_commitment,
        },
        "startup_requirements": [
            {"task": "Write one clear before/after transformation promise.", "priority": "High"},
            {"task": "Create a one-page offer and booking link.", "priority": "High"},
            {"task": "Prepare outreach script for 30 prospects.", "priority": "High"},
        ],
        "next_steps_timeline": [
            {"window": "Days 1-3", "action": "Interview 5 target customers and capture exact pain-point language."},
            {"window": "Days 4-7", "action": "Publish the starter offer page and message first 15 prospects."},
            {"window": "Days 8-14", "action": "Book 5 calls, close 1-2 paid pilots, and refine objections script."},
            {"window": "Days 15-30", "action": "Deliver to first clients, capture testimonials, and raise starter price."},
        ],
        "monetization_roadmap": {
            "revenue_model": "Fixed-scope starter sprint with upsell into recurring support.",
            "first_offer": _format_offer(idea),
            "pricing_idea": "Start at $49-$149 beta price, then increase after first 3 measurable results.",
            "customer_acquisition": f"Direct outreach + referral asks targeting {audience}.",
        },
        "offer_positioning": {
            "positioning_statement": f"{business_name} helps {audience} solve '{idea}' with an actionable sprint and measurable results.",
            "core_promise": "Visible progress in 14 days with fixed scope and hands-on support.",
            "differentiator": "Execution-first delivery built for beginners who need practical weekly actions.",
        },
        "customer_avatar": {
            "profile": audience,
            "pain_points": [
                "Wants faster results but lacks a clear implementation roadmap.",
                "Has limited time and needs simple weekly execution steps.",
                "Will pay for speed, clarity, and accountability.",
            ],
            "buying_triggers": [
                "Clear outcome in less than 30 days.",
                "Starter pricing with low risk.",
                "Proof from similar customers.",
            ],
        },
        "first_30_day_execution_plan": [
            {"week": "Week 1", "objective": "Build offer + sales assets", "actions": ["Define offer", "Set booking flow", "Create outreach script"]},
            {"week": "Week 2", "objective": "Acquire first buyers", "actions": ["Run daily outreach", "Hold discovery calls", "Close pilots"]},
            {"week": "Week 3", "objective": "Deliver first wins", "actions": ["Deliver sprint", "Track outcomes", "Collect testimonial"]},
            {"week": "Week 4", "objective": "Systemize + optimize", "actions": ["Improve messaging", "Raise price", "Start referral sequence"]},
        ],
        "upgrade_recommendation": {
            "recommended_path": "Upgrade to Pro once first 3 customers are closed; move to Elite for team, systems, and scaling support.",
            "triggers": [
                "Need repeatable lead generation workflows.",
                "Need deeper pricing and conversion optimization.",
                "Need operating system support beyond founder-only execution.",
            ],
        },
    }

    return {"blueprint": blueprint}

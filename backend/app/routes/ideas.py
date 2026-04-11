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
        "plan": "Starter Business Blueprint",
        "business_name": business_name,
        "headline": _headline_from_idea(idea),
        "positioning": {
            "problem": f"People struggle to execute '{idea}' consistently.",
            "audience": audience,
            "promise": "Deliver a measurable result in 14 days using a simple execution system.",
        },
        "offer": {
            "name": "Starter Validation Offer",
            "description": _format_offer(idea),
            "starter_price": "$49-$149 beta price",
        },
        "execution_plan": [
            "Day 1-3: Interview 5 target customers and capture exact language.",
            "Day 4-7: Publish a one-page offer and a direct outreach script.",
            "Day 8-14: Run outreach to 30 prospects and book 5 calls.",
            "Day 15-30: Deliver to first 3 customers and collect testimonials.",
        ],
        "metrics": {
            "revenue_target": revenue_goal,
            "time_commitment": time_commitment,
            "north_star": "First 3 paying customers",
        },
        "upgrade_path": {
            "pro": {
                "when_to_upgrade": "Upgrade when you have your first 3 customers and need repeatable growth.",
                "unlocks": [
                    "Automated weekly execution sprints",
                    "Offer optimization playbooks",
                    "Monetization dashboard and conversion tracking",
                ],
                "cta": "Upgrade to Pro to systemize lead flow and close rates.",
            },
            "elite": {
                "when_to_upgrade": "Upgrade when you are scaling and need full implementation support.",
                "unlocks": [
                    "Done-with-you implementation guidance",
                    "Advanced growth experiments",
                    "Leadership and operations support",
                ],
                "cta": "Upgrade to Elite to scale beyond founder bottlenecks.",
            },
        },
    }

    return {"blueprint": blueprint}
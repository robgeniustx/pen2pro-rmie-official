from typing import Any

from fastapi import APIRouter
from pydantic import BaseModel, Field

router = APIRouter()


class StarterBlueprintRequest(BaseModel):
    idea: str = Field(..., min_length=8, max_length=4000)
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
        f"{niche} customer acquisition assistant",
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
            {"task": "Confirm business name entered by user", "priority": "High"},
            {"task": "Check domain availability", "priority": "High"},
            {"task": "Register domain if available", "priority": "High"},
            {"task": "Set up Google Business Profile", "priority": "High"},
            {"task": "Set up Apple Maps / Apple Business Connect", "priority": "High"},
            {"task": "Set up social handles on Facebook, Instagram, TikTok, and LinkedIn", "priority": "High"},
            {"task": "Set up booking/contact form", "priority": "High"},
            {"task": "Set up review collection system", "priority": "Medium"},
            {"task": "Set up local SEO", "priority": "Medium"},
        ],
        "launch_plan_30_days": {
            "week_1": "Confirm business name entered by user, check domain availability, register domain if available, set up Google Business Profile, set up Apple Maps / Apple Business Connect, set up Facebook/Instagram/TikTok/LinkedIn business profiles, and create basic logo, brand colors, and tagline.",
            "week_2": "Build simple landing page or starter website, add contact form or booking form, create first offer, create pricing package, and prepare sales script plus outreach message.",
            "week_3": "Begin customer outreach, post before-and-after or proof-based content, ask for first reviews, add reviews to website and Google Business Profile, and start local SEO content.",
            "week_4": "Raise pricing after first customers, launch monthly or recurring offer, add email/SMS follow-up, and push customers toward Pro or Elite if they need full strategy support.",
        },
        "monetization_roadmap": {
            "revenue_model": "Starter sprint offer → standard package → monthly retainer upsell.",
            "first_offer": _format_offer(idea),
            "pricing_idea": "Beta at $49-$149, then move to $199-$499 after first 3 wins.",
            "customer_acquisition": "Direct outreach + referral asks + short proof-based content.",
        },
        "upgrade_recommendation": {
            "recommended_tier": "elite",
            "why_now": "Ready to unlock the full PEN2PRO business buildout?",
            "what_unlocks_next": [
                "This free blueprint gives you the starting map. Elite unlocks the deeper execution system, including entity setup guidance, domain strategy, branding direction, pricing systems, customer acquisition, CRM setup, payment setup, and 90-day growth execution.",
                "Elite Offer: First month only $99.",
            ],
            "cta_button": "Unlock Elite Strategy",
            "route": "/pricing",
        },
        "sources": [
            {"name": "Google Business Profile", "url": "https://www.google.com/business/"},
            {"name": "Apple Business Connect", "url": "https://businessconnect.apple.com/"},
        ],
    }

    return {"blueprint": blueprint}

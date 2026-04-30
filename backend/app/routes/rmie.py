from typing import Any

from fastapi import APIRouter, HTTPException
from openai import OpenAI
from pydantic import BaseModel, Field
import os

from app.services.rmie_engine import build_starter_business_blueprint_with_fallback

router = APIRouter()

def _as_text(value: Any, fallback: str = "") -> str:
    if value is None:
        return fallback
    return str(value).strip() or fallback

class StarterGenerateRequest(BaseModel):
    tier: str = "starter"
    userTier: str | None = None

    businessName: str | None = Field(default=None, max_length=140)
    proposedBusinessName: str | None = Field(default=None, max_length=140)

    domain: str | None = Field(default=None, max_length=220)
    suggestedDomain: str | None = Field(default=None, max_length=220)
    domainToCheck: str | None = Field(default=None, max_length=220)

    businessIdea: str | None = Field(default=None, max_length=240)
    idea: str | None = Field(default=None, max_length=240)

    category: str | None = None
    businessType: str | None = Field(default=None, max_length=140)

    productOrService: str | None = Field(default=None, max_length=180)
    product_service: str | None = Field(default=None, max_length=180)

    targetCustomer: str | None = Field(default=None, max_length=180)
    customer: str | None = Field(default=None, max_length=180)

    location: str | None = Field(default=None, max_length=180)
    marketLocation: str | None = Field(default=None, max_length=180)

    skillLevel: str | None = Field(default=None, max_length=80)
    skill_level: str | None = Field(default=None, max_length=80)

    timeAvailability: Any | None = None
    time_available: Any | None = None

    currentStage: str | None = Field(default=None, max_length=80)
    current_stage: str | None = Field(default=None, max_length=80)

    skillsAndResources: str | None = Field(default=None, max_length=240)
    skillsResources: str | None = Field(default=None, max_length=240)
    resources: str | None = Field(default=None, max_length=240)

    budget: str | None = Field(default=None, max_length=120)
    startupBudget: str | None = Field(default=None, max_length=120)

    incomeGoal: str | None = Field(default=None, max_length=120)
    income_goal: str | None = Field(default=None, max_length=120)

    biggestObstacle: str | None = Field(default=None, max_length=240)
    obstacle: str | None = Field(default=None, max_length=240)

    urgencyLevel: str | None = Field(default=None, max_length=20)
    urgency_level: str | None = Field(default=None, max_length=20)

    deliveryPreference: str | None = Field(default=None, max_length=20)
    delivery_preference: str | None = Field(default=None, max_length=20)

    accessLevel: str | None = "free"
    accessTier: str | None = None
    tierAccess: str | None = None

    strategistFocus: str | None = None
    strategistMode: str | None = None

    class Config:
        extra = "allow"


ALLOWED_ACCESS_LEVELS = {"free", "pro", "elite"}
ALLOWED_TEST_TIERS = ["free", "pro", "elite", "founder"]
ALLOWED_STRATEGIST_FOCUS = {
    "startup",
    "brand",
    "monetization",
    "marketing",
    "operations",
    "legal_foundation",
    "legal",
    "foundation",
}


def clean_text(value: Any, fallback: str = "Details will be defined during execution.") -> str:
    if value is None:
        return fallback
    cleaned = str(value).strip()
    return cleaned if cleaned else fallback


def clean_optional_text(value: Any) -> str:
    return clean_text(value, "")


def normalize_access_level(value: Any) -> str:
    access_level = str(value or "free").lower().strip()
    return access_level if access_level in ALLOWED_ACCESS_LEVELS else "free"


def normalize_strategist_focus(access_level: str, value: Any) -> str:
    if access_level == "free":
        return "basic"

    strategist_focus = str(value or "startup").lower().strip()
    if strategist_focus not in ALLOWED_STRATEGIST_FOCUS:
        return "startup"
    if strategist_focus in {"legal", "foundation"}:
        return "legal_foundation"
    return strategist_focus


def normalize_user_tier(value: Any) -> str:
    requested_tier = str(value or "free").lower().strip()
    return requested_tier if requested_tier in ALLOWED_TEST_TIERS else "free"


@router.post("/rmie/starter-generate")
def starter_generate(request: StarterGenerateRequest):
    payload = request.model_dump() if hasattr(request, "model_dump") else request.dict()
    user_tier = normalize_user_tier(payload.get("userTier"))

    access_level = normalize_access_level(
        payload.get("accessLevel") or payload.get("accessTier") or payload.get("tierAccess")
    )
    strategist_focus = normalize_strategist_focus(
        access_level,
        payload.get("strategistFocus") or payload.get("strategistMode"),
    )

    business_idea = clean_optional_text(payload.get("businessIdea") or payload.get("idea"))
    if not business_idea:
        raise HTTPException(
            status_code=400,
            detail="Please describe the business idea before generating your blueprint.",
        )

    normalized = {
        "tier": "starter",
        "businessName": clean_text(
            payload.get("businessName") or payload.get("proposedBusinessName"), "your business"
        ),
        "proposedBusinessName": clean_text(
            payload.get("proposedBusinessName") or payload.get("businessName"), "your business"
        ),
        "domain": clean_optional_text(
            payload.get("domain") or payload.get("domainToCheck") or payload.get("suggestedDomain")
        ),
        "domainToCheck": clean_optional_text(
            payload.get("domainToCheck") or payload.get("domain") or payload.get("suggestedDomain")
        ),
        "businessIdea": business_idea,
        "category": clean_text(payload.get("category")),
        "businessType": clean_text(payload.get("businessType") or payload.get("category"), "General"),
        "productOrService": clean_text(
            payload.get("productOrService") or payload.get("product_service")
        ),
        "targetCustomer": clean_text(payload.get("targetCustomer") or payload.get("customer")),
        "location": clean_text(payload.get("location")),
        "marketLocation": clean_text(payload.get("marketLocation") or payload.get("location")),
        "skillLevel": clean_text(payload.get("skillLevel") or payload.get("skill_level"), "Beginner"),
        "timeAvailability": clean_text(
            payload.get("timeAvailability") or payload.get("time_available"), "5-10 focused hours per week"
        ),
        "currentStage": clean_text(payload.get("currentStage") or payload.get("current_stage")),
        "skillsAndResources": clean_text(
            payload.get("skillsAndResources") or payload.get("skillsResources") or payload.get("resources")
        ),
        "skillsResources": clean_text(
            payload.get("skillsResources") or payload.get("skillsAndResources") or payload.get("resources")
        ),
        "budget": clean_text(payload.get("budget") or payload.get("startupBudget"), "Lean launch budget under $500"),
        "startupBudget": clean_text(
            payload.get("startupBudget") or payload.get("budget"), "Lean launch budget under $500"
        ),
        "incomeGoal": clean_text(payload.get("incomeGoal") or payload.get("income_goal")),
        "biggestObstacle": clean_text(payload.get("biggestObstacle") or payload.get("obstacle")),
        "urgencyLevel": clean_text(payload.get("urgencyLevel") or payload.get("urgency_level"), "medium").lower(),
        "deliveryPreference": clean_text(
            payload.get("deliveryPreference") or payload.get("delivery_preference"), "online"
        ).lower(),
        "accessLevel": access_level,
        "accessTier": access_level,
        "strategistFocus": strategist_focus,
    }

    model_by_tier = {
        "free": os.getenv("OPENAI_MODEL_FREE", "gpt-5.4-mini"),
        "pro": os.getenv("OPENAI_MODEL_PRO", "gpt-5.4-mini"),
        "elite": os.getenv("OPENAI_MODEL_ELITE", "gpt-5.4-mini"),
        "founder": os.getenv("OPENAI_MODEL_ELITE", "gpt-5.4-mini"),
    }
    selected_model = model_by_tier.get(user_tier, "gpt-5.4-mini")

    tier_instructions = {
        "free": """Build a valuable but limited startup blueprint.
Include only these sections in order:
1. Business Snapshot
2. Target Customer
3. Startup Requirements
4. Licenses & Compliance
5. Basic Offer Structure
6. Basic Sales Script
Stop after Basic Sales Script.
Do not include outreach strategy, advanced monetization, entity structuring, trademark guidance, advanced branding, social media marketing plan, business credit, funding roadmap, funnel strategy, or scaling roadmap.""",
        "pro": """Include everything in Free, plus:
1. Outreach Strategy
2. Monetization Strategy
3. Pricing Ladder
4. Customer Acquisition Plan
5. 30-Day Execution Plan
6. CRM/Follow-Up Strategy
7. Basic Brand Positioning
8. Revenue Pathway
Make Pro clearly stronger than Free.""",
        "elite": """Include everything in Free and Pro, plus:
1. Entity Structure Options: LLC, S-Corp, C-Corp, 501(c)(3) if applicable
2. Business Name Ideas
3. Tagline Options
4. Brand Positioning
5. Logo Direction
6. Color Palette Suggestions with HEX codes
7. Font Direction
8. Domain and Social Handle Checklist
9. Trademark Readiness Checklist
10. Full Sales Funnel
11. Social Media Marketing Plan
12. Funding/Business Credit Roadmap
13. Operations System
14. 90-Day Scaling Plan
15. High-Ticket Offer Strategy
16. Founder-Level Action Plan
Make Elite feel like a premium strategist-level business plan.""",
        "founder": """Include everything in Elite, plus:
1. Advanced Monetization Strategy
2. Multiple Revenue Streams
3. Automation Opportunities
4. Hiring/Contractor Roadmap
5. SOP Checklist
6. Investor/Lender Readiness
7. Brand Authority Strategy
8. Long-Term Scale Roadmap
9. Full Execution Timeline
10. CEO-Level Next Steps
Make Founder feel like an executive business development plan.""",
    }

    prompt = f"""
You are PEN2PRO RMIE, an advanced business development strategist.

PEN2PRO means From Idea to Income. The system should help aspiring entrepreneurs turn ideas into structured, executable business plans.

Business idea:
{business_idea}

User tier:
{user_tier}

{tier_instructions[user_tier]}

Output rules:
- Be specific.
- Avoid vague motivational filler.
- Give practical steps the user can act on immediately.
- Use clean headings.
- Use bullet points where helpful.
- Make the output feel professional enough for a serious entrepreneur.
- Do not tell the user to consult ChatGPT.
- Do not mention internal model names.
- Do not expose backend or API details.
""".strip()

    blueprint: Any = None
    api_key = os.getenv("OPENAI_API_KEY", "")
    if api_key:
        try:
            openai = OpenAI(api_key=api_key)
            response = openai.responses.create(
                model=selected_model,
                input=prompt,
            )
            blueprint = response.output_text
        except Exception:
            blueprint = None

    if not blueprint:
        blueprint = build_starter_business_blueprint_with_fallback(normalized)

    return {
        "success": True,
        "tier": user_tier,
        "model": selected_model,
        "accessLevel": access_level,
        "accessTier": access_level,
        "strategistFocus": strategist_focus,
        "blueprint": blueprint,
    }

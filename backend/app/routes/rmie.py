from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.rmie_engine import build_starter_business_blueprint_with_fallback

router = APIRouter()

def _as_text(value: Any, fallback: str = "") -> str:
    if value is None:
        return fallback
    return str(value).strip() or fallback

class StarterGenerateRequest(BaseModel):
    tier: str = "starter"

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


@router.post("/rmie/starter-generate")
def starter_generate(request: StarterGenerateRequest):
    payload = request.model_dump() if hasattr(request, "model_dump") else request.dict()

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

    blueprint = build_starter_business_blueprint_with_fallback(normalized)
    return {
        "success": True,
        "tier": "starter",
        "accessLevel": access_level,
        "accessTier": access_level,
        "strategistFocus": strategist_focus,
        "blueprint": blueprint,
    }

from typing import Any

from fastapi import APIRouter, HTTPException

from app.services.rmie_engine import build_starter_business_blueprint

router = APIRouter()

def _as_text(value: Any, fallback: str = "") -> str:
    if value is None:
        return fallback
    return str(value).strip() or fallback


def _normalize_payload(payload: dict[str, Any]) -> dict[str, Any]:
    access_level = _as_text(payload.get("accessLevel") or payload.get("accessTier") or payload.get("tier"), "free").lower()
    if access_level not in {"free", "pro", "elite"}:
        access_level = "free"

    strategist_focus = _as_text(payload.get("strategistFocus") or payload.get("strategistMode"), "startup").lower()
    if access_level == "free":
        strategist_focus = "basic"
    elif not strategist_focus:
        strategist_focus = "startup"

    business_idea = _as_text(payload.get("businessIdea") or payload.get("idea"))
    if not business_idea:
        raise HTTPException(status_code=400, detail="Please describe the business idea before generating your blueprint.")

    business_name = _as_text(payload.get("businessName") or payload.get("proposedBusinessName"), "your business")
    domain = _as_text(payload.get("domain") or payload.get("suggestedDomain") or payload.get("domainToCheck"))

    return {
        **payload,
        "tier": "starter",
        "accessLevel": access_level,
        "accessTier": access_level,
        "strategistFocus": strategist_focus,
        "businessName": business_name,
        "proposedBusinessName": business_name,
        "domain": domain,
        "domainToCheck": domain,
        "businessIdea": business_idea,
        "businessType": _as_text(payload.get("businessType") or payload.get("category"), "Not provided"),
        "category": _as_text(payload.get("category") or payload.get("businessType"), "Not provided"),
        "productOrService": _as_text(payload.get("productOrService") or payload.get("product_service"), "Not provided"),
        "targetCustomer": _as_text(payload.get("targetCustomer") or payload.get("customer"), "Not provided"),
        "location": _as_text(payload.get("location"), "Online"),
        "marketLocation": _as_text(payload.get("marketLocation") or payload.get("location"), "Online"),
        "budget": _as_text(payload.get("budget") or payload.get("startupBudget"), "Not provided"),
        "startupBudget": _as_text(payload.get("startupBudget") or payload.get("budget"), "Not provided"),
        "skillLevel": _as_text(payload.get("skillLevel"), "Beginner"),
        "timeAvailability": _as_text(payload.get("timeAvailability") or payload.get("time_available"), "Not provided"),
        "urgencyLevel": _as_text(payload.get("urgencyLevel"), "medium").lower(),
        "currentStage": _as_text(payload.get("currentStage"), "Not provided"),
        "skillsResources": _as_text(payload.get("skillsResources") or payload.get("skillsAndResources") or payload.get("resources"), "Not provided"),
        "skillsAndResources": _as_text(payload.get("skillsAndResources") or payload.get("skillsResources") or payload.get("resources"), "Not provided"),
        "incomeGoal": _as_text(payload.get("incomeGoal"), "Not provided"),
        "biggestObstacle": _as_text(payload.get("biggestObstacle") or payload.get("obstacle"), "Not provided"),
        "deliveryPreference": _as_text(payload.get("deliveryPreference"), "both").lower(),
    }


@router.post("/rmie/starter-generate")
def starter_generate(payload: dict[str, Any]):
    normalized_payload = _normalize_payload(payload)
    blueprint = build_starter_business_blueprint(normalized_payload)
    return {
        "success": True,
        "tier": "starter",
        "accessLevel": normalized_payload["accessLevel"],
        "strategistFocus": normalized_payload["strategistFocus"],
        "blueprint": blueprint,
    }

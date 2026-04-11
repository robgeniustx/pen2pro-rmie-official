from typing import Literal

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.services.rmie_engine import build_starter_business_blueprint

router = APIRouter()


class StarterGenerateRequest(BaseModel):
    tier: Literal["starter"]
    businessIdea: str = Field(..., min_length=3, max_length=240)
    productOrService: str = Field(..., min_length=3, max_length=180)
    targetCustomer: str = Field(..., min_length=3, max_length=180)
    marketLocation: str = Field(..., min_length=2, max_length=180)
    startupBudget: str = Field(..., min_length=1, max_length=120)
    skillsResources: str = Field(..., min_length=3, max_length=240)
    incomeGoal: str = Field(..., min_length=2, max_length=120)
    biggestObstacle: str = Field(..., min_length=3, max_length=240)
    deliveryPreference: Literal["online", "local", "both"]


@router.post("/rmie/starter-generate")
def starter_generate(payload: StarterGenerateRequest):
    blueprint = build_starter_business_blueprint(payload.dict())
    return {
        "tier": payload.tier,
        "blueprint": blueprint,
    }
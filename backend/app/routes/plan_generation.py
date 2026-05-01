from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.services.rmie_engine import PlanRequest, engine


router = APIRouter()


class GeneratePlanPayload(BaseModel):
    business_name: str = Field(..., min_length=2, max_length=120)
    niche: str = Field(..., min_length=2, max_length=120)
    stage: str = Field(default="early-stage", min_length=2, max_length=60)
    budget_monthly: float = Field(default=1000, ge=0)
    goals: list[str] = Field(default_factory=list)
    session_id: str = Field(default="default-session", min_length=3, max_length=120)
    platforms: list[str] = Field(default_factory=lambda: ["Instagram", "Facebook", "TikTok"])


@router.post("/plan/generate")
def generate_plan(payload: GeneratePlanPayload):
    request = PlanRequest(
        business_name=payload.business_name,
        niche=payload.niche,
        stage=payload.stage,
        budget_monthly=payload.budget_monthly,
        goals=payload.goals,
        session_id=payload.session_id,
        platforms=payload.platforms,
    )
    return engine.generate(request)

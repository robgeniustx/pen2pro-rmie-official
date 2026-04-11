from fastapi import APIRouter
from pydantic import BaseModel, Field

router = APIRouter()


class FounderCheckoutRequest(BaseModel):
    tier_id: str = Field(..., min_length=2, max_length=50)

@router.get("/stripe-status")
def stripe_status():
    return {"stripe": "not connected yet"}


@router.post("/founder-checkout")
def founder_checkout(payload: FounderCheckoutRequest):
    return {
        "ok": True,
        "tier_id": payload.tier_id,
        "sessionId": f"founder_{payload.tier_id}_demo_session",
        "message": "Founder checkout session created.",
    }
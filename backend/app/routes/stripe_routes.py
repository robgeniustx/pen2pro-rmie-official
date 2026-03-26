from fastapi import APIRouter

router = APIRouter()

@router.get("/stripe-status")
def stripe_status():
    return {"stripe": "not connected yet"}
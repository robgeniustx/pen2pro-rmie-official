from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter()

# In-memory store keeps the flow simple for early validation and demos.
waitlist_emails: set[str] = set()


class WaitlistRequest(BaseModel):
    email: str = Field(..., min_length=5, max_length=255)
    goal: str = Field(default="launch")
    source: str = Field(default="homepage")


@router.post("/waitlist")
def join_waitlist(payload: WaitlistRequest):
    email = payload.email.strip().lower()

    if "@" not in email or "." not in email.split("@")[-1]:
        raise HTTPException(status_code=400, detail="Please provide a valid email address")

    already_joined = email in waitlist_emails
    waitlist_emails.add(email)

    return {
        "ok": True,
        "already_joined": already_joined,
        "waitlist_size": len(waitlist_emails),
        "message": "You are on the PEN2PRO waitlist.",
    }

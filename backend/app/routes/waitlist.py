from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from datetime import date, datetime, timedelta

from app.core.config import settings

router = APIRouter()

# In-memory store keeps the flow simple for early validation and demos.
waitlist_emails: set[str] = set()


class WaitlistRequest(BaseModel):
    email: str = Field(..., min_length=5, max_length=255)
    goal: str = Field(default="launch")
    source: str = Field(default="homepage")


def _get_launch_date() -> date:
    launch_value = (settings.SITE_LAUNCH_DATE or "").strip()
    if launch_value:
        try:
            return datetime.strptime(launch_value, "%Y-%m-%d").date()
        except ValueError as exc:
            raise HTTPException(
                status_code=500,
                detail="SITE_LAUNCH_DATE must use YYYY-MM-DD format",
            ) from exc
    return date.today()


@router.post("/waitlist")
def join_waitlist(payload: WaitlistRequest):
    email = payload.email.strip().lower()

    if "@" not in email or "." not in email.split("@")[-1]:
        raise HTTPException(status_code=400, detail="Please provide a valid email address")

    launch_date = _get_launch_date()
    waitlist_closes_on = launch_date + timedelta(days=3)
    today = date.today()

    if today > waitlist_closes_on:
        raise HTTPException(
            status_code=410,
            detail="Waitlist period ended 3 days after launch date.",
        )

    already_joined = email in waitlist_emails
    waitlist_emails.add(email)

    return {
        "ok": True,
        "already_joined": already_joined,
        "waitlist_size": len(waitlist_emails),
        "launch_date": launch_date.isoformat(),
        "waitlist_window_days": 3,
        "waitlist_closes_on": waitlist_closes_on.isoformat(),
        "message": "You are on the PEN2PRO waitlist.",
    }

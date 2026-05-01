from datetime import datetime, timezone

from fastapi import APIRouter
from pydantic import BaseModel, Field

router = APIRouter()

# Lightweight in-memory event log for conversion tuning during early-stage iterations.
MAX_EVENTS = 500
events_log: list[dict] = []


class EventPayload(BaseModel):
    event_name: str = Field(..., min_length=2, max_length=100)
    source: str = Field(default="direct", max_length=255)
    properties: dict = Field(default_factory=dict)


@router.post("/events")
def capture_event(payload: EventPayload):
    event = {
        "event_name": payload.event_name,
        "source": payload.source,
        "properties": payload.properties,
        "captured_at": datetime.now(timezone.utc).isoformat(),
    }

    events_log.append(event)
    if len(events_log) > MAX_EVENTS:
        events_log.pop(0)

    return {"ok": True}


@router.get("/events/summary")
def events_summary():
    summary: dict[str, int] = {}
    for event in events_log:
        name = event["event_name"]
        summary[name] = summary.get(name, 0) + 1

    return {
        "total_events": len(events_log),
        "event_counts": summary,
        "latest_events": events_log[-10:],
    }

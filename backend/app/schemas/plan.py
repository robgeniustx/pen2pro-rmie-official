"""
Plan output schema for the PEN2PRO API.
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Optional

from pydantic import BaseModel, Field


def _utcnow() -> datetime:
    return datetime.now(tz=timezone.utc)


class AgentSection(BaseModel):
    """Holds the structured JSON output from one specialist agent."""
    data: dict[str, Any] = Field(default_factory=dict)
    error: Optional[str] = None


class PlanMeta(BaseModel):
    crewai_available: bool = False
    llm_connected: bool = False
    agents_run: list[str] = Field(default_factory=list)
    model: str = "none"


class PlanOutput(BaseModel):
    plan_id: str
    session_id: str
    user_tier: str
    engine: str  # "crewai" | "fallback" | "fallback-error"

    # High-level outputs
    opportunity_score: int = Field(ge=0, le=100)
    summary: str

    # Per-agent sections (all optional — depend on tier)
    sections: dict[str, Any] = Field(default_factory=dict)

    # Run metadata
    run_duration_seconds: float = 0.0
    created_at: datetime = Field(default_factory=_utcnow)
    meta: PlanMeta = Field(default_factory=PlanMeta)

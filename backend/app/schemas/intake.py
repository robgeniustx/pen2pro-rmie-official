"""
Full intake schema for the PEN2PRO plan generation pipeline.
Maps to Stage A of the intake → plan workflow.
"""
from __future__ import annotations

import uuid
from typing import Optional

from pydantic import BaseModel, Field


class FullIntakeSchema(BaseModel):
    # Identity
    user_name: str = Field(default="Founder", max_length=120)
    business_name: str = Field(..., min_length=2, max_length=120)

    # Stage A — business context
    business_stage: str = Field(
        default="idea",
        description="idea | pre-revenue | early-stage | growth | established",
    )
    skill_set: list[str] = Field(default_factory=list)
    budget_monthly: float = Field(default=500.0, ge=0)
    timeline_months: int = Field(default=6, ge=1, le=60)
    target_customer: str = Field(default="", max_length=500)
    offer_idea: str = Field(default="", max_length=1000)
    local_or_online: str = Field(
        default="online",
        description="local | online | hybrid",
    )
    revenue_goal: float = Field(default=5000.0, ge=0)
    constraints: str = Field(default="", max_length=500)

    # Additional context
    niche: str = Field(default="", max_length=200)
    goals: list[str] = Field(default_factory=list)
    platforms: list[str] = Field(
        default_factory=lambda: ["Instagram", "Facebook", "TikTok"]
    )

    # System fields
    session_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_tier: str = Field(
        default="free",
        description="free | pro | elite | founder",
    )
    plan_id: Optional[str] = None

"""
Admin API routes — analytics and oversight.

Endpoints:
  GET /api/admin/analytics  → Aggregate stats
  GET /api/admin/plans      → All plans (lightweight)
  GET /api/admin/founders   → Founder-tier plans
  GET /api/admin/utm        → UTM event stub (extend with your analytics layer)
"""
from __future__ import annotations

from fastapi import APIRouter, Query

from app.db.mongodb import MONGO_AVAILABLE, _db, count_plans, get_user_plans

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/analytics")
async def get_analytics():
    """Aggregate plan counts and tier breakdown."""
    if not MONGO_AVAILABLE or _db is None:
        return {
            "status": "mongodb_not_connected",
            "message": "Set MONGODB_URL env var to enable persistence and analytics.",
            "total_plans": 0,
            "tier_breakdown": {},
        }

    total = await count_plans()
    completed = await count_plans({"status": "completed"})
    tier_breakdown = {}
    for tier in ("free", "pro", "elite", "founder"):
        tier_breakdown[tier] = await count_plans({"user_tier": tier})

    return {
        "total_plans": total,
        "completed_plans": completed,
        "tier_breakdown": tier_breakdown,
    }


@router.get("/plans")
async def list_all_plans(
    limit: int = Query(default=20, ge=1, le=200),
):
    """List all plans — summary view only (sections omitted for payload size)."""
    if not MONGO_AVAILABLE or _db is None:
        return {"plans": [], "message": "MongoDB not connected"}

    try:
        cursor = (
            _db.plans
            .find({}, {"_id": 0, "sections": 0, "intake": 0})
            .sort("created_at", -1)
            .limit(limit)
        )
        plans = await cursor.to_list(length=limit)
        return {"plans": plans, "count": len(plans)}
    except Exception:  # noqa: BLE001
        return {"plans": [], "error": "Query failed"}


@router.get("/founders")
async def list_founders(
    limit: int = Query(default=50, ge=1, le=200),
):
    """List plans from founder-tier users."""
    if not MONGO_AVAILABLE or _db is None:
        return {"founders": [], "message": "MongoDB not connected"}

    try:
        cursor = (
            _db.plans
            .find({"user_tier": "founder"}, {"_id": 0, "sections": 0})
            .sort("created_at", -1)
            .limit(limit)
        )
        founders = await cursor.to_list(length=limit)
        return {"founders": founders, "count": len(founders)}
    except Exception:  # noqa: BLE001
        return {"founders": [], "error": "Query failed"}


@router.get("/utm")
async def get_utm_events():
    """UTM / attribution event stub. Extend with your own analytics pipeline."""
    return {
        "message": "UTM tracking endpoint ready. Connect your analytics pipeline here.",
        "events": [],
    }

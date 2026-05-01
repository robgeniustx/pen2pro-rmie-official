"""
MongoDB async data layer (motor).
Gracefully no-ops when MONGODB_URL is not set.
"""
from __future__ import annotations

import os
from typing import Any, Optional

MONGO_AVAILABLE = False
_db: Any = None

try:
    from motor.motor_asyncio import AsyncIOMotorClient

    _mongo_url = os.getenv("MONGODB_URL", "")
    if _mongo_url:
        _client = AsyncIOMotorClient(_mongo_url, serverSelectionTimeoutMS=5000)
        _db_name = os.getenv("MONGODB_DB_NAME", "pen2pro")
        _db = _client.get_database(_db_name)
        MONGO_AVAILABLE = True
except ImportError:
    pass  # motor not installed — all calls degrade gracefully


# ---------------------------------------------------------------------------
# Plans
# ---------------------------------------------------------------------------

async def save_plan(doc: dict[str, Any]) -> bool:
    """Upsert a plan document by plan_id. Returns True on success."""
    if not MONGO_AVAILABLE or _db is None:
        return False
    try:
        await _db.plans.update_one(
            {"plan_id": doc["plan_id"]},
            {"$set": doc},
            upsert=True,
        )
        return True
    except Exception:  # noqa: BLE001
        return False


async def get_plan(plan_id: str) -> Optional[dict[str, Any]]:
    """Retrieve a plan by plan_id. Returns None if not found or DB unavailable."""
    if not MONGO_AVAILABLE or _db is None:
        return None
    try:
        return await _db.plans.find_one({"plan_id": plan_id}, {"_id": 0})
    except Exception:  # noqa: BLE001
        return None


async def get_user_plans(
    session_id: Optional[str] = None,
    user_tier: Optional[str] = None,
    limit: int = 20,
) -> list[dict[str, Any]]:
    """List plans with optional session / tier filter."""
    if not MONGO_AVAILABLE or _db is None:
        return []
    try:
        query: dict[str, Any] = {}
        if session_id:
            query["session_id"] = session_id
        if user_tier:
            query["user_tier"] = user_tier
        cursor = (
            _db.plans
            .find(query, {"_id": 0})
            .sort("created_at", -1)
            .limit(limit)
        )
        return await cursor.to_list(length=limit)
    except Exception:  # noqa: BLE001
        return []


async def count_plans(query: Optional[dict] = None) -> int:
    """Count plan documents matching a query."""
    if not MONGO_AVAILABLE or _db is None:
        return 0
    try:
        return await _db.plans.count_documents(query or {})
    except Exception:  # noqa: BLE001
        return 0


# ---------------------------------------------------------------------------
# Intake submissions
# ---------------------------------------------------------------------------

async def save_intake(doc: dict[str, Any]) -> bool:
    """Store raw intake submission for audit / replay."""
    if not MONGO_AVAILABLE or _db is None:
        return False
    try:
        await _db.intake_submissions.insert_one(doc)
        return True
    except Exception:  # noqa: BLE001
        return False


# ---------------------------------------------------------------------------
# Agent run logs
# ---------------------------------------------------------------------------

async def log_agent_run(log: dict[str, Any]) -> bool:
    """Log an agent run for analytics and debugging."""
    if not MONGO_AVAILABLE or _db is None:
        return False
    try:
        await _db.agent_logs.insert_one(log)
        return True
    except Exception:  # noqa: BLE001
        return False

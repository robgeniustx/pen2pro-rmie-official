"""
User CRUD — MongoDB with in-memory fallback for local dev.
"""
from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any, Optional

from app.db.mongodb import MONGO_AVAILABLE, _db

# ---------------------------------------------------------------------------
# In-memory fallback store (resets on restart — dev only)
# ---------------------------------------------------------------------------
_users_fallback: dict[str, dict] = {}  # keyed by email


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


# ---------------------------------------------------------------------------
# Public helpers
# ---------------------------------------------------------------------------

async def get_user_by_email(email: str) -> Optional[dict[str, Any]]:
    email = email.lower().strip()
    if MONGO_AVAILABLE and _db is not None:
        try:
            doc = await _db.users.find_one({"email": email}, {"_id": 0})
            return doc
        except Exception:
            pass
    return _users_fallback.get(email)


async def get_user_by_id(user_id: str) -> Optional[dict[str, Any]]:
    if MONGO_AVAILABLE and _db is not None:
        try:
            doc = await _db.users.find_one({"user_id": user_id}, {"_id": 0})
            return doc
        except Exception:
            pass
    for user in _users_fallback.values():
        if user.get("user_id") == user_id:
            return user
    return None


async def create_user(email: str, hashed_password: str, tier: str = "free") -> dict[str, Any]:
    email = email.lower().strip()
    user = {
        "user_id": str(uuid.uuid4()),
        "email": email,
        "hashed_password": hashed_password,
        "tier": tier,
        "created_at": _now(),
        "updated_at": _now(),
    }
    if MONGO_AVAILABLE and _db is not None:
        try:
            await _db.users.insert_one({**user, "_id": user["user_id"]})
        except Exception:
            pass
    _users_fallback[email] = user
    return user


async def update_user_tier(user_id: str, tier: str) -> bool:
    """Called by Stripe webhook to upgrade a user's tier."""
    update = {"tier": tier, "updated_at": _now()}
    if MONGO_AVAILABLE and _db is not None:
        try:
            await _db.users.update_one({"user_id": user_id}, {"$set": update})
        except Exception:
            pass
    for user in _users_fallback.values():
        if user.get("user_id") == user_id:
            user.update(update)
            return True
    return False


def safe_user(user: dict) -> dict:
    """Strip sensitive fields before sending to frontend."""
    return {k: v for k, v in user.items() if k not in ("hashed_password", "_id")}

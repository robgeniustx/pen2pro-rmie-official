"""
Auth routes — signup, login, /me, logout (client-side token drop).
"""
from __future__ import annotations

import re

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.core.deps import get_current_user
from app.core.security import create_access_token, hash_password, verify_password
from app.db.users import create_user, get_user_by_email, safe_user

router = APIRouter(prefix="/auth", tags=["auth"])

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


class SignupRequest(BaseModel):
    email: str = Field(..., min_length=5, max_length=255)
    password: str = Field(..., min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: str
    password: str


def _validate_email(email: str) -> str:
    email = email.strip().lower()
    if not EMAIL_RE.match(email):
        raise HTTPException(status_code=400, detail="Invalid email address")
    return email


# ---------------------------------------------------------------------------
# POST /api/auth/signup
# ---------------------------------------------------------------------------

@router.post("/signup", status_code=status.HTTP_201_CREATED)
async def signup(payload: SignupRequest):
    email = _validate_email(payload.email)

    existing = await get_user_by_email(email)
    if existing:
        raise HTTPException(status_code=409, detail="An account with that email already exists")

    if len(payload.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")

    hashed = hash_password(payload.password)
    user = await create_user(email=email, hashed_password=hashed, tier="free")
    token = create_access_token({"sub": user["user_id"], "tier": user["tier"]})

    return {
        "ok": True,
        "access_token": token,
        "token_type": "bearer",
        "user": safe_user(user),
    }


# ---------------------------------------------------------------------------
# POST /api/auth/login
# ---------------------------------------------------------------------------

@router.post("/login")
async def login(payload: LoginRequest):
    email = _validate_email(payload.email)

    user = await get_user_by_email(email)
    if not user or not verify_password(payload.password, user.get("hashed_password", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": user["user_id"], "tier": user["tier"]})

    return {
        "ok": True,
        "access_token": token,
        "token_type": "bearer",
        "user": safe_user(user),
    }


# ---------------------------------------------------------------------------
# GET /api/auth/me
# ---------------------------------------------------------------------------

@router.get("/me")
async def me(current_user: dict = Depends(get_current_user)):
    return {"ok": True, "user": safe_user(current_user)}


# ---------------------------------------------------------------------------
# POST /api/auth/logout  (client drops token; endpoint is a no-op signal)
# ---------------------------------------------------------------------------

@router.post("/logout")
async def logout():
    return {"ok": True, "message": "Logged out. Please discard your token."}

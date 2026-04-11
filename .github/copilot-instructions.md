# PEN2PRO Project Guidelines

## Scope
- Preserve exact brand spelling: PEN2PRO.
- Keep changes focused and incremental; do not redesign the full app unless explicitly requested.
- Prefer extending existing patterns in `frontend/src` and `backend/app`.

## Architecture
- Frontend: React + Vite app in `frontend/`.
- Backend: FastAPI service in `backend/app/`.
- API routes live in `backend/app/routes/`.
- Shared backend business logic should live in `backend/app/services/`.

## Core Rules
- Never hard-code business facts into UI content.
- All niche-specific factual outputs must come from backend retrieval and citations.
- Separate facts, estimates, assumptions, and recommendations.
- Prefer typed schemas and explicit validation.
- Responses should be structured for rendering into cards, checklists, timelines, and budget views.
- Keep components clean, modular, and production-ready.
- Never remove citation fields from API responses.
- Favor readable code over clever code.

## Frontend Conventions
- Use JavaScript (`.jsx`/`.js`) to match the repo.
- Prefer small reusable components and page-level composition.
- Reuse existing API helpers in `frontend/src/services/api.js`.
- Preserve existing pricing and navigation behavior unless the task asks for changes.
- Keep UX clean, mobile-friendly, and conversion-focused.

## Backend Conventions
- Add new endpoints in route modules under `backend/app/routes/`.
- Register new route modules in `backend/app/main.py` with `prefix="/api"`.
- Use Pydantic request models for validation.
- Keep lightweight generation and transformation logic in `backend/app/services/`.

## Build And Validation
- Frontend lint: `cd frontend && npm run lint`
- Frontend build: `cd frontend && npm run build`
- Backend local run: `cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`

## Delivery Expectations
- Implement working behavior, not placeholder stubs.
- Add concise error handling and loading states for async flows.
- Keep copy direct, practical, and action-oriented for growth workflows.

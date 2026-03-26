from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.health import router as health_router
from app.routes.ideas import router as ideas_router
from app.routes.pricing import router as pricing_router
from app.routes.stripe_routes import router as stripe_router

app = FastAPI(title="PEN2PRO RMIE API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router, prefix="/api")
app.include_router(ideas_router, prefix="/api")
app.include_router(pricing_router, prefix="/api")
app.include_router(stripe_router, prefix="/api")

@app.get("/")
def root():
    return {"message": "PEN2PRO RMIE API is live"}
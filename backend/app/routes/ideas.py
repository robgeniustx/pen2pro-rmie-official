from fastapi import APIRouter

router = APIRouter()

@router.get("/ideas")
def get_ideas(niche: str = "general business"):
    ideas = [
        f"{niche} lead generation system",
        f"{niche} monetization blueprint",
        f"{niche} AI content workflow",
        f"{niche} offer creation engine",
        f"{niche} customer acquisition assistant"
    ]
    return {"niche": niche, "ideas": ideas}
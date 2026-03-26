from fastapi import APIRouter

router = APIRouter()

@router.get("/pricing")
def pricing():
    return {
        "plans": [
            {"name": "Starter", "price": 0},
            {"name": "Pro", "price": 49},
            {"name": "Elite", "price": 149}
        ]
    }
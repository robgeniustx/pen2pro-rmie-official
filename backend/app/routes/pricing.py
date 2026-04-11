from fastapi import APIRouter

router = APIRouter()

@router.get("/pricing")
def pricing():
    return {
        "plans": [
            {
                "name": "Starter",
                "price": 0,
                "display_price": "Free forever",
                "billing_period": "",
            },
            {
                "name": "Pro",
                "price": 79,
                "display_price": "$79",
                "billing_period": "/month",
            },
            {
                "name": "Elite",
                "price": 199,
                "display_price": "$199",
                "billing_period": "/month",
            }
        ]
    }
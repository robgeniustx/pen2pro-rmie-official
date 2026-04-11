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
                "tagline": "Start building with zero monthly cost.",
                "features": [
                    "Business roadmap starter structure",
                    "Launch checklist baseline",
                    "Foundational planning prompts",
                ],
                "cta_label": "Get Started Free",
                "featured": False,
            },
            {
                "name": "Pro",
                "price": 79,
                "display_price": "$79",
                "billing_period": "/month",
                "tagline": "Best-value plan for launch-focused growth.",
                "features": [
                    "Everything in Starter",
                    "Social growth strategy toolkit",
                    "Expanded planning and execution depth",
                ],
                "cta_label": "Choose Pro",
                "featured": True,
            },
            {
                "name": "Elite",
                "price": 199,
                "display_price": "$199",
                "billing_period": "/month",
                "tagline": "Full-depth support for ambitious execution.",
                "features": [
                    "Everything in Pro",
                    "Advanced strategy support",
                    "Priority implementation guidance",
                ],
                "cta_label": "Choose Elite",
                "featured": False,
            }
        ]
    }
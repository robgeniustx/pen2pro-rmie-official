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
                "tagline": "Launch your first plan with zero monthly cost.",
                "features": [
                    "1 business roadmap workspace",
                    "30-day launch checklist",
                    "Core cost and risk snapshot",
                    "Foundational planning prompts",
                    "Email support",
                ],
                "cta_label": "Get Started Free",
                "featured": False,
            },
            {
                "name": "Pro",
                "price": 99,
                "display_price": "$99",
                "billing_period": "/month",
                "tagline": "Best-value plan for founders ready to launch and grow.",
                "features": [
                    "Everything in Starter",
                    "Unlimited roadmap workspaces",
                    "Social growth strategy toolkit",
                    "Pricing and offer optimization prompts",
                    "Execution timeline with milestone tracking",
                    "Priority support",
                ],
                "cta_label": "Choose Pro",
                "featured": True,
            },
            {
                "name": "Elite",
                "price": 249,
                "display_price": "$249",
                "billing_period": "/month",
                "tagline": "Advanced strategic support for scaling teams.",
                "features": [
                    "Everything in Pro",
                    "Advanced growth and scale planning",
                    "Investor-ready planning outputs",
                    "Dedicated strategy review cadence",
                    "Fast-lane support response",
                ],
                "cta_label": "Choose Elite",
                "featured": False,
            }
        ]
    }
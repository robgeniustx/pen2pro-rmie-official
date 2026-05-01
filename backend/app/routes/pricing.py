from fastapi import APIRouter

router = APIRouter()

@router.get("/pricing")
def pricing():
    return {
        "plans": [
            {
                "name": "Foundation",
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
                "badge_text": "Free Forever",
                "cta_label": "Free Forever",
                "featured": False,
            },
            {
                "name": "Strategist Level",
                "price": 99,
                "display_price": "$99",
                "billing_period": "/month",
                "tagline": "Best-value plan for founders ready to launch and grow.",
                "features": [
                    "Everything in Foundation",
                    "Unlimited roadmap workspaces",
                    "Social growth strategy toolkit",
                    "Pricing and offer optimization prompts",
                    "Execution timeline with milestone tracking",
                    "Priority support",
                ],
                "badge_text": "Most Popular",
                "cta_label": "Choose Strategist Level",
                "featured": True,
            },
            {
                "name": "Full Business Buildout",
                "price": 249,
                "display_price": "$249",
                "billing_period": "/month",
                "tagline": "Advanced strategic support for scaling teams.",
                "features": [
                    "Everything in Strategist Level",
                    "Advanced growth and scale planning",
                    "Investor-ready planning outputs",
                    "Dedicated strategy review cadence",
                    "Fast-lane support response",
                ],
                "badge_text": "Scale Fast",
                "cta_label": "Choose Full Business Buildout",
                "featured": False,
            }
        ]
    }
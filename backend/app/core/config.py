import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    APP_NAME = "PEN2PRO RMIE API"
    STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY", "")
    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

settings = Settings()
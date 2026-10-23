"""
JOBSHIELD AI - Application Configuration
"""

import os
from pydantic import BaseModel


class Settings(BaseModel):
    APP_NAME: str = "JOBSHIELD AI"
    API_PREFIX: str = "/api/v1"
    DEBUG: bool = os.getenv("DEBUG", "False").lower() in ("true", "1", "yes")
    PORT: int = int(os.getenv("PORT", 8000))
    HOST: str = os.getenv("HOST", "0.0.0.0")
    MODELS_DIR: str = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "models"))
    DATA_DIR: str = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data"))


settings = Settings()

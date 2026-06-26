import os
from pydantic import Field
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "SuryaShield AI"
    API_V1_STR: str = "/api/v1"
    
    # WebSocket config
    WS_HEARTBEAT_INTERVAL: int = 2
    
    # Data Settings
    SIMULATION_SPEED: float = 1.0
    
    # Model config
    MODEL_PATH: str = "weights/cnn_lstm_v1.pth"
    
    # DB config
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./surya_shield.db")

    # API Keys (optional — used for LLM-powered features)
    GROQ_API_KEY: Optional[str] = None
    GEMINI_API_KEY: Optional[str] = None
    
    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "ignore"

settings = Settings()


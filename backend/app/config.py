import os
from pydantic import Field
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "SuryaShield AI"
    API_V1_STR: str = "/api/v1"
    
    # WebSocket config
    WS_HEARTBEAT_INTERVAL: int = 2
    
    # Synthetic Data Settings
    SIMULATION_SPEED: float = 1.0  # 1.0 means real-time (1 second = 1 second)
    
    # Model config
    MODEL_PATH: str = "weights/cnn_lstm_v1.pth"
    
    # DB config
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./surya_shield.db")
    
    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()

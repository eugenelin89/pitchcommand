from typing import List, Union
from pydantic import AnyHttpUrl
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "PitchCommand API"
    API_V1_STR: str = "/api/v1"

    # CORS Configuration
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = []

    # Database Configuration
    SQLITE_URL: str = "sqlite:///./pitchcommand.db"

    # Redis Configuration
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379

    # Model Configuration
    MODEL_CACHE_TTL: int = 3600  # 1 hour
    PREDICTION_HISTORY_SIZE: int = 5

    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60

    class Config:
        case_sensitive = True
        env_file = ".env"


settings = Settings()

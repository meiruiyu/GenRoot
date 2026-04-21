from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    PROJECT_NAME: str = "RootsAtlas API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    MINIMAX_API_KEY: Optional[str] = None
    MINIMAX_API_BASE: str = "https://api.minimax.chat/v1"

    DATABASE_URL: str = "sqlite:///./rootsatlas.db"

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
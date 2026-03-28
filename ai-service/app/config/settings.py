from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Google Gemini Settings
    GEMINI_API_KEY: str
    GEMINI_MODEL: str = "gemini-pro"
    
    # Supabase Settings
    SUPABASE_URL: str
    SUPABASE_KEY: str
    
    # Server Settings
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    
    # App Settings
    DEBUG: bool = False
    LOG_LEVEL: str = "INFO"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

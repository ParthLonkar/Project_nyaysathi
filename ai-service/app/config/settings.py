from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # OpenAI Settings
    OPENAI_API_KEY: str
    OPENAI_MODEL: str = "gpt-4"
    
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

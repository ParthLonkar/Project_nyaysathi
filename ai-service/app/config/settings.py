from pydantic import AliasChoices, Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Google Gemini Settings
    GEMINI_API_KEY: str
    GEMINI_MODEL: str = "gemini-pro"

    # Supabase Settings
    SUPABASE_URL: str
    SUPABASE_KEY: str = Field(
        validation_alias=AliasChoices("SUPABASE_KEY", "SUPABASE_ANON_KEY")
    )

    # Server Settings
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000

    # App Settings
    DEBUG: bool = False
    LOG_LEVEL: str = "INFO"

    @field_validator("DEBUG", mode="before")
    @classmethod
    def parse_debug(cls, value):
        if isinstance(value, str):
            v = value.strip().lower()
            if v in {"release", "prod", "production"}:
                return False
            if v in {"debug", "dev", "development"}:
                return True
        return value

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore",
    )


settings = Settings()

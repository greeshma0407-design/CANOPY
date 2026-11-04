"""Configuration settings for CANOPY backend."""
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    DATABASE_URL: str = "sqlite:///./canopy.db"
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000"
    METHODOLOGY_VERSION: str = "1.0.0-stage3-auth"

    # Authentication & Security
    JWT_SECRET_KEY: str = "canopy-super-secret-auth-key-2026-campus-accounting"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    REMEMBER_ME_EXPIRE_DAYS: int = 30
    AUTH_COOKIE_NAME: str = "canopy_access_token"
    COOKIE_SECURE: bool = False  # Set to True in production HTTPS
    COOKIE_SAMESITE: str = "lax"

    # Seed passwords (can be overridden via environment variables)
    SEED_ADMIN_PASSWORD: str = "CanopyAdmin2026!"
    SEED_MANAGER_PASSWORD: str = "CanopyManager2026!"
    SEED_OPERATOR_PASSWORD: str = "CanopyOperator2026!"
    SEED_VIEWER_PASSWORD: str = "CanopyViewer2026!"

    @property
    def allowed_origins_list(self) -> List[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",")]


settings = Settings()

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
    ENVIRONMENT: str = "development"
    ALLOWED_ORIGINS: str = (
        "http://localhost:5173,http://localhost:3000,"
        "http://127.0.0.1:5173,http://127.0.0.1:3000,"
        "https://canopy-vki6.onrender.com"
    )
    CORS_ORIGIN_REGEX: str = r"^https://.*\.onrender\.com$"
    METHODOLOGY_VERSION: str = "1.0.0-stage3-auth"

    # One-time reference emission factor seeding (disabled by default)
    CANOPY_SEED_EMISSION_FACTORS_ONCE: bool = False

    # Authentication & Security
    JWT_SECRET_KEY: str = "canopy-local-development-only-change-before-deployment"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24
    REMEMBER_ME_EXPIRE_DAYS: int = 30
    AUTH_COOKIE_NAME: str = "canopy_access_token"
    COOKIE_SECURE: bool = False
    COOKIE_SAMESITE: str = "lax"

    # Development seed passwords only
    SEED_ADMIN_PASSWORD: str = "CanopyAdmin2026!"
    SEED_MANAGER_PASSWORD: str = "CanopyManager2026!"
    SEED_OPERATOR_PASSWORD: str = "CanopyOperator2026!"
    SEED_VIEWER_PASSWORD: str = "CanopyViewer2026!"

    @property
    def allowed_origins_list(self) -> List[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",") if o.strip()]

    @property
    def effective_cookie_secure(self) -> bool:
        if self.COOKIE_SECURE:
            return True
        if self.ENVIRONMENT.lower() == "production" or self.effective_cookie_samesite.lower() == "none":
            return True
        return False

    @property
    def effective_cookie_samesite(self) -> str:
        if self.ENVIRONMENT.lower() == "production" and self.COOKIE_SAMESITE.lower() == "lax":
            return "none"
        return self.COOKIE_SAMESITE


settings = Settings()
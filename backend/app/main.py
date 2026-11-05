"""CANOPY FastAPI application entry point with Authentication & RBAC."""
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import (
    analytics,
    auth,
    calculations,
    campuses,
    health,
    invitations,
    recommendations,
    records,
    reports,
    scenarios,
    users,
)

logger = logging.getLogger("canopy.startup")


def sanitize_log_message(msg: object) -> str:
    """Mask any connection credentials (passwords, tokens) before logging."""
    import re
    return re.sub(r'(://[^:@/\s]+):.*@([^/\s:@]+(?:[:/]\S*)?)', r'\1:***@\2', str(msg))


def run_startup_seeding_if_enabled() -> dict | None:
    """Execute reference emission factor seeding if CANOPY_SEED_EMISSION_FACTORS_ONCE is enabled.

    Reuses scripts.seed_emission_factors.seed_factors (idempotent, transactional).
    Never touches campus, user, inventory, or calculation records.
    """
    if getattr(settings, "CANOPY_SEED_EMISSION_FACTORS_ONCE", False):
        print(
            "[CANOPY STARTUP] CANOPY_SEED_EMISSION_FACTORS_ONCE=true detected. Seeding reference emission factors...",
            flush=True,
        )
        logger.info(
            "[CANOPY STARTUP] CANOPY_SEED_EMISSION_FACTORS_ONCE=true detected. Seeding reference emission factors..."
        )
        try:
            from scripts.seed_emission_factors import seed_factors
            stats = seed_factors(dry_run=False)
            msg = (
                f"[CANOPY STARTUP] Emission factor seeding completed successfully: "
                f"{stats.get('inserted', 0)} inserted, {stats.get('skipped', 0)} skipped."
            )
            print(msg, flush=True)
            logger.info(msg)
            return stats
        except Exception as exc:
            safe_err = sanitize_log_message(exc)
            err_msg = f"[CANOPY STARTUP ERROR] Emission factor seeding failed: {safe_err}"
            print(err_msg, flush=True)
            logger.error(err_msg)
            raise
    else:
        msg = "[CANOPY STARTUP] CANOPY_SEED_EMISSION_FACTORS_ONCE is disabled. Skipping emission factor seeding."
        print(msg, flush=True)
        logger.info(msg)
        return None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: optional one-time reference emission factor seeding."""
    run_startup_seeding_if_enabled()
    yield


app = FastAPI(
    title="CANOPY Carbon Accounting API",
    description="Campus carbon emissions accounting, reporting platform, and RBAC user management",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS configuration supporting credentials (cookies and Authorization headers)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_origin_regex=settings.CORS_ORIGIN_REGEX if settings.CORS_ORIGIN_REGEX else None,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API v1 prefix
PREFIX = "/api/v1"

# Unauthenticated / Public routes
app.include_router(health.router, prefix=PREFIX)
app.include_router(auth.router, prefix=PREFIX)

# Authenticated & RBAC routes
app.include_router(campuses.router, prefix=PREFIX)
app.include_router(invitations.router, prefix=PREFIX)
app.include_router(users.router, prefix=PREFIX)
app.include_router(calculations.router, prefix=PREFIX)
app.include_router(records.router, prefix=PREFIX)
app.include_router(analytics.router, prefix=PREFIX)
app.include_router(scenarios.router, prefix=PREFIX)
app.include_router(recommendations.router, prefix=PREFIX)
app.include_router(reports.router, prefix=PREFIX)


@app.get("/")
def root():
    return {"message": "CANOPY API — see /docs for API reference"}

"""CANOPY FastAPI application entry point with Authentication & RBAC."""
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

app = FastAPI(
    title="CANOPY Carbon Accounting API",
    description="Campus carbon emissions accounting, reporting platform, and RBAC user management",
    version="1.0.0",
)

# CORS configuration supporting credentials (cookies and Authorization headers)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
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

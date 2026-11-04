"""Health check router."""
from fastapi import APIRouter
from app.config import settings

router = APIRouter(tags=["health"])


@router.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "CANOPY Carbon Accounting API",
        "methodology_version": settings.METHODOLOGY_VERSION,
    }

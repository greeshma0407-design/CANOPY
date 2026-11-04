"""Calculation router — preview endpoint with authentication."""
from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.dependencies import require_any_authenticated
from app.database import get_db
from app.models.user import User
from app.schemas.calculation import CalculationPreviewRequest, CalculationPreviewResponse
from app.services.calculation_service import calculation_service

router = APIRouter(prefix="/calculations", tags=["calculations"])


@router.post("/preview", response_model=CalculationPreviewResponse)
def preview_calculation(
    payload: CalculationPreviewRequest,
    geography: str = Query(default="IN-Telangana"),
    db: Session = Depends(get_db),
    _: User = Depends(require_any_authenticated),
):
    """Preview emission calculations against active factors (Authenticated users)."""
    ref_date: Optional[date] = None
    if payload.reference_date:
        try:
            ref_date = date.fromisoformat(payload.reference_date)
        except ValueError:
            ref_date = None

    return calculation_service.calculate_preview(
        db=db,
        items=payload.items,
        reference_date=ref_date,
        campus_geography=geography,
    )

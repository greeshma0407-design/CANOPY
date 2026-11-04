"""Scenarios router with multi-campus tenant isolation and RBAC."""
from datetime import date as date_type
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.dependencies import require_any_authenticated, require_manager_or_admin
from app.database import get_db
from app.models.user import User
from app.schemas.scenario import (
    ScenarioCreate,
    ScenarioRead,
    ScenarioCompareRequest,
    ScenarioCompareResponse,
)
from app.services.scenario_service import scenario_service

router = APIRouter(prefix="/scenarios", tags=["scenarios"])


@router.post("", response_model=ScenarioRead, status_code=201)
def create_scenario(
    payload: ScenarioCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin),
):
    """Create a what-if scenario scoped to current user's campus."""
    if current_user.campus_id:
        payload.campus_id = current_user.campus_id
    return scenario_service.create_scenario(db, payload)


@router.get("", response_model=List[ScenarioRead])
def list_scenarios(
    campus_id: Optional[str] = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_any_authenticated),
):
    """List scenarios strictly scoped to current user's campus."""
    effective_campus_id = current_user.campus_id or campus_id
    if current_user.campus_id and campus_id and campus_id != current_user.campus_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot access scenarios from another campus.",
        )
    return scenario_service.list_scenarios(db, effective_campus_id)


@router.get("/{scenario_id}", response_model=ScenarioRead)
def get_scenario(
    scenario_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_any_authenticated),
):
    """Get single scenario with campus boundary check."""
    scenario = scenario_service.get_scenario(db, scenario_id)
    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")

    if current_user.campus_id and scenario.campus_id != current_user.campus_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot access scenarios from another campus.",
        )
    return scenario


@router.post("/compare", response_model=ScenarioCompareResponse)
def compare_scenarios(
    payload: ScenarioCompareRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_admin),
):
    """Compare two scenarios."""
    baseline = scenario_service.get_scenario(db, payload.scenario_a_id)
    proposed = scenario_service.get_scenario(db, payload.scenario_b_id)
    if not baseline or not proposed:
        raise HTTPException(status_code=404, detail="One or both scenarios not found")

    if current_user.campus_id and (
        baseline.campus_id != current_user.campus_id or proposed.campus_id != current_user.campus_id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot compare scenarios from another campus.",
        )

    ref_date = date_type.fromisoformat(payload.reference_date) if payload.reference_date else None
    return scenario_service.compare_scenarios(
        db,
        scenario_a_id=payload.scenario_a_id,
        scenario_b_id=payload.scenario_b_id,
        geography=payload.geography,
        reference_date=ref_date,
    )

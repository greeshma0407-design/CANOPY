"""Activity records router with multi-campus tenant isolation and RBAC."""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.dependencies import require_any_authenticated, require_operator_or_higher
from app.database import get_db
from app.models.user import User
from app.repositories.activity_repo import activity_repo
from app.schemas.activity import ActivityRecordCreate, ActivityRecordRead, ActivityRecordUpdate

router = APIRouter(prefix="/records", tags=["records"])


@router.post("", response_model=ActivityRecordRead, status_code=status.HTTP_201_CREATED)
def create_record(
    payload: ActivityRecordCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_operator_or_higher),
):
    """Create a new activity record scoped to the authenticated user's campus."""
    # Enforce tenant isolation: record always belongs to user's campus
    if current_user.campus_id:
        payload.campus_id = current_user.campus_id

    record = activity_repo.create(db, payload)
    return record


@router.get("", response_model=List[ActivityRecordRead])
def list_records(
    campus_id: Optional[str] = Query(default=None),
    period_id: Optional[str] = Query(default=None),
    category: Optional[str] = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_any_authenticated),
):
    """List activity records strictly scoped to the authenticated user's campus."""
    effective_campus_id = current_user.campus_id or campus_id

    # If user explicitly asks for another campus, return 403
    if current_user.campus_id and campus_id and campus_id != current_user.campus_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot access activity records from another campus.",
        )

    return activity_repo.list(db, campus_id=effective_campus_id, period_id=period_id, category=category)


@router.get("/{record_id}", response_model=ActivityRecordRead)
def get_record(
    record_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_any_authenticated),
):
    """Get single activity record with tenant boundary verification."""
    record = activity_repo.get(db, record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")

    if current_user.campus_id and record.campus_id != current_user.campus_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot access activity records from another campus.",
        )

    return record


@router.put("/{record_id}", response_model=ActivityRecordRead)
def update_record(
    record_id: str,
    payload: ActivityRecordUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_operator_or_higher),
):
    """Update an existing activity record with tenant boundary verification."""
    existing = activity_repo.get(db, record_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Record not found")

    if current_user.campus_id and existing.campus_id != current_user.campus_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot modify activity records belonging to another campus.",
        )

    updated = activity_repo.update(db, record_id, payload)
    return updated


@router.delete("/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_record(
    record_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_operator_or_higher),
):
    """Delete an activity record with tenant boundary verification."""
    existing = activity_repo.get(db, record_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Record not found")

    if current_user.campus_id and existing.campus_id != current_user.campus_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot delete activity records belonging to another campus.",
        )

    activity_repo.delete(db, record_id)
    return None

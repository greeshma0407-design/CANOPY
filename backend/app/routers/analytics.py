"""Analytics router — summary and trends with campus tenant isolation."""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.dependencies import require_any_authenticated
from app.database import get_db
from app.models.user import User
from app.services.analytics_service import analytics_service

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/summary")
def get_summary(
    campus_id: str = Query(...),
    period_id: str = Query(...),
    geography: str = Query(default="IN-Telangana"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_any_authenticated),
):
    """Retrieve campus carbon summary scoped to user's campus."""
    if current_user.campus_id and campus_id != current_user.campus_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot access carbon analytics from another campus.",
        )
    return analytics_service.get_summary(db, campus_id, period_id, geography)


@router.get("/trends")
def get_trends(
    campus_id: str = Query(...),
    geography: str = Query(default="IN-Telangana"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_any_authenticated),
):
    """Retrieve multi-period carbon trends scoped to user's campus."""
    if current_user.campus_id and campus_id != current_user.campus_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot access carbon trends from another campus.",
        )
    return analytics_service.get_trends(db, campus_id, geography)

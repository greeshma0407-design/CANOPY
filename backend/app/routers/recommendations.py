"""Recommendations router with authentication."""
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.dependencies import require_any_authenticated
from app.database import get_db
from app.models.recommendation import Recommendation
from app.models.user import User
from app.schemas.recommendation import RecommendationRead

router = APIRouter(prefix="/recommendations", tags=["recommendations"])


@router.get("", response_model=List[RecommendationRead])
def list_recommendations(
    category: Optional[str] = Query(default=None),
    status: Optional[str] = Query(default=None),
    is_active: Optional[bool] = Query(default=None),
    db: Session = Depends(get_db),
    _: User = Depends(require_any_authenticated),
):
    """Retrieve decarbonization recommendations (Authenticated users)."""
    q = db.query(Recommendation)
    if category:
        q = q.filter(Recommendation.category == category)
    if status:
        q = q.filter(Recommendation.status == status)
    if is_active is not None:
        q = q.filter(Recommendation.is_active == is_active)
    return q.order_by(Recommendation.priority).all()

"""Recommendations router with authentication and dynamic engine."""
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.dependencies import require_any_authenticated
from app.database import get_db
from app.models.recommendation import Recommendation
from app.models.user import User
from app.schemas.recommendation import RecommendationRead
from app.services.recommendation_service import recommendation_service

router = APIRouter(prefix="/recommendations", tags=["recommendations"])


@router.get("", response_model=List[RecommendationRead])
def list_recommendations(
    category: Optional[str] = Query(default=None),
    status: Optional[str] = Query(default=None),
    is_active: Optional[bool] = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_any_authenticated),
):
    """Retrieve dynamic decarbonization recommendations tailored to the authenticated campus."""
    campus_id = current_user.campus_id
    if campus_id:
        dynamic_recs = recommendation_service.get_recommendations_for_campus(
            db=db,
            campus_id=campus_id,
            category=category,
            status=status,
            is_active=is_active,
        )
        if dynamic_recs:
            return [RecommendationRead.model_validate(r) for r in dynamic_recs]

    # Fallback to stored recommendations if any exist in the database
    q = db.query(Recommendation)
    if category:
        q = q.filter(Recommendation.category == category)
    if status:
        q = q.filter(Recommendation.status == status)
    if is_active is not None:
        q = q.filter(Recommendation.is_active == is_active)
    return [RecommendationRead.model_validate(r) for r in q.order_by(Recommendation.priority).all()]

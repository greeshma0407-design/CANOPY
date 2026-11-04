"""Campus onboarding and profile management routes."""
import uuid
from datetime import timedelta
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.config import settings
from app.core.dependencies import get_current_user, get_current_campus_user, require_campus_admin
from app.core.security import create_access_token, hash_password
from app.database import get_db
from app.models.campus import Campus, ReportingPeriod
from app.models.user import User, UserRole
from app.schemas.campus import (
    CampusOnboardingRequest,
    CampusRead,
    CampusUpdate,
    OnboardingResponse,
    ReportingPeriodCreate,
    ReportingPeriodRead,
)
from app.schemas.user import UserRead

router = APIRouter(prefix="/campuses", tags=["campuses"])


@router.post("/onboard", response_model=OnboardingResponse, status_code=status.HTTP_201_CREATED)
def onboard_campus(
    payload: CampusOnboardingRequest,
    response: Response,
    db: Session = Depends(get_db),
):
    """Register a new institution/campus and provision its primary Campus Admin account."""
    admin_email = payload.admin_email.lower().strip()

    # Verify email uniqueness
    existing_user = db.query(User).filter(User.email == admin_email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"An account with email '{admin_email}' already exists. Please log in or use another email.",
        )

    # 1. Create Campus
    campus_id = f"campus-{uuid.uuid4().hex[:8]}"
    location_parts = [p for p in [payload.city, payload.state, payload.country] if p]
    location_str = ", ".join(location_parts) if location_parts else payload.campus_name

    total_pop = (payload.student_count or 0) + (payload.faculty_count or 0) + (payload.staff_count or 0)

    campus = Campus(
        id=campus_id,
        name=payload.campus_name.strip(),
        institution_name=payload.institution_name.strip(),
        institution_type=payload.institution_type or "College",
        location=location_str,
        city=payload.city.strip() if payload.city else None,
        state=payload.state.strip() if payload.state else None,
        country=payload.country.strip() if payload.country else "India",
        timezone=payload.timezone or "Asia/Kolkata",
        population=total_pop if total_pop > 0 else None,
        student_count=payload.student_count,
        faculty_count=payload.faculty_count,
        staff_count=payload.staff_count,
        campus_area_acres=payload.campus_area_acres,
        built_up_area_sq_m=payload.built_up_area_sq_m,
        building_count=payload.building_count,
        academic_year=payload.academic_year or "2025-2026",
        baseline_year=payload.baseline_year or "2023",
    )
    db.add(campus)

    # 2. Create initial Reporting Period
    period_id = f"period-{uuid.uuid4().hex[:8]}"
    reporting_period = ReportingPeriod(
        id=period_id,
        campus_id=campus_id,
        label=payload.reporting_period_label or "CY 2025",
        start_date=payload.reporting_period_start or "2025-01-01",
        end_date=payload.reporting_period_end or "2025-12-31",
        status="open",
    )
    db.add(reporting_period)

    # 3. Create initial CAMPUS_ADMIN user
    admin_user = User(
        id=f"usr-{uuid.uuid4().hex[:12]}",
        campus_id=campus_id,
        email=admin_email,
        full_name=payload.admin_name.strip(),
        hashed_password=hash_password(payload.admin_password),
        role=UserRole.CAMPUS_ADMIN.value,
        is_active=True,
    )
    db.add(admin_user)

    db.commit()
    db.refresh(campus)
    db.refresh(admin_user)

    # Generate JWT
    expires_delta = timedelta(days=settings.REMEMBER_ME_EXPIRE_DAYS)
    max_age_seconds = int(expires_delta.total_seconds())

    access_token = create_access_token(
        subject=admin_user.id,
        claims={
            "role": admin_user.role,
            "email": admin_user.email,
            "full_name": admin_user.full_name,
            "campus_id": campus.id,
        },
        expires_delta=expires_delta,
    )

    # Set HttpOnly cookie
    response.set_cookie(
        key=settings.AUTH_COOKIE_NAME,
        value=access_token,
        max_age=max_age_seconds,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
        path="/",
    )

    return OnboardingResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=max_age_seconds,
        user=UserRead.model_validate(admin_user),
        campus=CampusRead.model_validate(campus),
    )


@router.get("/me", response_model=CampusRead)
def get_my_campus(
    current_user: User = Depends(get_current_campus_user),
    db: Session = Depends(get_db),
):
    """Retrieve the campus profile for the authenticated user."""
    campus = db.query(Campus).filter(Campus.id == current_user.campus_id).first()
    if not campus:
        raise HTTPException(status_code=404, detail="Campus not found")
    return CampusRead.model_validate(campus)


@router.patch("/me", response_model=CampusRead)
def update_my_campus(
    payload: CampusUpdate,
    current_user: User = Depends(require_campus_admin),
    db: Session = Depends(get_db),
):
    """Update campus profile and institutional infrastructure parameters (Campus Admin only)."""
    campus = db.query(Campus).filter(Campus.id == current_user.campus_id).first()
    if not campus:
        raise HTTPException(status_code=404, detail="Campus not found")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(campus, field, value)

    # Recalculate population if counts were updated
    if any(k in update_data for k in ("student_count", "faculty_count", "staff_count")):
        students = campus.student_count or 0
        faculty = campus.faculty_count or 0
        staff = campus.staff_count or 0
        campus.population = students + faculty + staff

    db.commit()
    db.refresh(campus)
    return CampusRead.model_validate(campus)


@router.get("/me/periods", response_model=List[ReportingPeriodRead])
def get_my_campus_periods(
    current_user: User = Depends(get_current_campus_user),
    db: Session = Depends(get_db),
):
    """Retrieve all reporting periods configured for the current user's campus."""
    periods = db.query(ReportingPeriod).filter(ReportingPeriod.campus_id == current_user.campus_id).all()
    return [ReportingPeriodRead.model_validate(p) for p in periods]


@router.post("/me/periods", response_model=ReportingPeriodRead, status_code=status.HTTP_201_CREATED)
def create_campus_period(
    payload: ReportingPeriodCreate,
    current_user: User = Depends(require_campus_admin),
    db: Session = Depends(get_db),
):
    """Add a new reporting period to the current campus (Campus Admin only)."""
    period_id = payload.id or f"period-{uuid.uuid4().hex[:8]}"
    period = ReportingPeriod(
        id=period_id,
        campus_id=current_user.campus_id,
        start_date=payload.start_date,
        end_date=payload.end_date,
        label=payload.label,
        status=payload.status or "open",
    )
    db.add(period)
    db.commit()
    db.refresh(period)
    return ReportingPeriodRead.model_validate(period)

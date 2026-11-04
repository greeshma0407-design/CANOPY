"""Campus and ReportingPeriod schemas."""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.schemas.user import UserRead, validate_email_format


class CampusBase(BaseModel):
    name: str
    institution_name: Optional[str] = None
    institution_type: Optional[str] = None
    code: Optional[str] = None
    location: str
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    population: Optional[int] = None
    timezone: str = "UTC"

    # Population
    student_count: Optional[int] = None
    faculty_count: Optional[int] = None
    staff_count: Optional[int] = None

    # Infrastructure
    campus_area_acres: Optional[float] = None
    built_up_area_sq_m: Optional[float] = None
    building_count: Optional[int] = None

    # Reporting defaults
    academic_year: Optional[str] = None
    baseline_year: Optional[str] = None


class CampusCreate(CampusBase):
    id: Optional[str] = None


class CampusUpdate(BaseModel):
    name: Optional[str] = None
    institution_name: Optional[str] = None
    institution_type: Optional[str] = None
    code: Optional[str] = None
    location: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    population: Optional[int] = None
    timezone: Optional[str] = None
    student_count: Optional[int] = None
    faculty_count: Optional[int] = None
    staff_count: Optional[int] = None
    campus_area_acres: Optional[float] = None
    built_up_area_sq_m: Optional[float] = None
    building_count: Optional[int] = None
    academic_year: Optional[str] = None
    baseline_year: Optional[str] = None


class CampusRead(CampusBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CampusOnboardingRequest(BaseModel):
    # Institution Info
    institution_name: str = Field(..., min_length=2, max_length=150)
    institution_type: Optional[str] = Field("College", max_length=50)
    campus_name: str = Field(..., min_length=2, max_length=150)
    city: Optional[str] = Field(None, max_length=100)
    state: Optional[str] = Field(None, max_length=100)
    country: Optional[str] = Field("India", max_length=100)
    timezone: str = Field("Asia/Kolkata", max_length=50)

    # Campus Population
    student_count: Optional[int] = Field(0, ge=0)
    faculty_count: Optional[int] = Field(0, ge=0)
    staff_count: Optional[int] = Field(0, ge=0)

    # Campus Infrastructure
    campus_area_acres: Optional[float] = Field(None, ge=0)
    built_up_area_sq_m: Optional[float] = Field(None, ge=0)
    building_count: Optional[int] = Field(None, ge=0)

    # Reporting Cycle
    academic_year: Optional[str] = Field("2025-2026", max_length=50)
    reporting_period_label: Optional[str] = Field("CY 2025", max_length=100)
    reporting_period_start: Optional[str] = Field("2025-01-01", max_length=20)
    reporting_period_end: Optional[str] = Field("2025-12-31", max_length=20)
    baseline_year: Optional[str] = Field("2023", max_length=10)

    # Initial Campus Admin
    admin_name: str = Field(..., min_length=2, max_length=120)
    admin_email: str
    admin_password: str = Field(..., min_length=8, max_length=128)

    @field_validator("admin_email")
    @classmethod
    def check_email(cls, v: str) -> str:
        return validate_email_format(v)


class OnboardingResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserRead
    campus: CampusRead


class ReportingPeriodBase(BaseModel):
    campus_id: str
    start_date: str
    end_date: str
    label: str
    status: str = "open"


class ReportingPeriodCreate(ReportingPeriodBase):
    id: Optional[str] = None


class ReportingPeriodRead(ReportingPeriodBase):
    id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

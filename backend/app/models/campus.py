"""Campus and ReportingPeriod models."""
from __future__ import annotations
import uuid
from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import String, Integer, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.activity import ActivityRecord
    from app.models.calculation import CalculationRun
    from app.models.scenario import Scenario
    from app.models.report import Report
    from app.models.user import User
    from app.models.invitation import Invitation


class Campus(Base):
    __tablename__ = "campuses"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String, nullable=False)
    institution_name: Mapped[str | None] = mapped_column(String, nullable=True)
    institution_type: Mapped[str | None] = mapped_column(String, nullable=True)  # e.g. "University", "College", "Institute"
    code: Mapped[str | None] = mapped_column(String, nullable=True)
    location: Mapped[str] = mapped_column(String, nullable=False)
    city: Mapped[str | None] = mapped_column(String, nullable=True)
    state: Mapped[str | None] = mapped_column(String, nullable=True)
    country: Mapped[str | None] = mapped_column(String, nullable=True)
    timezone: Mapped[str] = mapped_column(String, nullable=False, default="UTC")

    # Population
    population: Mapped[int | None] = mapped_column(Integer, nullable=True)  # total population
    student_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    faculty_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    staff_count: Mapped[int | None] = mapped_column(Integer, nullable=True)

    # Infrastructure
    campus_area_acres: Mapped[float | None] = mapped_column(Float, nullable=True)
    built_up_area_sq_m: Mapped[float | None] = mapped_column(Float, nullable=True)
    building_count: Mapped[int | None] = mapped_column(Integer, nullable=True)

    # Reporting defaults
    academic_year: Mapped[str | None] = mapped_column(String, nullable=True)
    baseline_year: Mapped[str | None] = mapped_column(String, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    reporting_periods: Mapped[list[ReportingPeriod]] = relationship("ReportingPeriod", back_populates="campus")
    activity_records: Mapped[list[ActivityRecord]] = relationship("ActivityRecord", back_populates="campus")
    calculation_runs: Mapped[list[CalculationRun]] = relationship("CalculationRun", back_populates="campus")
    scenarios: Mapped[list[Scenario]] = relationship("Scenario", back_populates="campus")
    reports: Mapped[list[Report]] = relationship("Report", back_populates="campus")
    users: Mapped[list[User]] = relationship("User", back_populates="campus")
    invitations: Mapped[list[Invitation]] = relationship("Invitation", back_populates="campus")


class ReportingPeriod(Base):
    __tablename__ = "reporting_periods"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    campus_id: Mapped[str] = mapped_column(String, ForeignKey("campuses.id"), nullable=False)
    start_date: Mapped[str] = mapped_column(String, nullable=False)
    end_date: Mapped[str] = mapped_column(String, nullable=False)
    label: Mapped[str] = mapped_column(String, nullable=False)
    status: Mapped[str] = mapped_column(String, nullable=False, default="open")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    campus: Mapped[Campus] = relationship("Campus", back_populates="reporting_periods")
    activity_records: Mapped[list[ActivityRecord]] = relationship("ActivityRecord", back_populates="reporting_period")
    calculation_runs: Mapped[list[CalculationRun]] = relationship("CalculationRun", back_populates="reporting_period")
    reports: Mapped[list[Report]] = relationship("Report", back_populates="reporting_period")

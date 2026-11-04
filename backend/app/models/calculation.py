"""CalculationRun and CalculationLine models."""
from __future__ import annotations
import uuid
from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.campus import Campus, ReportingPeriod
    from app.models.activity import ActivityItem
    from app.models.emission_factor import EmissionFactor


class CalculationRun(Base):
    __tablename__ = "calculation_runs"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    campus_id: Mapped[str] = mapped_column(String, ForeignKey("campuses.id"), nullable=False)
    reporting_period_id: Mapped[str | None] = mapped_column(String, ForeignKey("reporting_periods.id"), nullable=True)
    scenario_id: Mapped[str | None] = mapped_column(String, ForeignKey("scenarios.id"), nullable=True)
    total_kg_co2e: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    completeness_status: Mapped[str] = mapped_column(String, nullable=False, default="no_data")
    methodology_version: Mapped[str] = mapped_column(String, nullable=False, default="1.0.0-stage2")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    campus: Mapped[Campus] = relationship("Campus", back_populates="calculation_runs")
    reporting_period: Mapped[ReportingPeriod | None] = relationship("ReportingPeriod", back_populates="calculation_runs")
    lines: Mapped[list[CalculationLine]] = relationship("CalculationLine", back_populates="calculation_run", cascade="all, delete-orphan")


class CalculationLine(Base):
    __tablename__ = "calculation_lines"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    calculation_run_id: Mapped[str] = mapped_column(String, ForeignKey("calculation_runs.id"), nullable=False)
    activity_item_id: Mapped[str | None] = mapped_column(String, ForeignKey("activity_items.id"), nullable=True)
    factor_id: Mapped[str] = mapped_column(String, ForeignKey("emission_factors.id"), nullable=False)
    activity_quantity: Mapped[float] = mapped_column(Float, nullable=False)
    activity_unit: Mapped[str] = mapped_column(String, nullable=False)
    factor_value: Mapped[float] = mapped_column(Float, nullable=False)
    emissions_kg_co2e: Mapped[float] = mapped_column(Float, nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    calculation_run: Mapped[CalculationRun] = relationship("CalculationRun", back_populates="lines")
    activity_item: Mapped[ActivityItem | None] = relationship("ActivityItem")
    emission_factor: Mapped[EmissionFactor] = relationship("EmissionFactor")

"""Scenario and ScenarioItem models."""
from __future__ import annotations
import uuid
from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.campus import Campus
    from app.models.emission_factor import EmissionFactor


class Scenario(Base):
    __tablename__ = "scenarios"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    campus_id: Mapped[str] = mapped_column(String, ForeignKey("campuses.id"), nullable=False)
    name: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    baseline_calculation_run_id: Mapped[str | None] = mapped_column(String, ForeignKey("calculation_runs.id"), nullable=True)
    status: Mapped[str] = mapped_column(String, nullable=False, default="active")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    campus: Mapped[Campus] = relationship("Campus", back_populates="scenarios")
    items: Mapped[list[ScenarioItem]] = relationship("ScenarioItem", back_populates="scenario", cascade="all, delete-orphan")


class ScenarioItem(Base):
    __tablename__ = "scenario_items"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    scenario_id: Mapped[str] = mapped_column(String, ForeignKey("scenarios.id"), nullable=False)
    category: Mapped[str] = mapped_column(String, nullable=False)
    activity_type: Mapped[str] = mapped_column(String, nullable=False)
    quantity: Mapped[float] = mapped_column(Float, nullable=False)
    unit: Mapped[str] = mapped_column(String, nullable=False)
    factor_id: Mapped[str | None] = mapped_column(String, ForeignKey("emission_factors.id"), nullable=True)
    subcategory: Mapped[str | None] = mapped_column(String, nullable=True)

    scenario: Mapped[Scenario] = relationship("Scenario", back_populates="items")
    emission_factor: Mapped[EmissionFactor | None] = relationship("EmissionFactor")

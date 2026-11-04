"""ActivityRecord and ActivityItem models."""
from __future__ import annotations
import uuid
from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.campus import Campus, ReportingPeriod
    from app.models.emission_factor import EmissionFactor


class ActivityRecord(Base):
    __tablename__ = "activity_records"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    campus_id: Mapped[str] = mapped_column(String, ForeignKey("campuses.id"), nullable=False)
    reporting_period_id: Mapped[str] = mapped_column(String, ForeignKey("reporting_periods.id"), nullable=False)
    category: Mapped[str] = mapped_column(String, nullable=False)
    status: Mapped[str] = mapped_column(String, nullable=False, default="draft")
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    data_source: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    campus: Mapped[Campus] = relationship("Campus", back_populates="activity_records")
    reporting_period: Mapped[ReportingPeriod] = relationship("ReportingPeriod", back_populates="activity_records")
    activity_items: Mapped[list[ActivityItem]] = relationship("ActivityItem", back_populates="activity_record", cascade="all, delete-orphan")


class ActivityItem(Base):
    __tablename__ = "activity_items"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    activity_record_id: Mapped[str] = mapped_column(String, ForeignKey("activity_records.id"), nullable=False)
    activity_type: Mapped[str] = mapped_column(String, nullable=False)
    quantity: Mapped[float] = mapped_column(Float, nullable=False)
    unit: Mapped[str] = mapped_column(String, nullable=False)
    subcategory: Mapped[str | None] = mapped_column(String, nullable=True)
    metadata_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    factor_id: Mapped[str | None] = mapped_column(String, ForeignKey("emission_factors.id"), nullable=True)

    activity_record: Mapped[ActivityRecord] = relationship("ActivityRecord", back_populates="activity_items")
    emission_factor: Mapped[EmissionFactor | None] = relationship("EmissionFactor")

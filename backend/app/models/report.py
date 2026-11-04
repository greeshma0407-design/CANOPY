"""Report model."""
from __future__ import annotations
import uuid
from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import String, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.campus import Campus, ReportingPeriod


class Report(Base):
    __tablename__ = "reports"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    campus_id: Mapped[str] = mapped_column(String, ForeignKey("campuses.id"), nullable=False)
    reporting_period_id: Mapped[str] = mapped_column(String, ForeignKey("reporting_periods.id"), nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
    format: Mapped[str] = mapped_column(String, nullable=False, default="csv")
    status: Mapped[str] = mapped_column(String, nullable=False, default="pending")
    file_path: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    campus: Mapped[Campus] = relationship("Campus", back_populates="reports")
    reporting_period: Mapped[ReportingPeriod] = relationship("ReportingPeriod", back_populates="reports")

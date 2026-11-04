"""Recommendation model."""
import uuid
from datetime import datetime
from sqlalchemy import String, Float, Integer, DateTime, Boolean, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Recommendation(Base):
    __tablename__ = "recommendations"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title: Mapped[str] = mapped_column(String, nullable=False)
    category: Mapped[str] = mapped_column(String, nullable=False)
    short_description: Mapped[str] = mapped_column(Text, nullable=False)
    rationale: Mapped[str | None] = mapped_column(Text, nullable=True)
    effort_level: Mapped[str] = mapped_column(String, nullable=False)
    impact_level: Mapped[str] = mapped_column(String, nullable=False)
    priority: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    rule_key: Mapped[str] = mapped_column(String, nullable=False, default="")
    assumptions: Mapped[str | None] = mapped_column(Text, nullable=True)
    co_benefits: Mapped[str | None] = mapped_column(Text, nullable=True)
    estimated_annual_savings_tco2e: Mapped[float | None] = mapped_column(Float, nullable=True)
    cost_estimate: Mapped[str | None] = mapped_column(String, nullable=True)
    payback_period: Mapped[str | None] = mapped_column(String, nullable=True)
    target_quarter: Mapped[str | None] = mapped_column(String, nullable=True)
    timeline: Mapped[str | None] = mapped_column(String, nullable=True)
    status: Mapped[str] = mapped_column(String, nullable=False, default="Not Started")
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

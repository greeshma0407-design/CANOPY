"""Recommendation schemas."""
from typing import Any, List, Optional
from pydantic import BaseModel


class RecommendationRead(BaseModel):
    id: str
    title: str
    category: str
    short_description: str
    rationale: Optional[str] = None
    effort_level: str
    impact_level: str
    priority: int
    rule_key: str
    assumptions: Optional[Any] = None
    co_benefits: Optional[Any] = None
    estimated_annual_savings_tco2e: Optional[float] = None
    cost_estimate: Optional[str] = None
    payback_period: Optional[str] = None
    target_quarter: Optional[str] = None
    timeline: Optional[str] = None
    status: str
    is_active: bool

    model_config = {"from_attributes": True}

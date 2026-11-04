"""Calculation schemas."""
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, field_validator


class PreviewItemInput(BaseModel):
    activity_type: str
    quantity: float
    unit: str
    category: str
    subcategory: Optional[str] = None

    @field_validator("quantity")
    @classmethod
    def quantity_non_negative(cls, v: float) -> float:
        if v < 0:
            raise ValueError("quantity must be >= 0")
        return v


class CalculationPreviewRequest(BaseModel):
    items: List[PreviewItemInput]
    reference_date: Optional[str] = None


class CalculationLineResult(BaseModel):
    activity_type: str
    category: str
    quantity: float
    unit: str
    factor_id: Optional[str] = None
    factor_value: Optional[float] = None
    emissions_kg_co2e: Optional[float] = None
    emissions_tco2e: Optional[float] = None
    status: str  # "calculated" | "missing_factor"
    notes: Optional[str] = None


class CalculationPreviewResponse(BaseModel):
    lines: List[CalculationLineResult]
    total_kg_co2e: float
    total_tco2e: float
    completeness_status: str  # complete | partial | no_data
    warnings: List[str] = []
    methodology_version: str

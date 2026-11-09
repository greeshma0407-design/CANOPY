"""Activity schemas."""
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, field_validator


VALID_CATEGORIES = {"electricity", "transport", "waste"}


class ActivityItemCreate(BaseModel):
    activity_type: str
    quantity: float
    unit: str
    subcategory: Optional[str] = None
    metadata_json: Optional[Dict[str, Any]] = None
    factor_id: Optional[str] = None

    @field_validator("quantity")
    @classmethod
    def quantity_non_negative(cls, v: float) -> float:
        if v < 0:
            raise ValueError("quantity must be >= 0")
        return v


class ActivityItemRead(BaseModel):
    id: str
    activity_record_id: str
    activity_type: str
    quantity: float
    unit: str
    subcategory: Optional[str] = None
    metadata_json: Optional[str] = None
    factor_id: Optional[str] = None

    model_config = {"from_attributes": True}


class ActivityRecordCreate(BaseModel):
    campus_id: str
    reporting_period_id: str
    category: str
    status: str = "draft"
    notes: Optional[str] = None
    data_source: Optional[str] = None
    items: List[ActivityItemCreate] = []

    @field_validator("category")
    @classmethod
    def category_valid(cls, v: str) -> str:
        if v not in VALID_CATEGORIES:
            raise ValueError(f"category must be one of {VALID_CATEGORIES}")
        return v


class ActivityRecordUpdate(BaseModel):
    category: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    data_source: Optional[str] = None
    items: Optional[List[ActivityItemCreate]] = None

    @field_validator("category")
    @classmethod
    def category_valid(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in VALID_CATEGORIES:
            raise ValueError(f"category must be one of {VALID_CATEGORIES}")
        return v


class ActivityRecordRead(BaseModel):
    id: str
    campus_id: str
    reporting_period_id: str
    category: str
    status: str
    notes: Optional[str] = None
    data_source: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    activity_items: List[ActivityItemRead] = []

    model_config = {"from_attributes": True}

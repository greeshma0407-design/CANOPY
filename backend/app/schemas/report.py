"""Report schemas."""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class ReportCreate(BaseModel):
    campus_id: str
    reporting_period_id: str
    title: str
    format: str = "csv"


class ReportRead(BaseModel):
    id: str
    campus_id: str
    reporting_period_id: str
    title: str
    format: str
    status: str
    file_path: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}

"""Scenario schemas."""
from typing import List, Optional
from pydantic import BaseModel


class ScenarioItemCreate(BaseModel):
    category: str
    activity_type: str
    quantity: float
    unit: str
    factor_id: Optional[str] = None
    subcategory: Optional[str] = None


class ScenarioItemRead(BaseModel):
    id: str
    scenario_id: str
    category: str
    activity_type: str
    quantity: float
    unit: str
    factor_id: Optional[str] = None
    subcategory: Optional[str] = None

    model_config = {"from_attributes": True}


class ScenarioCreate(BaseModel):
    campus_id: str
    name: str
    description: Optional[str] = None
    items: List[ScenarioItemCreate] = []


class ScenarioRead(BaseModel):
    id: str
    campus_id: str
    name: str
    description: Optional[str] = None
    status: str
    items: List[ScenarioItemRead] = []

    model_config = {"from_attributes": True}


class ScenarioCompareRequest(BaseModel):
    scenario_a_id: str
    scenario_b_id: str
    geography: str = "IN-Telangana"
    reference_date: Optional[str] = None


class ScenarioDelta(BaseModel):
    category: str
    activity_type: str
    scenario_a_kg: Optional[float] = None
    scenario_b_kg: Optional[float] = None
    delta_kg: Optional[float] = None


class ScenarioCompareResponse(BaseModel):
    scenario_a_id: str
    scenario_b_id: str
    scenario_a_total_kg_co2e: float
    scenario_b_total_kg_co2e: float
    delta_kg_co2e: float
    delta_tco2e: float
    completeness_status: str
    warnings: List[str] = []
    lines: List[ScenarioDelta] = []

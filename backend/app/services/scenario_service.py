"""Scenario service — scenario management and comparison."""
from typing import Any, Dict, List, Optional
from datetime import date
from sqlalchemy.orm import Session

from app.models.scenario import Scenario, ScenarioItem
from app.schemas.calculation import PreviewItemInput
from app.schemas.scenario import ScenarioCreate, ScenarioCompareResponse, ScenarioDelta
from app.services.calculation_service import calculation_service


class ScenarioService:

    def create_scenario(self, db: Session, data: ScenarioCreate) -> Scenario:
        scenario = Scenario(
            campus_id=data.campus_id,
            name=data.name,
            description=data.description,
        )
        db.add(scenario)
        db.flush()

        for item_data in data.items:
            item = ScenarioItem(
                scenario_id=scenario.id,
                category=item_data.category,
                activity_type=item_data.activity_type,
                quantity=item_data.quantity,
                unit=item_data.unit,
                factor_id=item_data.factor_id,
                subcategory=item_data.subcategory,
            )
            db.add(item)

        db.commit()
        db.refresh(scenario)
        return scenario

    def list_scenarios(self, db: Session, campus_id: Optional[str] = None) -> List[Scenario]:
        q = db.query(Scenario)
        if campus_id:
            q = q.filter(Scenario.campus_id == campus_id)
        return q.all()

    def get_scenario(self, db: Session, scenario_id: str) -> Optional[Scenario]:
        return db.query(Scenario).filter(Scenario.id == scenario_id).first()

    def compare_scenarios(
        self,
        db: Session,
        scenario_a_id: str,
        scenario_b_id: str,
        geography: str = "IN-Telangana",
        reference_date: Optional[date] = None,
    ) -> ScenarioCompareResponse:
        scenario_a = self.get_scenario(db, scenario_a_id)
        scenario_b = self.get_scenario(db, scenario_b_id)

        def scenario_items_to_preview(s: Scenario) -> List[PreviewItemInput]:
            return [
                PreviewItemInput(
                    activity_type=item.activity_type,
                    quantity=item.quantity,
                    unit=item.unit,
                    category=item.category,
                    subcategory=item.subcategory,
                )
                for item in s.items
            ]

        items_a = scenario_items_to_preview(scenario_a) if scenario_a else []
        items_b = scenario_items_to_preview(scenario_b) if scenario_b else []

        result_a = calculation_service.calculate_preview(db, items_a, reference_date, geography)
        result_b = calculation_service.calculate_preview(db, items_b, reference_date, geography)

        delta_kg = result_b.total_kg_co2e - result_a.total_kg_co2e

        # Build delta lines
        # Map activity_type -> kg for each scenario
        a_map: Dict[str, float] = {}
        for line in result_a.lines:
            key = f"{line.category}:{line.activity_type}"
            a_map[key] = (a_map.get(key, 0.0) or 0.0) + (line.emissions_kg_co2e or 0.0)

        b_map: Dict[str, float] = {}
        for line in result_b.lines:
            key = f"{line.category}:{line.activity_type}"
            b_map[key] = (b_map.get(key, 0.0) or 0.0) + (line.emissions_kg_co2e or 0.0)

        all_keys = set(a_map.keys()) | set(b_map.keys())
        lines = []
        for key in sorted(all_keys):
            cat, atype = key.split(":", 1)
            a_kg = a_map.get(key)
            b_kg = b_map.get(key)
            d_kg = (b_kg or 0.0) - (a_kg or 0.0) if (a_kg is not None or b_kg is not None) else None
            lines.append(ScenarioDelta(
                category=cat,
                activity_type=atype,
                scenario_a_kg=a_kg,
                scenario_b_kg=b_kg,
                delta_kg=d_kg,
            ))

        all_warnings = result_a.warnings + result_b.warnings
        if result_a.completeness_status == result_b.completeness_status:
            completeness = result_a.completeness_status
        elif "no_data" in [result_a.completeness_status, result_b.completeness_status]:
            completeness = "partial"
        else:
            completeness = "partial"

        return ScenarioCompareResponse(
            scenario_a_id=scenario_a_id,
            scenario_b_id=scenario_b_id,
            scenario_a_total_kg_co2e=result_a.total_kg_co2e,
            scenario_b_total_kg_co2e=result_b.total_kg_co2e,
            delta_kg_co2e=round(delta_kg, 4),
            delta_tco2e=round(delta_kg / 1000, 6),
            completeness_status=completeness,
            warnings=all_warnings,
            lines=lines,
        )


scenario_service = ScenarioService()

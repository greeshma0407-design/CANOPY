"""Scenario repository."""
from typing import List, Optional
from sqlalchemy.orm import Session

from app.models.scenario import Scenario


class ScenarioRepository:

    def get(self, db: Session, scenario_id: str) -> Optional[Scenario]:
        return db.query(Scenario).filter(Scenario.id == scenario_id).first()

    def list(self, db: Session, campus_id: Optional[str] = None) -> List[Scenario]:
        q = db.query(Scenario)
        if campus_id:
            q = q.filter(Scenario.campus_id == campus_id)
        return q.all()


scenario_repo = ScenarioRepository()

"""Factor repository."""
from typing import List, Optional
from sqlalchemy.orm import Session

from app.models.emission_factor import EmissionFactor


class FactorRepository:

    def get(self, db: Session, factor_id: str) -> Optional[EmissionFactor]:
        return db.query(EmissionFactor).filter(EmissionFactor.id == factor_id).first()

    def list(self, db: Session, category: Optional[str] = None, is_active: bool = True) -> List[EmissionFactor]:
        q = db.query(EmissionFactor).filter(EmissionFactor.is_active == is_active)
        if category:
            q = q.filter(EmissionFactor.category == category)
        return q.all()


factor_repo = FactorRepository()

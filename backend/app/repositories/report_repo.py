"""Report repository."""
from typing import Optional
from sqlalchemy.orm import Session

from app.models.report import Report


class ReportRepository:

    def get(self, db: Session, report_id: str) -> Optional[Report]:
        return db.query(Report).filter(Report.id == report_id).first()


report_repo = ReportRepository()

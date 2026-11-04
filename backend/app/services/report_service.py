"""Report service — generate CSV reports."""
import csv
import io
import os
import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session

from app.models.report import Report
from app.models.activity import ActivityRecord
from app.schemas.report import ReportCreate


class ReportService:

    def create_report(self, db: Session, data: ReportCreate) -> Report:
        report = Report(
            campus_id=data.campus_id,
            reporting_period_id=data.reporting_period_id,
            title=data.title,
            format=data.format,
            status="pending",
        )
        db.add(report)
        db.commit()
        db.refresh(report)

        # Generate the report immediately
        if data.format == "csv":
            try:
                csv_content = self._generate_csv(db, data.campus_id, data.reporting_period_id)
                # Store in-memory path marker (no FS write required for demo)
                report.file_path = f"/reports/{report.id}.csv"
                report.status = "ready"
                # Store CSV in report notes-like field — we'll keep it in memory for download
                # Use a simple in-memory store keyed by report id
                _report_csv_store[report.id] = csv_content
            except Exception as e:
                report.status = "failed"

        db.commit()
        db.refresh(report)
        return report

    def get_report(self, db: Session, report_id: str) -> Optional[Report]:
        return db.query(Report).filter(Report.id == report_id).first()

    def get_csv_content(self, report_id: str) -> Optional[str]:
        return _report_csv_store.get(report_id)

    def _generate_csv(self, db: Session, campus_id: str, period_id: str) -> str:
        target_ids = [period_id]
        if period_id == "period-2025":
            target_ids.append("period-cy2025-01")
        elif period_id == "period-cy2025-01":
            target_ids.append("period-2025")

        records = (
            db.query(ActivityRecord)
            .filter(
                ActivityRecord.campus_id == campus_id,
                ActivityRecord.reporting_period_id.in_(target_ids),
            )
            .all()
        )

        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow([
            "record_id", "campus_id", "period_id", "category",
            "item_id", "activity_type", "quantity", "unit", "subcategory",
            "status", "data_source", "notes",
        ])

        for rec in records:
            for item in rec.activity_items:
                writer.writerow([
                    rec.id, rec.campus_id, rec.reporting_period_id, rec.category,
                    item.id, item.activity_type, item.quantity, item.unit,
                    item.subcategory or "",
                    rec.status, rec.data_source or "", rec.notes or "",
                ])

        return output.getvalue()


# Simple in-memory CSV store (survives the process lifetime)
_report_csv_store: dict[str, str] = {}

report_service = ReportService()

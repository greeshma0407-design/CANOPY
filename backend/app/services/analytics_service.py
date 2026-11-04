"""Analytics service — summaries and time-series trends."""
from typing import Any, Dict, List, Optional
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.activity import ActivityRecord, ActivityItem
from app.models.calculation import CalculationRun, CalculationLine
from app.models.campus import ReportingPeriod
from app.schemas.calculation import PreviewItemInput
from app.services.calculation_service import calculation_service


class AnalyticsService:

    def get_summary(
        self,
        db: Session,
        campus_id: str,
        period_id: str,
        geography: str = "IN-Telangana",
    ) -> Dict[str, Any]:
        """Return total emissions and category breakdown for a reporting period."""
        # Resolve period aliases if needed
        target_period_ids = [period_id]
        if period_id == "period-2025":
            target_period_ids.append("period-cy2025-01")
        elif period_id == "period-cy2025-01":
            target_period_ids.append("period-2025")

        # Fetch all activity records + items for the period
        records = (
            db.query(ActivityRecord)
            .filter(
                ActivityRecord.campus_id == campus_id,
                ActivityRecord.reporting_period_id.in_(target_period_ids),
            )
            .all()
        )

        all_items: List[PreviewItemInput] = []
        for rec in records:
            for item in rec.activity_items:
                all_items.append(
                    PreviewItemInput(
                        activity_type=item.activity_type,
                        quantity=item.quantity,
                        unit=item.unit,
                        category=rec.category,
                        subcategory=item.subcategory,
                    )
                )

        if not all_items:
            return {
                "campus_id": campus_id,
                "reporting_period_id": period_id,
                "total_kg_co2e": 0.0,
                "total_tco2e": 0.0,
                "completeness_status": "no_data",
                "categories": {},
                "warnings": [],
            }

        result = calculation_service.calculate_preview(db, all_items, geography=geography)

        # Build category breakdown
        categories: Dict[str, float] = {}
        for line in result.lines:
            if line.emissions_kg_co2e is not None:
                categories[line.category] = categories.get(line.category, 0.0) + line.emissions_kg_co2e

        return {
            "campus_id": campus_id,
            "reporting_period_id": period_id,
            "total_kg_co2e": result.total_kg_co2e,
            "total_tco2e": result.total_tco2e,
            "completeness_status": result.completeness_status,
            "categories": {k: round(v, 4) for k, v in categories.items()},
            "warnings": result.warnings,
        }

    def get_trends(
        self,
        db: Session,
        campus_id: str,
        geography: str = "IN-Telangana",
    ) -> List[Dict[str, Any]]:
        """Return monthly time-series of emissions across all periods."""
        periods = (
            db.query(ReportingPeriod)
            .filter(ReportingPeriod.campus_id == campus_id)
            .order_by(ReportingPeriod.start_date)
            .all()
        )

        trends = []
        for period in periods:
            summary = self.get_summary(db, campus_id, period.id, geography)
            trends.append(
                {
                    "period_id": period.id,
                    "label": period.label,
                    "start_date": period.start_date,
                    "end_date": period.end_date,
                    "total_kg_co2e": summary["total_kg_co2e"],
                    "total_tco2e": summary["total_tco2e"],
                    "completeness_status": summary["completeness_status"],
                    "categories": summary["categories"],
                }
            )

        return trends


analytics_service = AnalyticsService()

"""Calculation service — core emission computation engine."""
from datetime import date, datetime
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session

from app.config import settings
from app.models.emission_factor import EmissionFactor
from app.models.calculation import CalculationRun, CalculationLine
from app.schemas.calculation import (
    PreviewItemInput,
    CalculationLineResult,
    CalculationPreviewResponse,
)


class CalculationService:
    """Core emission calculation engine.

    Formula: emissions_kg_co2e = activity_quantity × emission_factor_value
    Never invents factors — returns explicit missing_factor state when no match found.
    """

    def find_factor(
        self,
        db: Session,
        category: str,
        activity_type: str,
        activity_unit: str,
        geography: str,
        reference_date: Optional[date] = None,
    ) -> Optional[EmissionFactor]:
        """Find the best matching emission factor.

        Matches: category + activity_type + activity_unit + (geography or 'global')
        + valid date range + is_active.
        Returns most-recent version if multiple match; None if none found.
        """
        ref = reference_date or date.today()

        query = db.query(EmissionFactor).filter(
            EmissionFactor.category == category,
            EmissionFactor.activity_type == activity_type,
            EmissionFactor.activity_unit == activity_unit,
            EmissionFactor.is_active == True,
        )

        # Geography: exact match OR country fallback OR global fallback
        allowed_geos = [geography]
        if "-" in geography:
            country = geography.split("-")[0]
            if country not in allowed_geos:
                allowed_geos.append(country)
        if "global" not in allowed_geos:
            allowed_geos.append("global")

        candidates = query.filter(
            EmissionFactor.geography.in_(allowed_geos)
        ).all()

        if not candidates:
            return None

        # Filter by validity date range
        def is_valid(ef: EmissionFactor) -> bool:
            if ef.valid_from:
                try:
                    vf = date.fromisoformat(ef.valid_from)
                    if ref < vf:
                        return False
                except ValueError:
                    pass
            if ef.valid_to:
                try:
                    vt = date.fromisoformat(ef.valid_to)
                    if ref > vt:
                        return False
                except ValueError:
                    pass
            return True

        valid = [ef for ef in candidates if is_valid(ef)]
        if not valid:
            return None

        # Prefer exact geography, then country code, then global; within same geography prefer higher version
        def sort_key(ef: EmissionFactor):
            if ef.geography == geography:
                geo_priority = 0
            elif "-" in geography and ef.geography == geography.split("-")[0]:
                geo_priority = 1
            else:
                geo_priority = 2
            try:
                ver = int(ef.version)
            except (ValueError, TypeError):
                ver = 0
            return (geo_priority, -ver)

        valid.sort(key=sort_key)
        return valid[0]

    def calculate_preview(
        self,
        db: Session,
        items: List[PreviewItemInput],
        reference_date: Optional[date] = None,
        campus_geography: str = "IN-Telangana",
        geography: Optional[str] = None,
    ) -> CalculationPreviewResponse:
        """Calculate emissions without persisting. Returns full result with warnings."""
        ref = reference_date or date.today()
        effective_geography = geography or campus_geography
        lines: List[CalculationLineResult] = []
        total_kg = 0.0
        warnings: List[str] = []
        has_calculated = False
        has_missing = False

        for item in items:
            factor = self.find_factor(
                db,
                category=item.category,
                activity_type=item.activity_type,
                activity_unit=item.unit,
                geography=effective_geography,
                reference_date=ref,
            )

            if factor is None:
                has_missing = True
                warnings.append(
                    f"missing_factor: no active factor found for "
                    f"category={item.category}, activity_type={item.activity_type}, "
                    f"unit={item.unit}, geography={effective_geography}"
                )
                lines.append(
                    CalculationLineResult(
                        activity_type=item.activity_type,
                        category=item.category,
                        quantity=item.quantity,
                        unit=item.unit,
                        factor_id=None,
                        factor_value=None,
                        emissions_kg_co2e=None,
                        emissions_tco2e=None,
                        status="missing_factor",
                        notes="No matching emission factor found.",
                    )
                )
            else:
                has_calculated = True
                kg = item.quantity * factor.factor_value
                total_kg += kg
                lines.append(
                    CalculationLineResult(
                        activity_type=item.activity_type,
                        category=item.category,
                        quantity=item.quantity,
                        unit=item.unit,
                        factor_id=factor.id,
                        factor_value=factor.factor_value,
                        emissions_kg_co2e=round(kg, 4),
                        emissions_tco2e=round(kg / 1000, 6),
                        status="calculated",
                    )
                )

        if has_calculated and has_missing:
            completeness = "partial"
        elif has_calculated:
            completeness = "complete"
        else:
            completeness = "no_data"

        return CalculationPreviewResponse(
            lines=lines,
            total_kg_co2e=round(total_kg, 4),
            total_tco2e=round(total_kg / 1000, 6),
            completeness_status=completeness,
            warnings=warnings,
            methodology_version=settings.METHODOLOGY_VERSION,
        )

    def calculate_and_save(
        self,
        db: Session,
        campus_id: str,
        period_id: Optional[str],
        items: List[PreviewItemInput],
        reference_date: Optional[date] = None,
        geography: str = "IN-Telangana",
        scenario_id: Optional[str] = None,
    ) -> CalculationRun:
        """Calculate emissions and persist a CalculationRun + CalculationLines."""
        preview = self.calculate_preview(db, items, reference_date, geography)

        run = CalculationRun(
            campus_id=campus_id,
            reporting_period_id=period_id,
            scenario_id=scenario_id,
            total_kg_co2e=preview.total_kg_co2e,
            completeness_status=preview.completeness_status,
            methodology_version=settings.METHODOLOGY_VERSION,
        )
        db.add(run)
        db.flush()

        for line in preview.lines:
            if line.status == "calculated" and line.factor_id and line.emissions_kg_co2e is not None:
                cl = CalculationLine(
                    calculation_run_id=run.id,
                    factor_id=line.factor_id,
                    activity_quantity=line.quantity,
                    activity_unit=line.unit,
                    factor_value=line.factor_value,
                    emissions_kg_co2e=line.emissions_kg_co2e,
                )
                db.add(cl)

        db.commit()
        db.refresh(run)
        return run


calculation_service = CalculationService()

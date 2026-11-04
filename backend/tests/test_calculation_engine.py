"""Tests for the calculation engine.

All factors used here are TEST FIXTURE ONLY (geography='TEST').
"""
import pytest
from datetime import date

from app.schemas.calculation import PreviewItemInput
from app.services.calculation_service import calculation_service


# ── Helpers ──────────────────────────────────────────────────────────────────

def make_item(activity_type, quantity, unit, category, subcategory=None):
    return PreviewItemInput(
        activity_type=activity_type,
        quantity=quantity,
        unit=unit,
        category=category,
        subcategory=subcategory,
    )


# ── Tests ─────────────────────────────────────────────────────────────────────

def test_known_quantity_times_known_factor(db):
    """100 kWh × 1.0 kgCO2e/kWh (TEST fixture) = 100.0 kgCO2e."""
    items = [make_item("grid_electricity", 100.0, "kWh", "electricity")]
    result = calculation_service.calculate_preview(
        db, items, reference_date=date(2025, 6, 1), campus_geography="TEST"
    )
    assert result.completeness_status == "complete"
    assert result.total_kg_co2e == pytest.approx(100.0, abs=1e-6)
    assert result.total_tco2e == pytest.approx(0.1, abs=1e-6)
    assert len(result.warnings) == 0
    assert result.lines[0].status == "calculated"


def test_unit_mismatch_returns_missing_factor(db):
    """Submit kWh but no TEST factor exists for litres → missing_factor."""
    items = [make_item("grid_electricity", 100.0, "litres", "electricity")]
    result = calculation_service.calculate_preview(
        db, items, reference_date=date(2025, 6, 1), campus_geography="TEST"
    )
    assert result.completeness_status in ("no_data", "partial")
    assert any("missing_factor" in w for w in result.warnings)
    assert result.lines[0].status == "missing_factor"


def test_missing_factor_returns_unavailable(db):
    """Activity type with no factor configured → missing_factor in warnings, completeness=partial or no_data."""
    items = [make_item("unicorn_energy", 50.0, "kWh", "electricity")]
    result = calculation_service.calculate_preview(
        db, items, reference_date=date(2025, 6, 1), campus_geography="TEST"
    )
    assert result.completeness_status in ("partial", "no_data")
    assert any("missing_factor" in w for w in result.warnings)
    assert result.lines[0].status == "missing_factor"


def test_factor_validity_date_respected(db):
    """Factor valid_from=2030-01-01, reference_date=2025-01-01 → missing_factor."""
    items = [make_item("grid_electricity_future", 100.0, "kWh", "electricity")]
    result = calculation_service.calculate_preview(
        db, items, reference_date=date(2025, 1, 1), campus_geography="TEST"
    )
    assert result.completeness_status in ("partial", "no_data")
    assert result.lines[0].status == "missing_factor"


def test_non_negative_quantity_validation(client):
    """Negative quantity → HTTP 422 Unprocessable Entity."""
    payload = {
        "items": [
            {
                "activity_type": "grid_electricity",
                "quantity": -10.0,
                "unit": "kWh",
                "category": "electricity",
            }
        ]
    }
    response = client.post("/api/v1/calculations/preview?geography=TEST", json=payload)
    assert response.status_code == 422


def test_partial_data_marks_partial(db):
    """One item has factor, one does not → completeness_status=partial."""
    items = [
        make_item("grid_electricity", 100.0, "kWh", "electricity"),
        make_item("mystery_fuel", 50.0, "litre", "transport"),
    ]
    result = calculation_service.calculate_preview(
        db, items, reference_date=date(2025, 6, 1), campus_geography="TEST"
    )
    assert result.completeness_status == "partial"
    statuses = {line.status for line in result.lines}
    assert "calculated" in statuses
    assert "missing_factor" in statuses


def test_multi_category_total(db):
    """Electricity + transport + waste items → correct summed total."""
    items = [
        make_item("grid_electricity", 100.0, "kWh", "electricity"),       # 100 × 1.0  = 100.0
        make_item("bus_diesel", 200.0, "passenger_km", "transport"),       # 200 × 0.1  = 20.0
        make_item("organic_waste", 0.5, "tonne", "waste"),                 # 0.5 × 500.0 = 250.0
    ]
    result = calculation_service.calculate_preview(
        db, items, reference_date=date(2025, 6, 1), campus_geography="TEST"
    )
    assert result.completeness_status == "complete"
    expected = 100.0 + 20.0 + 250.0  # = 370.0
    assert result.total_kg_co2e == pytest.approx(expected, abs=1e-4)
    assert result.total_tco2e == pytest.approx(expected / 1000, abs=1e-6)

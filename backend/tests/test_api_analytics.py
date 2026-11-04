"""Tests for analytics API."""
import pytest
from tests.conftest import TEST_CAMPUS_ID, TEST_PERIOD_ID


ELEC_RECORD = {
    "campus_id": TEST_CAMPUS_ID,
    "reporting_period_id": TEST_PERIOD_ID,
    "category": "electricity",
    "items": [
        {"activity_type": "grid_electricity", "quantity": 1000.0, "unit": "kWh"}
    ],
}


def test_analytics_summary_returns_totals(client):
    """GET /analytics/summary should return total_kg_co2e and category breakdown."""
    client.post("/api/v1/records", json=ELEC_RECORD)

    response = client.get(
        f"/api/v1/analytics/summary?campus_id={TEST_CAMPUS_ID}&period_id={TEST_PERIOD_ID}&geography=TEST"
    )
    assert response.status_code == 200
    data = response.json()
    assert "total_kg_co2e" in data
    assert "total_tco2e" in data
    assert "completeness_status" in data
    assert "categories" in data
    # 1000 kWh × 1.0 kgCO2e/kWh = 1000 kgCO2e (at least)
    assert data["total_kg_co2e"] >= 1000.0


def test_analytics_trends_returns_time_series(client):
    """GET /analytics/trends should return a list of period trend objects."""
    response = client.get(
        f"/api/v1/analytics/trends?campus_id={TEST_CAMPUS_ID}&geography=TEST"
    )
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    # Should have at least the seeded period
    assert len(data) >= 1
    for entry in data:
        assert "period_id" in entry
        assert "total_kg_co2e" in entry
        assert "label" in entry

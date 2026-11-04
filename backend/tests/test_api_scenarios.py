"""Tests for scenarios API."""
import pytest
from tests.conftest import TEST_CAMPUS_ID


SCENARIO_A_PAYLOAD = {
    "campus_id": TEST_CAMPUS_ID,
    "name": "Baseline Scenario",
    "description": "Current electricity usage",
    "items": [
        {
            "category": "electricity",
            "activity_type": "grid_electricity",
            "quantity": 1000.0,
            "unit": "kWh",
        }
    ],
}

SCENARIO_B_PAYLOAD = {
    "campus_id": TEST_CAMPUS_ID,
    "name": "Solar Scenario",
    "description": "Reduced grid electricity with solar",
    "items": [
        {
            "category": "electricity",
            "activity_type": "grid_electricity",
            "quantity": 400.0,
            "unit": "kWh",
        }
    ],
}


def test_create_scenario(client):
    """POST /scenarios should return 201 with created scenario."""
    response = client.post("/api/v1/scenarios", json=SCENARIO_A_PAYLOAD)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Baseline Scenario"
    assert data["campus_id"] == TEST_CAMPUS_ID
    assert "id" in data
    assert len(data["items"]) == 1


def test_compare_scenarios_returns_delta(client):
    """POST /scenarios/compare should return delta and both totals."""
    resp_a = client.post("/api/v1/scenarios", json=SCENARIO_A_PAYLOAD)
    resp_b = client.post("/api/v1/scenarios", json=SCENARIO_B_PAYLOAD)
    assert resp_a.status_code == 201
    assert resp_b.status_code == 201

    id_a = resp_a.json()["id"]
    id_b = resp_b.json()["id"]

    compare_payload = {
        "scenario_a_id": id_a,
        "scenario_b_id": id_b,
        "geography": "TEST",
    }
    response = client.post("/api/v1/scenarios/compare", json=compare_payload)
    assert response.status_code == 200
    data = response.json()

    assert data["scenario_a_id"] == id_a
    assert data["scenario_b_id"] == id_b
    assert "delta_kg_co2e" in data
    assert "delta_tco2e" in data
    # Scenario B has less electricity → delta should be negative
    # A: 1000×1.0=1000, B: 400×1.0=400, delta = 400-1000 = -600
    assert data["scenario_a_total_kg_co2e"] == pytest.approx(1000.0, abs=1e-2)
    assert data["scenario_b_total_kg_co2e"] == pytest.approx(400.0, abs=1e-2)
    assert data["delta_kg_co2e"] == pytest.approx(-600.0, abs=1e-2)

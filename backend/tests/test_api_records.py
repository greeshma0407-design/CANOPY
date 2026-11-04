"""Tests for activity records API."""
import pytest
from tests.conftest import TEST_CAMPUS_ID, TEST_PERIOD_ID


VALID_RECORD_PAYLOAD = {
    "campus_id": TEST_CAMPUS_ID,
    "reporting_period_id": TEST_PERIOD_ID,
    "category": "electricity",
    "status": "draft",
    "notes": "Test record",
    "data_source": "meter",
    "items": [
        {
            "activity_type": "grid_electricity",
            "quantity": 500.0,
            "unit": "kWh",
            "subcategory": None,
        }
    ],
}


def test_create_record_returns_201(client):
    """POST /records should return 201 with the created record."""
    response = client.post("/api/v1/records", json=VALID_RECORD_PAYLOAD)
    assert response.status_code == 201
    data = response.json()
    assert data["category"] == "electricity"
    assert data["campus_id"] == TEST_CAMPUS_ID
    assert "id" in data
    assert len(data["activity_items"]) == 1


def test_get_record_by_id(client):
    """POST + GET by ID should return the same record."""
    create_resp = client.post("/api/v1/records", json=VALID_RECORD_PAYLOAD)
    assert create_resp.status_code == 201
    record_id = create_resp.json()["id"]

    get_resp = client.get(f"/api/v1/records/{record_id}")
    assert get_resp.status_code == 200
    assert get_resp.json()["id"] == record_id


def test_list_records_filter_by_category(client):
    """GET /records?category=electricity should only return electricity records."""
    # Create one electricity record
    client.post("/api/v1/records", json=VALID_RECORD_PAYLOAD)

    # Create one waste record
    waste_payload = {**VALID_RECORD_PAYLOAD, "category": "waste", "items": [
        {"activity_type": "organic_waste", "quantity": 1.0, "unit": "tonne"}
    ]}
    client.post("/api/v1/records", json=waste_payload)

    response = client.get(f"/api/v1/records?category=electricity&campus_id={TEST_CAMPUS_ID}")
    assert response.status_code == 200
    records = response.json()
    assert all(r["category"] == "electricity" for r in records)


def test_invalid_category_returns_422(client):
    """POST /records with invalid category → 422."""
    bad_payload = {**VALID_RECORD_PAYLOAD, "category": "nuclear"}
    response = client.post("/api/v1/records", json=bad_payload)
    assert response.status_code == 422

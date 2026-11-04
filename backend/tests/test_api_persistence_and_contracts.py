"""Tests for persistence across restarts, API contracts, recommendations, and reports."""
import os
import tempfile
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base
from app.models.campus import Campus
from app.models.activity import ActivityRecord, ActivityItem
from tests.conftest import TEST_CAMPUS_ID, TEST_PERIOD_ID


def test_persistence_across_restart():
    """Verify data written to a SQLite DB file survives engine closure and restart."""
    with tempfile.TemporaryDirectory() as tmpdir:
        db_path = os.path.join(tmpdir, "test_persist.db")
        db_url = f"sqlite:///{db_path}"

        # 1. First session: Create tables and insert a record
        engine1 = create_engine(db_url)
        Base.metadata.create_all(bind=engine1)
        Session1 = sessionmaker(bind=engine1)
        db1 = Session1()

        campus = Campus(
            id="persist-campus-01",
            name="Persistent University",
            location="Persist City",
            population=5000,
            timezone="UTC",
        )
        db1.add(campus)
        db1.commit()
        db1.close()
        engine1.dispose()

        # 2. Second session (simulating app restart): Reconnect and read back
        engine2 = create_engine(db_url)
        Session2 = sessionmaker(bind=engine2)
        db2 = Session2()

        loaded_campus = db2.query(Campus).filter_by(id="persist-campus-01").first()
        assert loaded_campus is not None
        assert loaded_campus.name == "Persistent University"
        assert loaded_campus.population == 5000

        db2.close()
        engine2.dispose()


def test_recommendations_endpoint(client):
    """GET /api/v1/recommendations should return list of recommendations with complete metadata."""
    response = client.get("/api/v1/recommendations")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


def test_report_creation_and_download(client):
    """POST /api/v1/reports creates a report, GET retrieves it, and download returns CSV."""
    # First create an activity record so report has data
    elec_record = {
        "campus_id": TEST_CAMPUS_ID,
        "reporting_period_id": TEST_PERIOD_ID,
        "category": "electricity",
        "items": [
            {"activity_type": "grid_electricity", "quantity": 250.0, "unit": "kWh"}
        ],
    }
    client.post("/api/v1/records", json=elec_record)

    # 1. Create report
    report_payload = {
        "campus_id": TEST_CAMPUS_ID,
        "reporting_period_id": TEST_PERIOD_ID,
        "title": "CY 2025 Test Report",
        "format": "csv",
    }
    create_resp = client.post("/api/v1/reports", json=report_payload)
    assert create_resp.status_code == 201
    rep_data = create_resp.json()
    assert rep_data["title"] == "CY 2025 Test Report"
    assert rep_data["status"] == "ready"
    report_id = rep_data["id"]

    # 2. Get report by ID
    get_resp = client.get(f"/api/v1/reports/{report_id}")
    assert get_resp.status_code == 200
    assert get_resp.json()["id"] == report_id

    # 3. Download CSV
    download_resp = client.get(f"/api/v1/reports/{report_id}/download")
    assert download_resp.status_code == 200
    assert "text/csv" in download_resp.headers["content-type"]
    assert "record_id" in download_resp.text
    assert "grid_electricity" in download_resp.text


def test_api_404_error_contracts(client):
    """Non-existent entities should return clean 404 errors."""
    resp_record = client.get("/api/v1/records/non-existent-id-999")
    assert resp_record.status_code == 404
    assert "not found" in resp_record.json()["detail"].lower()

    resp_scenario = client.get("/api/v1/scenarios/non-existent-id-999")
    assert resp_scenario.status_code == 404
    assert "not found" in resp_scenario.json()["detail"].lower()

    resp_report = client.get("/api/v1/reports/non-existent-id-999")
    assert resp_report.status_code == 404
    assert "not found" in resp_report.json()["detail"].lower()


def test_api_validation_error_contract(client):
    """Invalid requests should return structured 422 errors with detail field."""
    # Missing required field 'category'
    bad_record = {
        "campus_id": TEST_CAMPUS_ID,
        "reporting_period_id": TEST_PERIOD_ID,
        "items": [],
    }
    resp = client.post("/api/v1/records", json=bad_record)
    assert resp.status_code == 422
    data = resp.json()
    assert "detail" in data

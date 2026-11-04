"""Tests for Role-Based Access Control and User Management."""
from tests.conftest import (
    TEST_ADMIN_ID,
    TEST_MANAGER_ID,
    TEST_OPERATOR_ID,
    TEST_VIEWER_ID,
    TEST_CAMPUS_ID,
    TEST_PERIOD_ID,
    make_auth_headers,
)

SAMPLE_RECORD = {
    "campus_id": TEST_CAMPUS_ID,
    "reporting_period_id": TEST_PERIOD_ID,
    "category": "electricity",
    "status": "draft",
    "notes": "RBAC Test Record",
    "data_source": "meter",
    "items": [
        {
            "activity_type": "grid_electricity",
            "quantity": 100.0,
            "unit": "kWh",
        }
    ],
}

SAMPLE_SCENARIO = {
    "campus_id": TEST_CAMPUS_ID,
    "name": "RBAC Solar PV Scenario",
    "description": "Test scenario",
    "items": [
        {
            "category": "electricity",
            "activity_type": "grid_electricity",
            "quantity": 50.0,
            "unit": "kWh",
        }
    ],
}

SAMPLE_REPORT = {
    "campus_id": TEST_CAMPUS_ID,
    "reporting_period_id": TEST_PERIOD_ID,
    "title": "RBAC GHG Report",
    "format": "csv",
}


# --- Role-Based Record Creation Tests ---

def test_viewer_cannot_create_record(unauthenticated_client):
    """VIEWER role cannot POST to /records (returns 403)."""
    headers = make_auth_headers(TEST_VIEWER_ID, "VIEWER")
    resp = unauthenticated_client.post("/api/v1/records", json=SAMPLE_RECORD, headers=headers)
    assert resp.status_code == 403
    assert "Access denied" in resp.json()["detail"]


def test_operator_can_create_record(unauthenticated_client):
    """DATA_ENTRY_OPERATOR role can POST to /records (returns 201)."""
    headers = make_auth_headers(TEST_OPERATOR_ID, "DATA_ENTRY_OPERATOR")
    resp = unauthenticated_client.post("/api/v1/records", json=SAMPLE_RECORD, headers=headers)
    assert resp.status_code == 201


def test_manager_and_admin_can_create_record(unauthenticated_client):
    """CAMPUS_MANAGER and ADMIN roles can POST to /records (returns 201)."""
    m_headers = make_auth_headers(TEST_MANAGER_ID, "CAMPUS_MANAGER")
    resp_m = unauthenticated_client.post("/api/v1/records", json=SAMPLE_RECORD, headers=m_headers)
    assert resp_m.status_code == 201

    a_headers = make_auth_headers(TEST_ADMIN_ID, "ADMIN")
    resp_a = unauthenticated_client.post("/api/v1/records", json=SAMPLE_RECORD, headers=a_headers)
    assert resp_a.status_code == 201


# --- Role-Based Scenario Creation Tests ---

def test_operator_and_viewer_cannot_create_scenario(unauthenticated_client):
    """OPERATOR and VIEWER cannot POST to /scenarios (returns 403)."""
    v_headers = make_auth_headers(TEST_VIEWER_ID, "VIEWER")
    resp_v = unauthenticated_client.post("/api/v1/scenarios", json=SAMPLE_SCENARIO, headers=v_headers)
    assert resp_v.status_code == 403

    o_headers = make_auth_headers(TEST_OPERATOR_ID, "DATA_ENTRY_OPERATOR")
    resp_o = unauthenticated_client.post("/api/v1/scenarios", json=SAMPLE_SCENARIO, headers=o_headers)
    assert resp_o.status_code == 403


def test_manager_can_create_scenario(unauthenticated_client):
    """CAMPUS_MANAGER can POST to /scenarios (returns 201)."""
    headers = make_auth_headers(TEST_MANAGER_ID, "CAMPUS_MANAGER")
    resp = unauthenticated_client.post("/api/v1/scenarios", json=SAMPLE_SCENARIO, headers=headers)
    assert resp.status_code == 201


# --- Role-Based Report Generation Tests ---

def test_viewer_and_operator_cannot_create_report(unauthenticated_client):
    """VIEWER and OPERATOR cannot POST to /reports (returns 403)."""
    v_headers = make_auth_headers(TEST_VIEWER_ID, "VIEWER")
    resp_v = unauthenticated_client.post("/api/v1/reports", json=SAMPLE_REPORT, headers=v_headers)
    assert resp_v.status_code == 403

    o_headers = make_auth_headers(TEST_OPERATOR_ID, "DATA_ENTRY_OPERATOR")
    resp_o = unauthenticated_client.post("/api/v1/reports", json=SAMPLE_REPORT, headers=o_headers)
    assert resp_o.status_code == 403


def test_manager_can_create_report(unauthenticated_client):
    """CAMPUS_MANAGER can POST to /reports (returns 201)."""
    headers = make_auth_headers(TEST_MANAGER_ID, "CAMPUS_MANAGER")
    resp = unauthenticated_client.post("/api/v1/reports", json=SAMPLE_REPORT, headers=headers)
    assert resp.status_code == 201


# --- User Management & Admin Protection Tests ---

def test_non_admin_cannot_access_users(unauthenticated_client):
    """CAMPUS_MANAGER, OPERATOR, and VIEWER cannot access /users (returns 403)."""
    for uid, role in [
        (TEST_MANAGER_ID, "CAMPUS_MANAGER"),
        (TEST_OPERATOR_ID, "DATA_ENTRY_OPERATOR"),
        (TEST_VIEWER_ID, "VIEWER"),
    ]:
        headers = make_auth_headers(uid, role)
        resp = unauthenticated_client.get("/api/v1/users", headers=headers)
        assert resp.status_code == 403


def test_admin_can_list_and_create_users(unauthenticated_client):
    """ADMIN can GET /users and POST /users."""
    admin_headers = make_auth_headers(TEST_ADMIN_ID, "ADMIN")

    # List users
    list_resp = unauthenticated_client.get("/api/v1/users", headers=admin_headers)
    assert list_resp.status_code == 200
    assert len(list_resp.json()) >= 4

    # Create new user
    new_user_data = {
        "email": "new.member@canopy.test",
        "full_name": "New Team Member",
        "role": "DATA_ENTRY_OPERATOR",
        "password": "SecurePassword123!",
        "is_active": True,
    }
    create_resp = unauthenticated_client.post("/api/v1/users", json=new_user_data, headers=admin_headers)
    assert create_resp.status_code == 201
    created_id = create_resp.json()["id"]

    # Duplicate email check
    dup_resp = unauthenticated_client.post("/api/v1/users", json=new_user_data, headers=admin_headers)
    assert dup_resp.status_code == 400
    assert "already exists" in dup_resp.json()["detail"]

    # Update created user
    patch_resp = unauthenticated_client.patch(
        f"/api/v1/users/{created_id}",
        json={"role": "CAMPUS_MANAGER", "full_name": "Promoted Member"},
        headers=admin_headers,
    )
    assert patch_resp.status_code == 200
    assert patch_resp.json()["role"] == "CAMPUS_MANAGER"
    assert patch_resp.json()["full_name"] == "Promoted Member"

    # Delete created user
    del_resp = unauthenticated_client.delete(f"/api/v1/users/{created_id}", headers=admin_headers)
    assert del_resp.status_code == 200


def test_cannot_deactivate_or_delete_last_active_admin(unauthenticated_client):
    """ADMIN cannot deactivate or delete the last active administrator (returns 400)."""
    admin_headers = make_auth_headers(TEST_ADMIN_ID, "ADMIN")

    # Attempt to deactivate the sole test admin
    patch_resp = unauthenticated_client.patch(
        f"/api/v1/users/{TEST_ADMIN_ID}",
        json={"is_active": False},
        headers=admin_headers,
    )
    assert patch_resp.status_code == 400
    assert "last active administrator" in patch_resp.json()["detail"]

    # Attempt to demote the sole test admin
    demote_resp = unauthenticated_client.patch(
        f"/api/v1/users/{TEST_ADMIN_ID}",
        json={"role": "VIEWER"},
        headers=admin_headers,
    )
    assert demote_resp.status_code == 400
    assert "last active administrator" in demote_resp.json()["detail"]

    # Attempt to delete the sole test admin
    del_resp = unauthenticated_client.delete(
        f"/api/v1/users/{TEST_ADMIN_ID}",
        headers=admin_headers,
    )
    assert del_resp.status_code == 400
    assert "last active administrator" in del_resp.json()["detail"]

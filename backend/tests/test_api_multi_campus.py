"""Tests for multi-campus onboarding, invitations, and tenant isolation."""
import uuid
import pytest
from starlette.testclient import TestClient

from app.main import app


@pytest.fixture
def client():
    return TestClient(app)


def test_campus_onboarding_and_profile_management(client):
    """Test full campus onboarding flow, automatic admin creation, and profile retrieval."""
    uid = uuid.uuid4().hex[:6]
    admin_email = f"admin_{uid}@iisc.test"
    onboard_payload = {
        "institution_name": "Indian Institute of Science",
        "institution_type": "University",
        "campus_name": f"Main Campus Bengaluru {uid}",
        "city": "Bengaluru",
        "state": "Karnataka",
        "country": "India",
        "timezone": "Asia/Kolkata",
        "student_count": 4500,
        "faculty_count": 500,
        "staff_count": 1000,
        "campus_area_acres": 440.0,
        "built_up_area_sq_m": 250000.0,
        "building_count": 45,
        "academic_year": "2025-2026",
        "reporting_period_label": "CY 2025",
        "reporting_period_start": "2025-01-01",
        "reporting_period_end": "2025-12-31",
        "baseline_year": "2022",
        "admin_name": "Dr. Bangalore Admin",
        "admin_email": admin_email,
        "admin_password": "StrongPassword123!",
    }

    resp = client.post("/api/v1/campuses/onboard", json=onboard_payload)
    assert resp.status_code == 201, resp.text
    data = resp.json()

    assert "access_token" in data
    assert data["user"]["email"] == admin_email
    assert data["user"]["role"] == "CAMPUS_ADMIN"
    campus_id = data["campus"]["id"]
    assert data["campus"]["institution_name"] == "Indian Institute of Science"
    assert data["campus"]["population"] == 6000

    token = data["access_token"]
    auth_headers = {"Authorization": f"Bearer {token}"}

    # Verify /campuses/me
    me_resp = client.get("/api/v1/campuses/me", headers=auth_headers)
    assert me_resp.status_code == 200
    assert me_resp.json()["id"] == campus_id

    # Verify /campuses/me/periods
    periods_resp = client.get("/api/v1/campuses/me/periods", headers=auth_headers)
    assert periods_resp.status_code == 200
    assert len(periods_resp.json()) >= 1
    assert periods_resp.json()[0]["label"] == "CY 2025"

    # Update campus profile via PATCH /campuses/me
    patch_resp = client.patch(
        "/api/v1/campuses/me",
        json={"student_count": 4600, "built_up_area_sq_m": 260000.0},
        headers=auth_headers,
    )
    assert patch_resp.status_code == 200
    assert patch_resp.json()["student_count"] == 4600
    assert patch_resp.json()["population"] == 6100  # 4600 + 500 + 1000


def test_invitation_lifecycle_and_registration(client):
    """Test generating an invite, verifying token publicly, and completing registration."""
    uid = uuid.uuid4().hex[:6]
    admin_email = f"admin_{uid}@heritage.test"
    operator_email = f"operator_{uid}@heritage.test"

    # 1. Onboard a campus
    onboard_resp = client.post(
        "/api/v1/campuses/onboard",
        json={
            "institution_name": "Heritage University",
            "campus_name": f"Heritage North {uid}",
            "city": "Pune",
            "state": "Maharashtra",
            "country": "India",
            "admin_name": "Heritage Admin",
            "admin_email": admin_email,
            "admin_password": "HeritagePassword123!",
        },
    )
    assert onboard_resp.status_code == 201
    admin_token = onboard_resp.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # 2. Issue invitation
    invite_resp = client.post(
        "/api/v1/invitations",
        json={"email": operator_email, "role": "DATA_ENTRY_OPERATOR"},
        headers=admin_headers,
    )
    assert invite_resp.status_code == 201
    invite_data = invite_resp.json()
    token = invite_data["token"]
    assert invite_data["email"] == operator_email
    assert invite_data["role"] == "DATA_ENTRY_OPERATOR"

    # 3. Public token verification
    verify_resp = client.get(f"/api/v1/invitations/verify/{token}")
    assert verify_resp.status_code == 200
    assert verify_resp.json()["is_valid"] is True
    assert verify_resp.json()["email"] == operator_email
    assert f"Heritage North {uid}" in verify_resp.json()["campus_name"]

    # 4. Register using invited token
    reg_resp = client.post(
        "/api/v1/auth/register-invited",
        json={
            "token": token,
            "full_name": "Operator Jane",
            "password": "SecurePasswordJane123!",
        },
    )
    assert reg_resp.status_code == 201
    user_data = reg_resp.json()["user"]
    assert user_data["email"] == operator_email
    assert user_data["role"] == "DATA_ENTRY_OPERATOR"

    # 5. Token reuse is blocked
    reuse_resp = client.get(f"/api/v1/invitations/verify/{token}")
    assert reuse_resp.status_code == 400


def test_strict_multi_campus_isolation(client):
    """Verify that records, users, and analytics from Campus A are never accessible by Campus B."""
    uid = uuid.uuid4().hex[:6]
    # Onboard Campus Alpha
    alpha_resp = client.post(
        "/api/v1/campuses/onboard",
        json={
            "institution_name": "Alpha Institute",
            "campus_name": f"Alpha Campus {uid}",
            "admin_name": "Alpha Admin",
            "admin_email": f"admin_alpha_{uid}@alpha.test",
            "admin_password": "AlphaPassword123!",
        },
    )
    assert alpha_resp.status_code == 201
    alpha_headers = {"Authorization": f"Bearer {alpha_resp.json()['access_token']}"}
    alpha_campus_id = alpha_resp.json()["campus"]["id"]

    # Onboard Campus Beta
    beta_resp = client.post(
        "/api/v1/campuses/onboard",
        json={
            "institution_name": "Beta University",
            "campus_name": f"Beta Campus {uid}",
            "admin_name": "Beta Admin",
            "admin_email": f"admin_beta_{uid}@beta.test",
            "admin_password": "BetaPassword123!",
        },
    )
    assert beta_resp.status_code == 201
    beta_headers = {"Authorization": f"Bearer {beta_resp.json()['access_token']}"}
    beta_campus_id = beta_resp.json()["campus"]["id"]

    # Alpha Admin creates an activity record
    rec_resp = client.post(
        "/api/v1/records",
        json={
            "campus_id": alpha_campus_id,
            "reporting_period_id": "period-dummy",
            "category": "electricity",
            "source_type": "grid_meter",
            "date": "2025-03-01",
            "scope": "scope_2",
            "items": [
                {
                    "activity_type": "grid_electricity",
                    "quantity": 1000.0,
                    "unit": "kWh",
                }
            ],
        },
        headers=alpha_headers,
    )
    assert rec_resp.status_code == 201
    alpha_rec_id = rec_resp.json()["id"]

    # Beta attempts to read Alpha's record
    beta_rec_get = client.get(f"/api/v1/records/{alpha_rec_id}", headers=beta_headers)
    assert beta_rec_get.status_code == 403

    # Beta attempts to query records with Alpha's campus_id
    beta_list_resp = client.get(f"/api/v1/records?campus_id={alpha_campus_id}", headers=beta_headers)
    assert beta_list_resp.status_code == 403

    # Beta attempts to query analytics with Alpha's campus_id
    beta_analytics_resp = client.get(
        f"/api/v1/analytics/summary?campus_id={alpha_campus_id}&period_id=period-dummy",
        headers=beta_headers,
    )
    assert beta_analytics_resp.status_code == 403

    # Beta admin listing users only sees Beta users, not Alpha
    beta_users_resp = client.get("/api/v1/users", headers=beta_headers)
    assert beta_users_resp.status_code == 200
    emails = [u["email"] for u in beta_users_resp.json()]
    assert f"admin_beta_{uid}@beta.test" in emails
    assert f"admin_alpha_{uid}@alpha.test" not in emails

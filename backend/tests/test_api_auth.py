"""Tests for CANOPY Authentication system."""
from datetime import timedelta
from tests.conftest import TEST_ADMIN_ID, TEST_VIEWER_ID
from app.core.security import create_access_token


def test_login_success(unauthenticated_client):
    """POST /api/v1/auth/login with valid credentials returns 200, JWT token, and cookie."""
    resp = unauthenticated_client.post(
        "/api/v1/auth/login",
        json={"email": "admin@canopy.test", "password": "Password123!"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "admin@canopy.test"
    assert data["user"]["role"] == "ADMIN"
    assert "hashed_password" not in data["user"]
    assert "canopy_access_token" in resp.cookies


def test_login_invalid_password(unauthenticated_client):
    """POST /api/v1/auth/login with wrong password returns 401."""
    resp = unauthenticated_client.post(
        "/api/v1/auth/login",
        json={"email": "admin@canopy.test", "password": "WrongPassword999!"},
    )
    assert resp.status_code == 401
    assert "Invalid email or password" in resp.json()["detail"]


def test_login_nonexistent_email(unauthenticated_client):
    """POST /api/v1/auth/login with nonexistent user returns 401."""
    resp = unauthenticated_client.post(
        "/api/v1/auth/login",
        json={"email": "nonexistent@canopy.test", "password": "Password123!"},
    )
    assert resp.status_code == 401
    assert "Invalid email or password" in resp.json()["detail"]


def test_login_remember_me_extended_expiry(unauthenticated_client):
    """POST /api/v1/auth/login with remember_me=True returns longer expires_in."""
    resp_normal = unauthenticated_client.post(
        "/api/v1/auth/login",
        json={"email": "admin@canopy.test", "password": "Password123!", "remember_me": False},
    )
    resp_remember = unauthenticated_client.post(
        "/api/v1/auth/login",
        json={"email": "admin@canopy.test", "password": "Password123!", "remember_me": True},
    )
    assert resp_remember.json()["expires_in"] > resp_normal.json()["expires_in"]


def test_get_me_with_bearer_token(unauthenticated_client):
    """GET /api/v1/auth/me returns current user info when valid bearer token provided."""
    token = create_access_token(subject=TEST_ADMIN_ID, claims={"role": "ADMIN"})
    resp = unauthenticated_client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["id"] == TEST_ADMIN_ID
    assert data["email"] == "admin@canopy.test"
    assert data["role"] == "ADMIN"


def test_get_me_with_cookie(unauthenticated_client):
    """GET /api/v1/auth/me returns current user info when HttpOnly cookie provided."""
    token = create_access_token(subject=TEST_VIEWER_ID, claims={"role": "VIEWER"})
    unauthenticated_client.cookies.set("canopy_access_token", token)
    resp = unauthenticated_client.get("/api/v1/auth/me")
    assert resp.status_code == 200
    data = resp.json()
    assert data["id"] == TEST_VIEWER_ID
    assert data["role"] == "VIEWER"


def test_get_me_unauthenticated(unauthenticated_client):
    """GET /api/v1/auth/me without token or cookie returns 401."""
    resp = unauthenticated_client.get("/api/v1/auth/me")
    assert resp.status_code == 401


def test_get_me_expired_token(unauthenticated_client):
    """GET /api/v1/auth/me with expired token returns 401."""
    expired_token = create_access_token(
        subject=TEST_ADMIN_ID,
        expires_delta=timedelta(seconds=-10),
    )
    resp = unauthenticated_client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {expired_token}"},
    )
    assert resp.status_code == 401
    assert "expired" in resp.json()["detail"].lower()


def test_get_me_invalid_token(unauthenticated_client):
    """GET /api/v1/auth/me with invalid token returns 401."""
    resp = unauthenticated_client.get(
        "/api/v1/auth/me",
        headers={"Authorization": "Bearer invalid.fake.token"},
    )
    assert resp.status_code == 401


def test_logout_clears_cookie(unauthenticated_client):
    """POST /api/v1/auth/logout clears the session cookie."""
    token = create_access_token(subject=TEST_ADMIN_ID)
    unauthenticated_client.cookies.set("canopy_access_token", token)
    resp = unauthenticated_client.post("/api/v1/auth/logout")
    assert resp.status_code == 200
    # Cookie should be deleted/empty
    assert resp.cookies.get("canopy_access_token") is None or resp.cookies.get("canopy_access_token") == ""

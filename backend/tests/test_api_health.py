"""Tests for health check API."""


def test_health_returns_ok(client):
    """GET /api/v1/health should return status=ok."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "methodology_version" in data
    assert "service" in data

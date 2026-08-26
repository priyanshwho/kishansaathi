import pytest
from fastapi.testclient import TestClient
from main import app

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as test_client:
        yield test_client

def test_docs_endpoint(client):
    """Verify Swagger UI docs endpoint responds with 200 OK."""
    response = client.get("/docs")
    assert response.status_code == 200
    assert "Swagger UI" in response.text or "swagger" in response.text.lower()

def test_openapi_schema(client):
    """Verify OpenAPI schema is generated properly with all routes."""
    response = client.get("/openapi.json")
    assert response.status_code == 200
    data = response.json()
    assert "paths" in data
    assert "/auth/google/login" in data["paths"]
    assert "/districts" in data["paths"]
    assert "/predict" in data["paths"]
    assert "/health" in data["paths"]

def test_health_endpoint(client):
    """Verify API health endpoint responds with 200 OK."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data.get("status") == "ok"

def test_google_login_redirect(client):
    """Verify Google Login redirects to Google OAuth consent URL."""
    response = client.get("/auth/google/login", follow_redirects=False)
    assert response.status_code in (302, 307)
    location = response.headers.get("location", "")
    assert "accounts.google.com" in location
    assert "client_id=" in location
    assert "redirect_uri=" in location

def test_districts_endpoint(client):
    """Verify districts endpoint returns list of district items."""
    response = client.get("/districts")
    assert response.status_code in (200, 404)
    if response.status_code == 200:
        data = response.json()
        assert isinstance(data, list)
        if len(data) > 0:
            assert "dist_name" in data[0]
            assert "state_name" in data[0]

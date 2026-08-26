from unittest.mock import patch, AsyncMock, MagicMock
import pytest
from fastapi.testclient import TestClient

@pytest.fixture(scope="module")
def client():
    mock_pool = MagicMock()
    mock_pool.close = AsyncMock()
    mock_conn = AsyncMock()
    mock_conn.fetch = AsyncMock(return_value=[{"dist_name": "pune", "state_name": "Maharashtra"}])
    mock_conn.fetchrow = AsyncMock(return_value=None)
    mock_pool.acquire.return_value.__aenter__.return_value = mock_conn

    with patch("main.create_pool", new=AsyncMock(return_value=mock_pool)), \
         patch("main.create_all_tables", new=AsyncMock()), \
         patch("main.close_chatbot_pool", new=AsyncMock()):
        import main
        main.app.dependency_overrides[main.get_pool] = lambda: mock_pool
        with TestClient(main.app) as test_client:
            yield test_client
        main.app.dependency_overrides.clear()

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
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert data[0]["dist_name"] == "pune"
    assert data[0]["state_name"] == "Maharashtra"

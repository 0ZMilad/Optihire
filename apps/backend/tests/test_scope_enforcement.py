"""
Tests for scope-based authorization using the require_scopes dependency.
"""
import pytest
from fastapi import FastAPI, Depends, status
from fastapi.testclient import TestClient

from app.core.dependencies import require_scopes


@pytest.fixture
def app_with_scopes():
    """Create a test app with scope-protected endpoints."""
    app = FastAPI()
    
    from app.middleware.auth import JWTMiddleware
    app.add_middleware(JWTMiddleware)
    
    @app.get("/admin", dependencies=[Depends(require_scopes(["admin:read"]))])
    def admin_endpoint():
        return {"message": "admin access granted"}
    
    @app.post("/users", dependencies=[Depends(require_scopes(["users:create", "users:write"]))])
    def create_user_endpoint():
        return {"message": "user created"}
    
    @app.get("/public")
    def public_endpoint():
        return {"message": "public access"}
    
    return app


@pytest.fixture
def scope_client(app_with_scopes):
    """Create test client for scope testing."""
    return TestClient(app_with_scopes)


class TestScopeEnforcement:
    """Test scope-based authorization."""
    
    def test_endpoint_with_required_scope_succeeds(self, scope_client, valid_token):
        """Endpoint should succeed when token has required scopes."""
        # valid_token has all user scopes including users:create and users:write
        response = scope_client.post(
            "/users",
            headers={"Authorization": f"Bearer {valid_token}"}
        )
        assert response.status_code == status.HTTP_200_OK
        assert response.json()["message"] == "user created"
    
    def test_endpoint_with_insufficient_scope_returns_403(self, scope_client, token_insufficient_scopes):
        """Endpoint should return 403 when token lacks required scopes."""
        # token_insufficient_scopes only has users:read
        response = scope_client.post(
            "/users",
            headers={"Authorization": f"Bearer {token_insufficient_scopes}"}
        )
        assert response.status_code == status.HTTP_403_FORBIDDEN
        body = response.json()
        assert body["detail"]["code"] == "INSUFFICIENT_SCOPES"
        assert "users:create" in body["detail"]["details"]["required"] or "users:write" in body["detail"]["details"]["required"]
    
    def test_endpoint_without_scope_requirement_succeeds(self, scope_client, token_insufficient_scopes):
        """Endpoints without scope requirements should work with any valid token."""
        response = scope_client.get(
            "/public",
            headers={"Authorization": f"Bearer {token_insufficient_scopes}"}
        )
        assert response.status_code == status.HTTP_200_OK
    
    def test_missing_token_returns_401_before_scope_check(self, scope_client):
        """Missing token should return 401, not 403."""
        response = scope_client.post("/users")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        # Should fail at auth, not scope checking
    
    def test_insufficient_scopes_error_details(self, scope_client, token_insufficient_scopes):
        """403 error should include required and provided scopes."""
        response = scope_client.post(
            "/users",
            headers={"Authorization": f"Bearer {token_insufficient_scopes}"}
        )
        assert response.status_code == status.HTTP_403_FORBIDDEN
        body = response.json()
        assert "required" in body["detail"]["details"]
        assert "provided" in body["detail"]["details"]
        assert isinstance(body["detail"]["details"]["required"], list)
        assert isinstance(body["detail"]["details"]["provided"], list)


class TestScopeErrorFormat:
    """Test error response format for scope failures."""
    
    def test_403_has_standard_error_format(self, scope_client, token_insufficient_scopes):
        """403 scope errors should follow {code, message, details} format."""
        response = scope_client.post(
            "/users",
            headers={"Authorization": f"Bearer {token_insufficient_scopes}"}
        )
        body = response.json()
        assert "detail" in body
        detail = body["detail"]
        assert "code" in detail
        assert "message" in detail
        assert "details" in detail
        assert detail["code"] == "INSUFFICIENT_SCOPES"

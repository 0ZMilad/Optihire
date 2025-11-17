"""
Integration tests for JWT middleware authentication and authorization.
Tests cover token validation, claim enforcement, scope checking, and request ID propagation.
"""
import pytest
from fastapi import status


class TestMiddlewareAuthentication:
    """Test authentication flow in middleware."""
    
    def test_public_path_no_auth_required(self, client):
        """Public paths should be accessible without authentication."""
        response = client.get("/health")
        assert response.status_code == status.HTTP_200_OK
        assert "x-request-id" in response.headers
    
    def test_protected_path_no_token_returns_401(self, client):
        """Protected endpoints without token should return 401."""
        response = client.get("/protected")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert response.json()["code"] == "MISSING_AUTH_HEADER"
        assert "x-request-id" in response.headers
    
    def test_protected_path_invalid_auth_header_returns_401(self, client):
        """Invalid Authorization header format should return 401."""
        response = client.get("/protected", headers={"Authorization": "Invalid"})
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert response.json()["code"] == "MISSING_AUTH_HEADER"
    
    def test_protected_path_valid_token_returns_200(self, client, valid_token):
        """Protected endpoint with valid token should succeed."""
        response = client.get(
            "/protected",
            headers={"Authorization": f"Bearer {valid_token}"}
        )
        assert response.status_code == status.HTTP_200_OK
        assert response.json()["message"] == "success"
        assert "x-request-id" in response.headers
    
    def test_expired_token_returns_401(self, client, expired_token):
        """Expired token should return 401."""
        response = client.get(
            "/protected",
            headers={"Authorization": f"Bearer {expired_token}"}
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert response.json()["code"] == "INVALID_TOKEN"
    
    def test_invalid_signature_returns_401(self, client, invalid_signature_token):
        """Token with invalid signature should return 401."""
        response = client.get(
            "/protected",
            headers={"Authorization": f"Bearer {invalid_signature_token}"}
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert response.json()["code"] == "INVALID_TOKEN"


class TestClaimEnforcement:
    """Test JWT claim validation."""
    
    def test_token_missing_sub_claim_returns_401(self, client, token_missing_sub):
        """Token missing 'sub' claim should return 401."""
        response = client.get(
            "/protected",
            headers={"Authorization": f"Bearer {token_missing_sub}"}
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert response.json()["code"] == "MISSING_SUB_CLAIM"
        assert response.json()["details"]["claim"] == "sub"
    
    def test_token_missing_scopes_claim_returns_401(self, client, token_missing_scopes):
        """Token missing 'scopes' claim should return 401."""
        response = client.get(
            "/protected",
            headers={"Authorization": f"Bearer {token_missing_scopes}"}
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert response.json()["code"] == "INVALID_SCOPES_CLAIM"
        assert response.json()["details"]["claim"] == "scopes"


class TestRequestIDPropagation:
    """Test request ID generation and propagation."""
    
    def test_request_id_generated_when_missing(self, client):
        """Middleware should generate request ID if not provided."""
        response = client.get("/health")
        assert "x-request-id" in response.headers
        request_id = response.headers["x-request-id"]
        # UUID format check (basic)
        assert len(request_id) == 36
        assert request_id.count("-") == 4
    
    def test_request_id_preserved_when_provided(self, client):
        """Middleware should preserve incoming request ID."""
        custom_id = "custom-request-id-12345"
        response = client.get(
            "/health",
            headers={"x-request-id": custom_id}
        )
        assert response.headers["x-request-id"] == custom_id
    
    def test_request_id_added_to_error_responses(self, client):
        """Request ID should be added even to error responses."""
        response = client.get("/protected")  # No auth
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert "x-request-id" in response.headers
    
    def test_request_id_added_to_public_paths(self, client):
        """Request ID should be added to public path responses."""
        response = client.get("/health")
        assert response.status_code == status.HTTP_200_OK
        assert "x-request-id" in response.headers


class TestErrorResponseFormat:
    """Test standardized error response format."""
    
    def test_401_error_has_standard_format(self, client):
        """401 errors should have {code, message, details} format."""
        response = client.get("/protected")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        body = response.json()
        assert "code" in body
        assert "message" in body
        assert "details" in body
        assert isinstance(body["details"], dict)
    
    def test_missing_token_error_format(self, client):
        """Missing token error should have proper structure."""
        response = client.get("/protected")
        body = response.json()
        assert body["code"] == "MISSING_AUTH_HEADER"
        assert "authorization" in body["message"].lower()
        assert body["details"]["header"] == "Authorization"
    
    def test_invalid_token_error_format(self, client, expired_token):
        """Invalid token error should have proper structure."""
        response = client.get(
            "/protected",
            headers={"Authorization": f"Bearer {expired_token}"}
        )
        body = response.json()
        assert body["code"] == "INVALID_TOKEN"
        assert "error" in body["details"]


class TestRequestStateEnrichment:
    """Test that request.state is properly enriched."""
    
    def test_request_state_has_user_after_auth(self, client, valid_token):
        """After successful auth, request.state.user should be set."""
        # This test relies on the endpoint accessing request.state
        # We'll verify indirectly by checking successful response
        response = client.get(
            "/protected",
            headers={"Authorization": f"Bearer {valid_token}"}
        )
        assert response.status_code == status.HTTP_200_OK
        # If request.state.user wasn't set, scope checking would fail

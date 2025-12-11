"""
Pytest configuration and fixtures for auth middleware tests.

This module provides fixtures that properly mock JWKS-based JWT validation
used by the Supabase integration.
"""
import pytest
from datetime import datetime, timezone, timedelta
from typing import Generator
from uuid import uuid4

import jwt
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.backends import default_backend
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.core.config import settings
from app.middleware.auth import JWTMiddleware
from app.core.jwt import jwks_cache


# Generate EC key pair for testing (ES256 algorithm)
_private_key = ec.generate_private_key(ec.SECP256R1(), default_backend())
_public_key = _private_key.public_key()


def _get_test_jwk() -> dict:
    """Generate a JWK from the test public key."""
    from jwt.algorithms import ECAlgorithm
    jwk = ECAlgorithm.to_jwk(_public_key, as_dict=True)
    jwk["kid"] = "test-key-id"
    jwk["use"] = "sig"
    jwk["alg"] = "ES256"
    return jwk


def _create_token(payload: dict, include_header: bool = True) -> str:
    """Create a JWT token signed with the test private key."""
    headers = {"kid": "test-key-id"} if include_header else {}
    return jwt.encode(payload, _private_key, algorithm="ES256", headers=headers)


@pytest.fixture(autouse=True)
def mock_jwks_fetch():
    """
    Mock the JWKS fetch to return our test key.
    This prevents actual HTTP calls to Supabase during tests.
    """
    # Pre-populate the JWKS cache
    jwks_cache["keys"] = [_get_test_jwk()]
    jwks_cache["fetched_at"] = datetime.now(timezone.utc).timestamp()
    yield
    # Clean up cache after test
    jwks_cache["keys"] = None
    jwks_cache["fetched_at"] = None


@pytest.fixture
def app() -> FastAPI:
    """Create a test FastAPI application with middleware."""
    test_app = FastAPI()
    test_app.add_middleware(JWTMiddleware)
    
    # Add a test protected endpoint
    @test_app.get("/protected")
    def protected_route():
        return {"message": "success"}
    
    # Add a test public endpoint
    @test_app.get("/health")
    def health_route():
        return {"status": "healthy"}
    
    return test_app


@pytest.fixture
def client(app: FastAPI) -> Generator[TestClient, None, None]:
    """Create a test client."""
    with TestClient(app) as c:
        yield c


@pytest.fixture
def valid_token() -> str:
    """Generate a valid JWT token with all required claims."""
    payload = {
        "sub": str(uuid4()),
        "email": "test@example.com",
        "role": "authenticated",
        "scopes": ["users:read", "users:create", "users:update", "users:delete"],
        "exp": datetime.now(timezone.utc) + timedelta(hours=1),
        "iat": datetime.now(timezone.utc),
        "aud": settings.JWT_AUDIENCE,
        "iss": settings.jwt_issuer,
    }
    return _create_token(payload)


@pytest.fixture
def token_missing_sub() -> str:
    """Generate a token missing the 'sub' claim."""
    payload = {
        "email": "test@example.com",
        "scopes": ["users:read"],
        "exp": datetime.now(timezone.utc) + timedelta(hours=1),
        "iat": datetime.now(timezone.utc),
        "aud": settings.JWT_AUDIENCE,
        "iss": settings.jwt_issuer,
    }
    return _create_token(payload)


@pytest.fixture
def token_without_scopes() -> str:
    """
    Generate a token without 'scopes' claim but with role.
    The middleware should map the role to scopes automatically.
    """
    payload = {
        "sub": str(uuid4()),
        "email": "test@example.com",
        "role": "authenticated",  # This should be mapped to scopes
        "exp": datetime.now(timezone.utc) + timedelta(hours=1),
        "iat": datetime.now(timezone.utc),
        "aud": settings.JWT_AUDIENCE,
        "iss": settings.jwt_issuer,
    }
    return _create_token(payload)


@pytest.fixture
def token_with_string_scopes() -> str:
    """Generate a token with scopes as a string instead of list (invalid)."""
    payload = {
        "sub": str(uuid4()),
        "email": "test@example.com",
        "scopes": "users:read",  # String instead of list - invalid
        "exp": datetime.now(timezone.utc) + timedelta(hours=1),
        "iat": datetime.now(timezone.utc),
        "aud": settings.JWT_AUDIENCE,
        "iss": settings.jwt_issuer,
    }
    return _create_token(payload)


@pytest.fixture
def token_insufficient_scopes() -> str:
    """Generate a token with insufficient scopes."""
    payload = {
        "sub": str(uuid4()),
        "email": "test@example.com",
        "scopes": ["users:read"],  # Missing write/delete scopes
        "exp": datetime.now(timezone.utc) + timedelta(hours=1),
        "iat": datetime.now(timezone.utc),
        "aud": settings.JWT_AUDIENCE,
        "iss": settings.jwt_issuer,
    }
    return _create_token(payload)


@pytest.fixture
def expired_token() -> str:
    """Generate an expired JWT token."""
    payload = {
        "sub": str(uuid4()),
        "email": "test@example.com",
        "scopes": ["users:read", "users:create"],
        "exp": datetime.now(timezone.utc) - timedelta(hours=1),  # Expired
        "iat": datetime.now(timezone.utc) - timedelta(hours=2),
        "aud": settings.JWT_AUDIENCE,
        "iss": settings.jwt_issuer,
    }
    return _create_token(payload)


@pytest.fixture
def invalid_signature_token() -> str:
    """Generate a token with invalid signature (signed with different key)."""
    # Generate a different key pair
    different_key = ec.generate_private_key(ec.SECP256R1(), default_backend())
    payload = {
        "sub": str(uuid4()),
        "email": "test@example.com",
        "scopes": ["users:read", "users:create"],
        "exp": datetime.now(timezone.utc) + timedelta(hours=1),
        "iat": datetime.now(timezone.utc),
        "aud": settings.JWT_AUDIENCE,
        "iss": settings.jwt_issuer,
    }
    # Sign with different key but same kid (signature won't match)
    return jwt.encode(payload, different_key, algorithm="ES256", headers={"kid": "test-key-id"})


@pytest.fixture
def invalid_audience_token() -> str:
    """Generate a token with wrong audience."""
    payload = {
        "sub": str(uuid4()),
        "email": "test@example.com",
        "scopes": ["users:read"],
        "exp": datetime.now(timezone.utc) + timedelta(hours=1),
        "iat": datetime.now(timezone.utc),
        "aud": "wrong-audience",  # Invalid audience
        "iss": settings.jwt_issuer,
    }
    return _create_token(payload)


@pytest.fixture
def invalid_issuer_token() -> str:
    """Generate a token with wrong issuer."""
    payload = {
        "sub": str(uuid4()),
        "email": "test@example.com",
        "scopes": ["users:read"],
        "exp": datetime.now(timezone.utc) + timedelta(hours=1),
        "iat": datetime.now(timezone.utc),
        "aud": settings.JWT_AUDIENCE,
        "iss": "https://wrong-issuer.com/auth/v1",  # Invalid issuer
    }
    return _create_token(payload)


@pytest.fixture
def test_user_id() -> str:
    """Generate a consistent test user ID for tests that need it."""
    return str(uuid4())


@pytest.fixture
def token_for_user(test_user_id: str) -> str:
    """Generate a valid token for a specific user ID."""
    payload = {
        "sub": test_user_id,
        "email": "testuser@example.com",
        "role": "authenticated",
        "scopes": ["users:read", "users:create", "users:update", "users:delete"],
        "exp": datetime.now(timezone.utc) + timedelta(hours=1),
        "iat": datetime.now(timezone.utc),
        "aud": settings.JWT_AUDIENCE,
        "iss": settings.jwt_issuer,
    }
    return _create_token(payload)

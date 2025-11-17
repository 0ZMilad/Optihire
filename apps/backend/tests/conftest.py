"""
Pytest configuration and fixtures for auth middleware tests.
"""
import pytest
from datetime import datetime, timezone, timedelta
from typing import Dict, List
import jwt
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.core.config import settings
from app.middleware.auth import JWTMiddleware


@pytest.fixture
def app():
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
def client(app):
    """Create a test client."""
    return TestClient(app)


@pytest.fixture
def jwt_secret():
    """Get JWT secret from settings."""
    return settings.SUPABASE_JWT_SECRET


@pytest.fixture
def valid_token(jwt_secret):
    """Generate a valid JWT token with all required claims."""
    payload = {
        "sub": "test-user-id-123",
        "email": "test@example.com",
        "scopes": ["users:read", "users:write", "users:create", "users:update", "users:delete"],
        "exp": datetime.now(timezone.utc) + timedelta(hours=1),
        "iat": datetime.now(timezone.utc),
        "aud": settings.JWT_AUDIENCE,
        "iss": settings.jwt_issuer,
    }
    return jwt.encode(payload, jwt_secret, algorithm=settings.JWT_ALGORITHM)


@pytest.fixture
def token_missing_sub(jwt_secret):
    """Generate a token missing the 'sub' claim."""
    payload = {
        "email": "test@example.com",
        "scopes": ["users:read"],
        "exp": datetime.now(timezone.utc) + timedelta(hours=1),
        "iat": datetime.now(timezone.utc),
        "aud": settings.JWT_AUDIENCE,
        "iss": settings.jwt_issuer,
    }
    return jwt.encode(payload, jwt_secret, algorithm=settings.JWT_ALGORITHM)


@pytest.fixture
def token_missing_scopes(jwt_secret):
    """Generate a token missing the 'scopes' claim."""
    payload = {
        "sub": "test-user-id-123",
        "email": "test@example.com",
        "exp": datetime.now(timezone.utc) + timedelta(hours=1),
        "iat": datetime.now(timezone.utc),
        "aud": settings.JWT_AUDIENCE,
        "iss": settings.jwt_issuer,
    }
    return jwt.encode(payload, jwt_secret, algorithm=settings.JWT_ALGORITHM)


@pytest.fixture
def token_insufficient_scopes(jwt_secret):
    """Generate a token with insufficient scopes."""
    payload = {
        "sub": "test-user-id-123",
        "email": "test@example.com",
        "scopes": ["users:read"],  # Missing write/delete scopes
        "exp": datetime.now(timezone.utc) + timedelta(hours=1),
        "iat": datetime.now(timezone.utc),
        "aud": settings.JWT_AUDIENCE,
        "iss": settings.jwt_issuer,
    }
    return jwt.encode(payload, jwt_secret, algorithm=settings.JWT_ALGORITHM)


@pytest.fixture
def expired_token(jwt_secret):
    """Generate an expired JWT token."""
    payload = {
        "sub": "test-user-id-123",
        "email": "test@example.com",
        "scopes": ["users:read", "users:write"],
        "exp": datetime.now(timezone.utc) - timedelta(hours=1),  # Expired
        "iat": datetime.now(timezone.utc) - timedelta(hours=2),
        "aud": settings.JWT_AUDIENCE,
        "iss": settings.jwt_issuer,
    }
    return jwt.encode(payload, jwt_secret, algorithm=settings.JWT_ALGORITHM)


@pytest.fixture
def invalid_signature_token(jwt_secret):
    """Generate a token with invalid signature."""
    payload = {
        "sub": "test-user-id-123",
        "email": "test@example.com",
        "scopes": ["users:read", "users:write"],
        "exp": datetime.now(timezone.utc) + timedelta(hours=1),
        "iat": datetime.now(timezone.utc),
        "aud": settings.JWT_AUDIENCE,
        "iss": settings.jwt_issuer,
    }
    # Use wrong secret to create invalid signature
    return jwt.encode(payload, "wrong-secret", algorithm=settings.JWT_ALGORITHM)

"""
Tests for GET /api/v1/analyses/{id} endpoint.

Covers:
- 200  — valid ID owned by the requesting user
- 401  — unauthenticated request
- 403  — ID exists but belongs to a different user
- 404  — non-existent UUID
"""
from datetime import datetime, timezone, timedelta
from typing import Generator
from unittest.mock import patch, MagicMock
from uuid import uuid4, UUID

import pytest
from fastapi import HTTPException, status
from fastapi.testclient import TestClient
from sqlmodel import Session

from app.main import app
from app.db.session import get_db
from app.core.config import settings
from app.core.jwt import jwks_cache
from app.schemas.analysis_schema import AnalysisResultRead

# Re-use shared JWT helpers from conftest
from tests.conftest import _create_token, _get_test_jwk


# ---------------------------------------------------------------------------
# Client fixture — uses a MagicMock session to avoid SQLite/ARRAY incompatibility.
# All service calls are mocked at the endpoint level, so no real DB is needed.
# ---------------------------------------------------------------------------

@pytest.fixture(name="client")
def client_fixture() -> Generator[TestClient, None, None]:
    mock_session = MagicMock(spec=Session)
    app.dependency_overrides[get_db] = lambda: mock_session

    with TestClient(app) as client:
        yield client

    app.dependency_overrides.clear()


@pytest.fixture(autouse=True)
def setup_jwks():
    """Populate the JWKS cache so JWT validation works without hitting Supabase."""
    jwks_cache["keys"] = [_get_test_jwk()]
    jwks_cache["fetched_at"] = datetime.now(timezone.utc).timestamp()
    yield
    jwks_cache["keys"] = None
    jwks_cache["fetched_at"] = None


# ---------------------------------------------------------------------------
# Token helpers
# ---------------------------------------------------------------------------

def _make_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "email": "analyst@example.com",
        "role": "authenticated",
        "scopes": [],
        "exp": datetime.now(timezone.utc) + timedelta(hours=1),
        "iat": datetime.now(timezone.utc),
        "aud": settings.JWT_AUDIENCE,
        "iss": settings.jwt_issuer,
    }
    return _create_token(payload)


def _auth(user_id: str) -> dict:
    return {"Authorization": f"Bearer {_make_token(user_id)}"}


# ---------------------------------------------------------------------------
# Shared sample response returned by the mocked service
# ---------------------------------------------------------------------------

def _sample_result(result_id: UUID, resume_id: UUID) -> AnalysisResultRead:
    return AnalysisResultRead(
        id=result_id,
        resume_id=resume_id,
        job_description_id=None,
        resume_content_hash=None,
        job_description_hash=None,
        overall_score=82,
        keyword_score=75,
        formatting_score=88,
        section_score=90,
        matched_keywords=["python", "fastapi"],
        missing_keywords=["docker"],
        keyword_density=None,
        has_contact_info=True,
        has_summary=True,
        has_experience=True,
        has_education=True,
        has_skills=True,
        has_consistent_formatting=True,
        has_bullet_points=True,
        has_action_verbs=True,
        is_scannable=True,
        suggestions_payload=None,
        ai_enhancement=None,
        skills_version=None,
        keywords_rules_version=None,
        analysis_version="1.0",
        analyzed_at=datetime(2026, 2, 27, 12, 0, 0, tzinfo=timezone.utc),
    )


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

class TestGetAnalysisById:
    """Tests for GET /api/v1/analyses/{id}."""

    def test_returns_200_with_correct_payload(self, client: TestClient):
        """Authenticated owner gets the full AnalysisResultRead payload."""
        user_id = str(uuid4())
        result_id = uuid4()
        resume_id = uuid4()
        sample = _sample_result(result_id, resume_id)

        with patch(
            "app.api.v1.endpoints.analysis.get_audit_result",
            return_value=sample,
        ):
            response = client.get(
                f"/api/v1/analyses/{result_id}",
                headers=_auth(user_id),
            )

        assert response.status_code == status.HTTP_200_OK
        body = response.json()
        assert body["id"] == str(result_id)
        assert body["resume_id"] == str(resume_id)
        assert body["overall_score"] == 82
        assert body["keyword_score"] == 75
        assert body["formatting_score"] == 88
        assert body["section_score"] == 90
        assert body["matched_keywords"] == ["python", "fastapi"]
        assert body["missing_keywords"] == ["docker"]
        assert body["analysis_version"] == "1.0"

    def test_returns_401_without_token(self, client: TestClient):
        """Unauthenticated request is rejected before reaching the service."""
        result_id = uuid4()
        response = client.get(f"/api/v1/analyses/{result_id}")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_returns_404_for_nonexistent_id(self, client: TestClient):
        """Service raises 404 when the result ID does not exist."""
        user_id = str(uuid4())
        nonexistent_id = uuid4()

        with patch(
            "app.api.v1.endpoints.analysis.get_audit_result",
            side_effect=HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Analysis result not found.",
            ),
        ):
            response = client.get(
                f"/api/v1/analyses/{nonexistent_id}",
                headers=_auth(user_id),
            )

        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert response.json()["detail"] == "Analysis result not found."

    def test_returns_403_for_result_owned_by_another_user(self, client: TestClient):
        """Authenticated user cannot access a result that belongs to someone else."""
        requesting_user_id = str(uuid4())
        result_id = uuid4()

        with patch(
            "app.api.v1.endpoints.analysis.get_audit_result",
            side_effect=HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied.",
            ),
        ):
            response = client.get(
                f"/api/v1/analyses/{result_id}",
                headers=_auth(requesting_user_id),
            )

        assert response.status_code == status.HTTP_403_FORBIDDEN
        assert response.json()["detail"] == "Access denied."

    def test_service_called_with_correct_args(self, client: TestClient):
        """Endpoint extracts user_id from JWT and result_id from path correctly."""
        user_id = str(uuid4())
        result_id = uuid4()
        resume_id = uuid4()
        sample = _sample_result(result_id, resume_id)

        with patch(
            "app.api.v1.endpoints.analysis.get_audit_result",
            return_value=sample,
        ) as mock_service:
            client.get(
                f"/api/v1/analyses/{result_id}",
                headers=_auth(user_id),
            )

        mock_service.assert_called_once()
        call_kwargs = mock_service.call_args.kwargs
        assert call_kwargs["result_id"] == result_id
        assert call_kwargs["user_id"] == UUID(user_id)

    def test_invalid_uuid_path_param_returns_422(self, client: TestClient):
        """A non-UUID path segment is rejected by FastAPI validation."""
        user_id = str(uuid4())
        response = client.get(
            "/api/v1/analyses/not-a-uuid",
            headers=_auth(user_id),
        )
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


class TestAuditEndpointAIEnhance:
    """Tests for POST /api/v1/analyses/audit with ?ai_enhance query param."""

    def test_audit_with_ai_enhance_false_returns_null_enhancement(self, client: TestClient):
        """Default (no ai_enhance param) returns ai_enhancement=null."""
        user_id = str(uuid4())
        result_id = uuid4()
        resume_id = uuid4()
        sample = _sample_result(result_id, resume_id)

        with patch(
            "app.api.v1.endpoints.analysis.run_audit",
            return_value=sample,
        ):
            response = client.post(
                "/api/v1/analyses/audit",
                headers=_auth(user_id),
                json={
                    "resume_id": str(resume_id),
                    "job_description": "Looking for a Python developer.",
                },
            )

        assert response.status_code == status.HTTP_200_OK
        body = response.json()
        assert body["ai_enhancement"] is None

    def test_audit_with_ai_enhance_true_returns_enhancement(self, client: TestClient):
        """When ai_enhance=true and LLM succeeds, ai_enhancement is populated."""
        user_id = str(uuid4())
        result_id = uuid4()
        resume_id = uuid4()

        ai_payload = {
            "bullet_rewrites": [
                {
                    "original": "Built APIs",
                    "rewritten": "Architected RESTful APIs on K8s",
                    "rationale": "Adds K8s keyword.",
                }
            ],
            "keyword_context_tips": [],
            "role_fit_summary": "Good fit with minor gaps.",
        }
        sample = _sample_result(result_id, resume_id)
        sample.ai_enhancement = ai_payload

        with patch(
            "app.api.v1.endpoints.analysis.run_audit",
            return_value=sample,
        ):
            response = client.post(
                "/api/v1/analyses/audit?ai_enhance=true",
                headers=_auth(user_id),
                json={
                    "resume_id": str(resume_id),
                    "job_description": "Looking for a K8s expert.",
                },
            )

        assert response.status_code == status.HTTP_200_OK
        body = response.json()
        assert body["ai_enhancement"] is not None
        assert body["ai_enhancement"]["role_fit_summary"] == "Good fit with minor gaps."
        assert len(body["ai_enhancement"]["bullet_rewrites"]) == 1

    def test_audit_ai_enhance_fallback_on_failure(self, client: TestClient):
        """LLM failure still returns 200 OK with ai_enhancement=null."""
        user_id = str(uuid4())
        result_id = uuid4()
        resume_id = uuid4()
        sample = _sample_result(result_id, resume_id)  # ai_enhancement=None

        with patch(
            "app.api.v1.endpoints.analysis.run_audit",
            return_value=sample,
        ):
            response = client.post(
                "/api/v1/analyses/audit?ai_enhance=true",
                headers=_auth(user_id),
                json={
                    "resume_id": str(resume_id),
                    "job_description": "Looking for someone.",
                },
            )

        assert response.status_code == status.HTTP_200_OK
        body = response.json()
        # In fallback, ai_enhancement is None (service returned None)
        assert body["ai_enhancement"] is None
        # Heuristic scores are still present
        assert body["overall_score"] == 82

    def test_audit_passes_ai_enhance_to_service(self, client: TestClient):
        """Endpoint passes ai_enhance=True through to the service layer."""
        user_id = str(uuid4())
        result_id = uuid4()
        resume_id = uuid4()
        sample = _sample_result(result_id, resume_id)

        with patch(
            "app.api.v1.endpoints.analysis.run_audit",
            return_value=sample,
        ) as mock_service:
            client.post(
                "/api/v1/analyses/audit?ai_enhance=true",
                headers=_auth(user_id),
                json={
                    "resume_id": str(resume_id),
                    "job_description": "Need a dev.",
                },
            )

        mock_service.assert_called_once()
        call_kwargs = mock_service.call_args.kwargs
        assert call_kwargs["ai_enhance"] is True

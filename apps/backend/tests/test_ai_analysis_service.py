"""
Tests for the AI analysis service — PII anonymization, prompt construction,
rate limiting, and graceful degradation.
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from unittest.mock import MagicMock, patch
from uuid import uuid4

import pytest

from app.models.analysis_model import AnalysisResult
from app.models.resume_model import Resume
from app.services.ai_analysis_service import (
    _MAX_RESUME_CHARS,
    _build_prompt,
    anonymize_resume_text,
    enhance_analysis,
)


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------


def _make_resume(**overrides) -> Resume:
    """Create a minimal Resume object for testing."""
    defaults = {
        "id": uuid4(),
        "user_id": uuid4(),
        "version_name": "test",
        "full_name": "Jane Smith",
        "email": "jane.smith@example.com",
        "phone": "+1 (555) 123-4567",
        "location": "San Francisco, CA",
        "linkedin_url": "https://linkedin.com/in/janesmith",
        "github_url": "https://github.com/janesmith",
        "portfolio_url": "https://janesmith.dev",
        "raw_text": (
            "Jane Smith\n"
            "jane.smith@example.com | +1 (555) 123-4567\n"
            "San Francisco, CA\n"
            "https://linkedin.com/in/janesmith | https://github.com/janesmith\n\n"
            "PROFESSIONAL SUMMARY\n"
            "Experienced software engineer with 5 years in Python and FastAPI.\n\n"
            "WORK EXPERIENCE\n"
            "Senior Developer at TechCorp (2021-2024)\n"
            "- Built scalable REST APIs serving 10K+ requests/day\n"
            "- Led migration from monolith to microservices architecture\n"
            "- Mentored 3 junior developers\n\n"
            "SKILLS\n"
            "Python, FastAPI, Docker, PostgreSQL, AWS\n\n"
            "EDUCATION\n"
            "BS Computer Science, Stanford University, 2019\n"
        ),
    }
    defaults.update(overrides)
    resume = Resume()
    for k, v in defaults.items():
        setattr(resume, k, v)
    return resume


def _make_heuristic_result(**overrides) -> AnalysisResult:
    """Create a minimal AnalysisResult for testing."""
    defaults = {
        "id": uuid4(),
        "resume_id": uuid4(),
        "job_description_id": uuid4(),
        "overall_score": 72,
        "keyword_score": 60,
        "formatting_score": 85,
        "section_score": 90,
        "matched_keywords": ["python", "fastapi", "postgresql"],
        "missing_keywords": ["kubernetes", "terraform", "ci/cd"],
        "keyword_density": None,
        "has_contact_info": True,
        "has_summary": True,
        "has_experience": True,
        "has_education": True,
        "has_skills": True,
        "has_consistent_formatting": True,
        "has_bullet_points": True,
        "has_action_verbs": True,
        "is_scannable": True,
        "suggestions_payload": {"some": "payload"},
        "analysis_version": "3.0",
        "analyzed_at": datetime.now(timezone.utc),
    }
    defaults.update(overrides)
    result = AnalysisResult()
    for k, v in defaults.items():
        setattr(result, k, v)
    return result


# ---------------------------------------------------------------------------
# PII Anonymization Tests
# ---------------------------------------------------------------------------


class TestAnonymizeResumeText:
    """Tests for the anonymize_resume_text function."""

    def test_strips_structured_name(self):
        resume = _make_resume()
        result = anonymize_resume_text(resume.raw_text, resume)
        assert "Jane" not in result
        assert "Smith" not in result
        assert "[NAME]" in result

    def test_strips_structured_email(self):
        resume = _make_resume()
        result = anonymize_resume_text(resume.raw_text, resume)
        assert "jane.smith@example.com" not in result
        # Either [EMAIL] from structured or generic pass
        assert "[EMAIL]" in result

    def test_strips_structured_phone(self):
        resume = _make_resume()
        result = anonymize_resume_text(resume.raw_text, resume)
        assert "+1 (555) 123-4567" not in result
        assert "[PHONE]" in result

    def test_strips_structured_location(self):
        resume = _make_resume()
        result = anonymize_resume_text(resume.raw_text, resume)
        assert "San Francisco, CA" not in result
        assert "[LOCATION]" in result

    def test_strips_linkedin_url(self):
        resume = _make_resume()
        result = anonymize_resume_text(resume.raw_text, resume)
        assert "linkedin.com/in/janesmith" not in result

    def test_strips_github_url(self):
        resume = _make_resume()
        result = anonymize_resume_text(resume.raw_text, resume)
        assert "github.com/janesmith" not in result

    def test_strips_portfolio_url(self):
        resume = _make_resume()
        result = anonymize_resume_text(resume.raw_text, resume)
        assert "janesmith.dev" not in result

    def test_preserves_non_pii_content(self):
        resume = _make_resume()
        result = anonymize_resume_text(resume.raw_text, resume)
        assert "Experienced software engineer" in result
        assert "Built scalable REST APIs" in result
        assert "Python" in result or "python" in result.lower()
        assert "TechCorp" in result

    def test_strips_generic_email_not_in_structured_fields(self):
        """Generic regex catches emails not stored in resume.email."""
        resume = _make_resume(
            raw_text="Contact: unknown-person@gmail.com for inquiries."
        )
        result = anonymize_resume_text(resume.raw_text, resume)
        assert "unknown-person@gmail.com" not in result
        assert "[EMAIL]" in result

    def test_strips_generic_phone_not_in_structured_fields(self):
        """Generic regex catches phone numbers not stored in resume.phone."""
        resume = _make_resume(
            raw_text="Call 555-987-6543 or 1234567890 for details."
        )
        result = anonymize_resume_text(resume.raw_text, resume)
        assert "555-987-6543" not in result

    def test_strips_generic_url_not_in_structured_fields(self):
        """Generic regex catches URLs not stored in structured fields."""
        resume = _make_resume(
            raw_text="Check out https://my-secret-portfolio.com for samples."
        )
        result = anonymize_resume_text(resume.raw_text, resume)
        assert "https://my-secret-portfolio.com" not in result
        assert "[URL]" in result

    def test_handles_none_fields_gracefully(self):
        """Resume with null PII fields doesn't crash."""
        resume = _make_resume(
            full_name=None,
            email=None,
            phone=None,
            location=None,
            linkedin_url=None,
            github_url=None,
            portfolio_url=None,
            raw_text="Just plain text with no PII fields set.",
        )
        result = anonymize_resume_text(resume.raw_text, resume)
        assert "Just plain text" in result


# ---------------------------------------------------------------------------
# Prompt Construction Tests
# ---------------------------------------------------------------------------


class TestBuildPrompt:
    """Tests for the _build_prompt function."""

    def test_prompt_contains_job_description(self):
        messages = _build_prompt(
            anonymized_text="Work experience here",
            job_description="We need a Senior Python Developer with K8s.",
            missing_keywords=["kubernetes"],
            keyword_score=55,
            formatting_flags=None,
        )
        user_msg = messages[1]["content"]
        assert "Senior Python Developer" in user_msg
        assert "K8s" in user_msg

    def test_prompt_contains_missing_keywords(self):
        messages = _build_prompt(
            anonymized_text="Work experience here",
            job_description="Job description text",
            missing_keywords=["docker", "terraform", "ci/cd"],
            keyword_score=40,
            formatting_flags=None,
        )
        user_msg = messages[1]["content"]
        assert "docker" in user_msg
        assert "terraform" in user_msg
        assert "ci/cd" in user_msg

    def test_prompt_contains_anonymized_resume(self):
        messages = _build_prompt(
            anonymized_text="Built scalable APIs at [NAME] Corp",
            job_description="Job description text",
            missing_keywords=[],
            keyword_score=80,
            formatting_flags=None,
        )
        user_msg = messages[1]["content"]
        assert "Built scalable APIs" in user_msg
        assert "[NAME]" in user_msg

    def test_prompt_excludes_pii(self):
        """No real PII should appear in the prompt."""
        messages = _build_prompt(
            anonymized_text="[NAME] worked at TechCorp using Python",
            job_description="Looking for engineers",
            missing_keywords=[],
            keyword_score=80,
            formatting_flags=None,
        )
        full_text = " ".join(m["content"] for m in messages)
        assert "jane" not in full_text.lower()
        assert "smith" not in full_text.lower()
        assert "jane.smith@example.com" not in full_text

    def test_prompt_includes_formatting_gaps(self):
        messages = _build_prompt(
            anonymized_text="Resume text",
            job_description="JD text",
            missing_keywords=[],
            keyword_score=70,
            formatting_flags={
                "has_summary": True,
                "has_action_verbs": False,
                "has_bullet_points": False,
            },
        )
        user_msg = messages[1]["content"]
        assert "has_action_verbs" in user_msg
        assert "has_bullet_points" in user_msg

    def test_system_message_requests_json(self):
        messages = _build_prompt(
            anonymized_text="text",
            job_description="jd",
            missing_keywords=[],
            keyword_score=80,
            formatting_flags=None,
        )
        system_msg = messages[0]["content"]
        assert "JSON" in system_msg
        assert "bullet_rewrites" in system_msg
        assert "keyword_context_tips" in system_msg
        assert "role_fit_summary" in system_msg


# ---------------------------------------------------------------------------
# enhance_analysis Tests
# ---------------------------------------------------------------------------


_VALID_LLM_RESPONSE = {
    "bullet_rewrites": [
        {
            "original": "Built APIs",
            "rewritten": "Architected and deployed RESTful APIs on Kubernetes serving 50K RPM",
            "rationale": "Adds quantified impact and missing keyword (Kubernetes).",
        }
    ],
    "keyword_context_tips": [
        {
            "keyword": "terraform",
            "suggested_section": "Experience",
            "example_usage": "Provisioned cloud infrastructure using Terraform modules.",
        }
    ],
    "role_fit_summary": "Strong backend foundation. Adding Kubernetes and IaC experience would close the gap.",
}


class TestEnhanceAnalysis:
    """Tests for the enhance_analysis orchestration function."""

    @patch("app.services.ai_analysis_service.settings")
    def test_returns_none_when_disabled(self, mock_settings):
        mock_settings.AI_ENHANCE_ENABLED = False
        db = MagicMock()
        resume = _make_resume()
        result = _make_heuristic_result()

        enhancement = enhance_analysis(
            user_id=resume.user_id,
            resume=resume,
            job_description_text="Some JD",
            heuristic_result=result,
            db=db,
        )
        assert enhancement is None

    @patch("app.services.ai_analysis_service.settings")
    def test_returns_none_when_no_api_key(self, mock_settings):
        mock_settings.AI_ENHANCE_ENABLED = True
        mock_settings.LITELLM_API_KEY = ""
        db = MagicMock()
        resume = _make_resume()
        result = _make_heuristic_result()

        enhancement = enhance_analysis(
            user_id=resume.user_id,
            resume=resume,
            job_description_text="Some JD",
            heuristic_result=result,
            db=db,
        )
        assert enhancement is None

    @patch("app.services.ai_analysis_service._check_rate_limit", return_value=False)
    @patch("app.services.ai_analysis_service.settings")
    def test_returns_none_on_rate_limit(self, mock_settings, mock_rate):
        mock_settings.AI_ENHANCE_ENABLED = True
        mock_settings.LITELLM_API_KEY = "sk-test"
        mock_settings.MAX_AI_CALLS_PER_DAY = 10
        db = MagicMock()
        resume = _make_resume()
        result = _make_heuristic_result()

        enhancement = enhance_analysis(
            user_id=resume.user_id,
            resume=resume,
            job_description_text="Some JD",
            heuristic_result=result,
            db=db,
        )
        assert enhancement is None

    @patch("app.services.ai_analysis_service.litellm")
    @patch("app.services.ai_analysis_service._check_rate_limit", return_value=True)
    @patch("app.services.ai_analysis_service.settings")
    def test_success_returns_valid_payload(self, mock_settings, mock_rate, mock_litellm):
        mock_settings.AI_ENHANCE_ENABLED = True
        mock_settings.LITELLM_API_KEY = "sk-test"
        mock_settings.LLM_PROVIDER = "gpt-4o"
        mock_settings.LITELLM_TEMPERATURE = 0.3
        mock_settings.LITELLM_MAX_TOKENS = 2000

        # Mock LLM response
        mock_choice = MagicMock()
        mock_choice.message.content = json.dumps(_VALID_LLM_RESPONSE)
        mock_response = MagicMock()
        mock_response.choices = [mock_choice]
        mock_litellm.completion.return_value = mock_response

        db = MagicMock()
        resume = _make_resume()
        result = _make_heuristic_result()

        enhancement = enhance_analysis(
            user_id=resume.user_id,
            resume=resume,
            job_description_text="Looking for a Senior Python Dev with K8s.",
            heuristic_result=result,
            db=db,
        )

        assert enhancement is not None
        assert "bullet_rewrites" in enhancement
        assert "keyword_context_tips" in enhancement
        assert "role_fit_summary" in enhancement
        assert len(enhancement["bullet_rewrites"]) == 1
        assert enhancement["bullet_rewrites"][0]["original"] == "Built APIs"

    @patch("app.services.ai_analysis_service.litellm")
    @patch("app.services.ai_analysis_service._check_rate_limit", return_value=True)
    @patch("app.services.ai_analysis_service.settings")
    def test_graceful_on_api_error(self, mock_settings, mock_rate, mock_litellm):
        """LLM API failure returns None, does not crash."""
        mock_settings.AI_ENHANCE_ENABLED = True
        mock_settings.LITELLM_API_KEY = "sk-test"
        mock_settings.LLM_PROVIDER = "gpt-4o"
        mock_settings.LITELLM_TEMPERATURE = 0.3
        mock_settings.LITELLM_MAX_TOKENS = 2000

        mock_litellm.completion.side_effect = Exception("API quota exceeded")

        db = MagicMock()
        resume = _make_resume()
        result = _make_heuristic_result()

        enhancement = enhance_analysis(
            user_id=resume.user_id,
            resume=resume,
            job_description_text="Some JD",
            heuristic_result=result,
            db=db,
        )
        assert enhancement is None

    @patch("app.services.ai_analysis_service.litellm")
    @patch("app.services.ai_analysis_service._check_rate_limit", return_value=True)
    @patch("app.services.ai_analysis_service.settings")
    def test_graceful_on_invalid_json(self, mock_settings, mock_rate, mock_litellm):
        """LLM returns malformed JSON — function returns None."""
        mock_settings.AI_ENHANCE_ENABLED = True
        mock_settings.LITELLM_API_KEY = "sk-test"
        mock_settings.LLM_PROVIDER = "gpt-4o"
        mock_settings.LITELLM_TEMPERATURE = 0.3
        mock_settings.LITELLM_MAX_TOKENS = 2000

        mock_choice = MagicMock()
        mock_choice.message.content = "This is not valid JSON {{"
        mock_response = MagicMock()
        mock_response.choices = [mock_choice]
        mock_litellm.completion.return_value = mock_response

        db = MagicMock()
        resume = _make_resume()
        result = _make_heuristic_result()

        enhancement = enhance_analysis(
            user_id=resume.user_id,
            resume=resume,
            job_description_text="Some JD",
            heuristic_result=result,
            db=db,
        )
        assert enhancement is None

    @patch("app.services.ai_analysis_service.litellm")
    @patch("app.services.ai_analysis_service._check_rate_limit", return_value=True)
    @patch("app.services.ai_analysis_service.settings")
    def test_graceful_on_schema_validation_error(self, mock_settings, mock_rate, mock_litellm):
        """LLM returns valid JSON but missing required fields — returns None."""
        mock_settings.AI_ENHANCE_ENABLED = True
        mock_settings.LITELLM_API_KEY = "sk-test"
        mock_settings.LLM_PROVIDER = "gpt-4o"
        mock_settings.LITELLM_TEMPERATURE = 0.3
        mock_settings.LITELLM_MAX_TOKENS = 2000

        # Missing required 'role_fit_summary'
        incomplete = {"bullet_rewrites": [], "keyword_context_tips": []}
        mock_choice = MagicMock()
        mock_choice.message.content = json.dumps(incomplete)
        mock_response = MagicMock()
        mock_response.choices = [mock_choice]
        mock_litellm.completion.return_value = mock_response

        db = MagicMock()
        resume = _make_resume()
        result = _make_heuristic_result()

        enhancement = enhance_analysis(
            user_id=resume.user_id,
            resume=resume,
            job_description_text="Some JD",
            heuristic_result=result,
            db=db,
        )
        assert enhancement is None

    @patch("app.services.ai_analysis_service.litellm")
    @patch("app.services.ai_analysis_service._check_rate_limit", return_value=True)
    @patch("app.services.ai_analysis_service.settings")
    def test_returns_none_when_no_raw_text(self, mock_settings, mock_rate, mock_litellm):
        """Resume with no raw_text returns None."""
        mock_settings.AI_ENHANCE_ENABLED = True
        mock_settings.LITELLM_API_KEY = "sk-test"

        db = MagicMock()
        resume = _make_resume(raw_text=None)
        result = _make_heuristic_result()

        enhancement = enhance_analysis(
            user_id=resume.user_id,
            resume=resume,
            job_description_text="Some JD",
            heuristic_result=result,
            db=db,
        )
        assert enhancement is None

    @patch("app.services.ai_analysis_service.litellm")
    @patch("app.services.ai_analysis_service._check_rate_limit", return_value=True)
    @patch("app.services.ai_analysis_service.settings")
    def test_pii_excluded_from_llm_call(self, mock_settings, mock_rate, mock_litellm):
        """Verify the actual messages sent to litellm contain no PII."""
        mock_settings.AI_ENHANCE_ENABLED = True
        mock_settings.LITELLM_API_KEY = "sk-test"
        mock_settings.LLM_PROVIDER = "gpt-4o"
        mock_settings.LITELLM_TEMPERATURE = 0.3
        mock_settings.LITELLM_MAX_TOKENS = 2000

        mock_choice = MagicMock()
        mock_choice.message.content = json.dumps(_VALID_LLM_RESPONSE)
        mock_response = MagicMock()
        mock_response.choices = [mock_choice]
        mock_litellm.completion.return_value = mock_response

        db = MagicMock()
        resume = _make_resume()
        result = _make_heuristic_result()

        enhance_analysis(
            user_id=resume.user_id,
            resume=resume,
            job_description_text="Need Python dev",
            heuristic_result=result,
            db=db,
        )

        # Inspect the messages sent to litellm
        call_kwargs = mock_litellm.completion.call_args
        messages = call_kwargs.kwargs.get("messages") or call_kwargs[1].get("messages")
        full_text = " ".join(m["content"] for m in messages)

        assert "jane" not in full_text.lower()
        assert "smith" not in full_text.lower()
        assert "jane.smith@example.com" not in full_text
        assert "+1 (555) 123-4567" not in full_text
        assert "San Francisco" not in full_text
        assert "linkedin.com/in/janesmith" not in full_text
        assert "github.com/janesmith" not in full_text
        assert "janesmith.dev" not in full_text

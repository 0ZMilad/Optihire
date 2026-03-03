"""
AI-enhanced analysis service — LLM career-coach layer.

Provides opt-in AI enhancement on top of the heuristic analysis engine.
Key responsibilities:
  • Anonymize resume text by stripping PII (structured fields + generic regex)
  • Construct a focused prompt with anonymized CV, JD, and heuristic gaps
  • Call the LLM via litellm (vendor-agnostic) and parse structured JSON output
  • Gracefully degrade — any failure returns None so the heuristic result is unaffected
"""

from __future__ import annotations

import json
import logging
import re
from datetime import date, datetime, timezone
from typing import Any
from uuid import UUID

import litellm
from json_repair import repair_json
from pydantic import ValidationError
from sqlmodel import Session, func, select

from app.core.config import settings
from app.models.analysis_model import AnalysisResult
from app.models.resume_model import Resume
from app.schemas.analysis_schema import AIEnhancementPayload

logger = logging.getLogger("optihire.ai_analysis")

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

# Generic PII regex patterns (safety net beyond structured field stripping)
_EMAIL_RE = re.compile(r"\S+@\S+\.\S+", re.IGNORECASE)
_PHONE_RE = re.compile(r"\+?\d[\d\-\s().]{7,}\d")
_URL_RE = re.compile(r"https?://\S+", re.IGNORECASE)

# Maximum characters of anonymized resume text sent to the LLM
_MAX_RESUME_CHARS = 6000

# Matches an optional ```json ... ``` wrapper that some models emit
_CODE_FENCE_RE = re.compile(r"```(?:json)?\s*(.*?)\s*```", re.DOTALL)


def _extract_json(content: str) -> Any:
    """Best-effort JSON extraction + repair from a (possibly fenced) LLM response.

    Strategy:
      1. Strip ```json ... ``` markdown fences if present.
      2. Try strict json.loads on the cleaned string.
      3. Use json_repair to fix common LLM JSON errors (missing commas,
         unescaped characters, truncated strings, trailing commas, etc.).
    """
    # 1. Strip code fences
    fence_match = _CODE_FENCE_RE.search(content)
    cleaned = fence_match.group(1) if fence_match else content.strip()

    # 2. Fast path — strict parse
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    # 3. json_repair handles missing commas, bad escapes, truncation, etc.
    repaired = repair_json(cleaned, return_objects=True)
    if isinstance(repaired, dict):
        return repaired

    raise json.JSONDecodeError("No valid JSON found in LLM response", content, 0)


# ---------------------------------------------------------------------------
# PII anonymization
# ---------------------------------------------------------------------------


def anonymize_resume_text(raw_text: str, resume: Resume) -> str:
    """Strip PII from resume text before sending it to a third-party LLM.

    Strategy:
      1. Replace known structured PII fields (name, email, phone, location, URLs)
      2. Apply generic regex patterns as a safety net for any remaining PII
    """
    text = raw_text

    # --- Structured field replacement ---
    if resume.full_name:
        # Replace full name and individual name parts (first, last)
        text = text.replace(resume.full_name, "[NAME]")
        for part in resume.full_name.split():
            if len(part) > 2:  # Skip very short fragments like initials
                text = re.sub(re.escape(part), "[NAME]", text, flags=re.IGNORECASE)

    if resume.email:
        text = text.replace(resume.email, "[EMAIL]")

    if resume.phone:
        text = text.replace(resume.phone, "[PHONE]")

    if resume.location:
        text = text.replace(resume.location, "[LOCATION]")

    for url_field in (resume.linkedin_url, resume.github_url, resume.portfolio_url):
        if url_field:
            text = text.replace(url_field, "")

    # --- Generic regex safety net ---
    text = _EMAIL_RE.sub("[EMAIL]", text)
    text = _PHONE_RE.sub("[PHONE]", text)
    text = _URL_RE.sub("[URL]", text)

    return text


# ---------------------------------------------------------------------------
# Prompt construction
# ---------------------------------------------------------------------------

_SYSTEM_PROMPT = """\
You are a professional career coach and ATS optimization expert.
You will receive an ANONYMIZED resume (all personal information removed), \
a job description, and heuristic analysis findings.

Your task is to provide specific, actionable feedback to help the candidate \
tailor their resume for this role. Return ONLY valid JSON matching this schema:

{
  "bullet_rewrites": [
    {"original": "...", "rewritten": "...", "rationale": "..."}
  ],
  "keyword_context_tips": [
    {"keyword": "...", "suggested_section": "...", "example_usage": "..."}
  ],
  "role_fit_summary": "A 2-3 sentence qualitative analysis of candidate fit."
}

Rules:
- Provide 3-5 bullet rewrites focusing on the weakest examples.
- For each missing keyword, show WHERE and HOW to insert it naturally.
- The role_fit_summary should be honest but constructive.
- Do NOT invent experience the candidate does not have.
- Do NOT include any personally identifiable information in your response.
- Return ONLY the raw JSON object. Do NOT wrap it in markdown code fences or add any text outside the JSON.
"""


def _build_prompt(
    anonymized_text: str,
    job_description: str,
    missing_keywords: list[str],
    keyword_score: int,
    formatting_flags: dict[str, Any] | None,
) -> list[dict[str, str]]:
    """Construct the chat messages for the LLM call."""

    # Summarize heuristic gaps
    gap_lines: list[str] = []
    if missing_keywords:
        gap_lines.append(f"Missing keywords ({len(missing_keywords)}): {', '.join(missing_keywords[:20])}")
    gap_lines.append(f"Keyword match score: {keyword_score}/100")

    if formatting_flags:
        weak = [k for k, v in formatting_flags.items() if v is False]
        if weak:
            gap_lines.append(f"Formatting gaps: {', '.join(weak)}")

    gaps_block = "\n".join(gap_lines) if gap_lines else "No major heuristic gaps detected."

    user_message = (
        "## Anonymized Resume\n"
        f"{anonymized_text}\n\n"
        "## Job Description\n"
        f"{job_description}\n\n"
        "## Heuristic Analysis Gaps\n"
        f"{gaps_block}\n"
    )

    return [
        {"role": "system", "content": _SYSTEM_PROMPT},
        {"role": "user", "content": user_message},
    ]


# ---------------------------------------------------------------------------
# Rate limiting (simple daily cap)
# ---------------------------------------------------------------------------


def _check_rate_limit(user_id: UUID, db: Session) -> bool:
    """Return True if the user has NOT exceeded the daily AI call limit."""
    today_start = datetime.combine(date.today(), datetime.min.time(), tzinfo=timezone.utc)

    count = db.exec(
        select(func.count())
        .select_from(AnalysisResult)
        .join(Resume, Resume.id == AnalysisResult.resume_id)
        .where(
            Resume.user_id == user_id,
            AnalysisResult.ai_enhancement.isnot(None),
            AnalysisResult.analyzed_at >= today_start,
        )
    ).one()

    return count < settings.MAX_AI_CALLS_PER_DAY


# ---------------------------------------------------------------------------
# Main enhancement function
# ---------------------------------------------------------------------------


def enhance_analysis(
    *,
    user_id: UUID,
    resume: Resume,
    job_description_text: str,
    heuristic_result: AnalysisResult,
    db: Session,
) -> dict | None:
    """Run LLM enhancement on a completed heuristic analysis.

    Returns the AI enhancement payload as a dict, or None if:
      - The feature is globally disabled (AI_ENHANCE_ENABLED=False)
      - The user has exceeded their daily rate limit
      - The LLM call fails, times out, or returns invalid JSON
    """
    # --- Guard: feature toggle ---
    if not settings.AI_ENHANCE_ENABLED:
        logger.info("AI enhancement disabled globally (AI_ENHANCE_ENABLED=False)")
        return None

    # --- Guard: API key configured ---
    if not settings.LITELLM_API_KEY:
        logger.warning("AI enhancement skipped — LITELLM_API_KEY not configured")
        return None

    # --- Guard: rate limit ---
    if not _check_rate_limit(user_id, db):
        logger.warning(
            "AI enhancement rate limit exceeded for user %s (%d/day)",
            user_id,
            settings.MAX_AI_CALLS_PER_DAY,
        )
        return None

    try:
        # 1. Anonymize
        if not resume.raw_text:
            logger.warning("AI enhancement skipped — resume has no raw_text")
            return None

        anonymized = anonymize_resume_text(resume.raw_text, resume)

        # Truncate to stay within token limits
        if len(anonymized) > _MAX_RESUME_CHARS:
            anonymized = anonymized[:_MAX_RESUME_CHARS] + "\n\n[...truncated for length]"

        # 2. Build prompt
        formatting_flags: dict[str, Any] = {}
        if heuristic_result.suggestions_payload and isinstance(
            heuristic_result.suggestions_payload, dict
        ):
            formatting_flags = {
                "has_contact_info": heuristic_result.has_contact_info,
                "has_summary": heuristic_result.has_summary,
                "has_experience": heuristic_result.has_experience,
                "has_education": heuristic_result.has_education,
                "has_skills": heuristic_result.has_skills,
                "has_consistent_formatting": heuristic_result.has_consistent_formatting,
                "has_bullet_points": heuristic_result.has_bullet_points,
                "has_action_verbs": heuristic_result.has_action_verbs,
            }

        messages = _build_prompt(
            anonymized_text=anonymized,
            job_description=job_description_text,
            missing_keywords=list(heuristic_result.missing_keywords or []),
            keyword_score=heuristic_result.keyword_score,
            formatting_flags=formatting_flags,
        )

        # 3. Call LLM via litellm
        logger.info("Calling LLM (%s) for AI enhancement", settings.LLM_PROVIDER)
        response = litellm.completion(
            model=settings.LLM_PROVIDER,
            api_key=settings.LITELLM_API_KEY,
            messages=messages,
            temperature=settings.LITELLM_TEMPERATURE,
            max_tokens=settings.LITELLM_MAX_TOKENS,
            timeout=30,
        )

        # 4. Parse response
        content = response.choices[0].message.content
        if not content:
            logger.warning("LLM returned empty content")
            return None

        parsed = _extract_json(content)

        # 5. Validate against Pydantic schema
        payload = AIEnhancementPayload.model_validate(parsed)
        logger.info(
            "AI enhancement complete — %d rewrites, %d tips",
            len(payload.bullet_rewrites),
            len(payload.keyword_context_tips),
        )
        return payload.model_dump()

    except json.JSONDecodeError as exc:
        logger.error("LLM returned invalid JSON: %s", exc)
        return None
    except ValidationError as exc:
        logger.error("LLM response failed schema validation: %s", exc)
        return None
    except Exception as exc:
        # Catch-all: litellm errors, timeouts, network issues, etc.
        logger.error("AI enhancement failed: %s: %s", type(exc).__name__, exc)
        return None

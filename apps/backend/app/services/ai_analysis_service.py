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

# Minimum content targets for a rich coach response
_MIN_BULLET_REWRITES = 4
_MIN_PRIORITY_GAPS = 3
_MIN_SECTION_FEEDBACK = 2
_MAX_PRIORITY_GAPS = 5
_MAX_SECTION_FEEDBACK = 4

# Matches an optional ```json ... ``` wrapper that some models emit
_CODE_FENCE_RE = re.compile(r"```(?:json)?\s*(.*?)\s*```", re.DOTALL)


def _clean_string_list(values: Any) -> list[str]:
    """Return only usable strings, preserving order and uniqueness."""
    if not isinstance(values, list):
        return []

    cleaned: list[str] = []
    seen: set[str] = set()
    for raw in values:
        value = str(raw).strip()
        if not value or value in seen:
            continue
        cleaned.append(value)
        seen.add(value)

    return cleaned


def _clean_bullet_rewrites(values: Any) -> list[dict[str, str]]:
    """Keep only complete bullet rewrite entries."""
    if not isinstance(values, list):
        return []

    cleaned: list[dict[str, str]] = []
    for raw in values:
        if not isinstance(raw, dict):
            continue
        original = str(raw.get("original") or "").strip()
        rewritten = str(raw.get("rewritten") or "").strip()
        rationale = str(raw.get("rationale") or "").strip()
        if original and rewritten and rationale:
            cleaned.append(
                {
                    "original": original,
                    "rewritten": rewritten,
                    "rationale": rationale,
                }
            )

    return cleaned


def _clean_keyword_context_tips(values: Any) -> list[dict[str, str]]:
    """Keep only complete keyword context tips."""
    if not isinstance(values, list):
        return []

    cleaned: list[dict[str, str]] = []
    seen: set[tuple[str, str]] = set()
    for raw in values:
        if not isinstance(raw, dict):
            continue
        keyword = str(raw.get("keyword") or "").strip()
        suggested_section = str(raw.get("suggested_section") or "").strip()
        example_usage = str(raw.get("example_usage") or "").strip()
        key = (keyword.casefold(), suggested_section.casefold())
        if not (keyword and suggested_section and example_usage) or key in seen:
            continue
        cleaned.append(
            {
                "keyword": keyword,
                "suggested_section": suggested_section,
                "example_usage": example_usage,
            }
        )
        seen.add(key)

    return cleaned


def _clean_section_feedback(values: Any) -> list[dict[str, str]]:
    """Keep only complete section feedback items."""
    if not isinstance(values, list):
        return []

    cleaned: list[dict[str, str]] = []
    seen: set[str] = set()
    for raw in values:
        if not isinstance(raw, dict):
            continue
        section_name = str(raw.get("section_name") or "").strip()
        focus = str(raw.get("focus") or raw.get("role_focus") or "").strip()
        suggested_update = str(
            raw.get("suggested_update") or raw.get("specific_change") or ""
        ).strip()
        section_key = section_name.casefold()
        if not (section_name and focus and suggested_update) or section_key in seen:
            continue
        cleaned.append(
            {
                "section_name": section_name,
                "focus": focus,
                "suggested_update": suggested_update,
            }
        )
        seen.add(section_key)

    return cleaned


def _merge_unique_strings(
    primary: list[str],
    secondary: list[str],
    *,
    max_items: int,
) -> list[str]:
    """Merge two string lists while preserving order and uniqueness."""
    merged: list[str] = []
    seen: set[str] = set()

    for value in [*primary, *secondary]:
        item = value.strip()
        if not item or item in seen:
            continue
        merged.append(item)
        seen.add(item)
        if len(merged) >= max_items:
            break

    return merged


def _merge_section_feedback(
    primary: list[dict[str, str]],
    secondary: list[dict[str, str]],
    *,
    max_items: int,
) -> list[dict[str, str]]:
    """Merge section feedback items using section_name as the unique key."""
    merged: list[dict[str, str]] = []
    seen: set[str] = set()

    for item in [*primary, *secondary]:
        section_key = item["section_name"].casefold()
        if section_key in seen:
            continue
        merged.append(item)
        seen.add(section_key)
        if len(merged) >= max_items:
            break

    return merged


def _build_heuristic_role_fit_summary(
    *,
    heuristic_result: AnalysisResult,
    target_role: str | None,
) -> str:
    """Generate a specific fallback summary when the LLM omits one."""
    role_label = target_role or "this role"
    matched_keywords = _clean_string_list(list(heuristic_result.matched_keywords or []))
    missing_keywords = _clean_string_list(list(heuristic_result.missing_keywords or []))

    if heuristic_result.overall_score >= 80:
        opener = f"You already show a strong baseline match for {role_label}"
    elif heuristic_result.overall_score >= 60:
        opener = f"You show a competitive baseline match for {role_label}"
    else:
        opener = f"You have some relevant overlap for {role_label}"

    if matched_keywords:
        opener += f", especially around {', '.join(matched_keywords[:3])}."
    else:
        opener += "."

    if missing_keywords:
        closer = (
            f"To improve alignment, make your experience with "
            f"{', '.join(missing_keywords[:3])} more explicit and quantify the "
            "strongest outcomes in your recent work."
        )
    elif not heuristic_result.has_action_verbs or not heuristic_result.has_bullet_points:
        closer = (
            "To improve alignment, rewrite your strongest bullets with clear action "
            "verbs and measurable impact."
        )
    else:
        closer = (
            "To improve alignment, sharpen the role-specific language in your summary "
            "and make your most relevant accomplishments easier to scan."
        )

    return f"{opener} {closer}"


def _build_heuristic_priority_gap_feedback(
    *,
    heuristic_result: AnalysisResult,
    target_role: str | None,
) -> list[str]:
    """Generate fallback improvement bullets from heuristic findings."""
    feedback: list[str] = []

    suggestions_payload = heuristic_result.suggestions_payload
    if isinstance(suggestions_payload, dict):
        raw_actions = suggestions_payload.get("priority_actions")
        if isinstance(raw_actions, list):
            for raw_action in raw_actions:
                if not isinstance(raw_action, dict):
                    continue
                action = str(raw_action.get("action") or "").strip()
                if action:
                    feedback.append(action)

    missing_keywords = _clean_string_list(list(heuristic_result.missing_keywords or []))
    if missing_keywords:
        feedback.append(
            "Add direct, truthful evidence of "
            f"{', '.join(missing_keywords[:3])} in your Experience and Skills sections."
        )

    if not heuristic_result.has_summary:
        feedback.append(
            f"Add a 2-3 sentence summary tailored to {target_role or 'the target role'} "
            "and front-load your most relevant strengths."
        )

    if not heuristic_result.has_skills or missing_keywords:
        feedback.append(
            "Mirror the job description's terminology in your skills section so ATS "
            "matching is easier."
        )

    if not heuristic_result.has_action_verbs or not heuristic_result.has_bullet_points:
        feedback.append(
            "Rewrite responsibility-style bullets into impact bullets that start with "
            "strong action verbs and end with measurable outcomes."
        )

    if heuristic_result.keyword_score < 70:
        feedback.append(
            "Close the keyword gap by weaving the highest-value requirements into "
            "existing achievements instead of listing them in isolation."
        )

    if heuristic_result.formatting_score < 80 or not heuristic_result.has_consistent_formatting:
        feedback.append(
            "Tighten formatting so the most relevant accomplishments are easy to scan "
            "in under 10 seconds."
        )

    return _merge_unique_strings([], feedback, max_items=_MAX_PRIORITY_GAPS)


def _build_heuristic_section_feedback(
    *,
    heuristic_result: AnalysisResult,
    target_role: str | None,
) -> list[dict[str, str]]:
    """Generate section-by-section coaching when the LLM response is thin."""
    matched_keywords = _clean_string_list(list(heuristic_result.matched_keywords or []))
    missing_keywords = _clean_string_list(list(heuristic_result.missing_keywords or []))
    items: list[dict[str, str]] = []

    summary_strengths = ", ".join(matched_keywords[:2]) or "your strongest skills"
    missing_focus = ", ".join(missing_keywords[:2]) or "the highest-priority requirements"

    items.append(
        {
            "section_name": "Summary",
            "focus": (
                f"Frame yourself as a strong candidate for {target_role or 'the role'} "
                "and surface your best-fit strengths immediately."
            ),
            "suggested_update": (
                "Add a 2-3 sentence summary that names the role, highlights "
                f"{summary_strengths}, and previews one measurable result."
            ),
        }
    )
    items.append(
        {
            "section_name": "Experience",
            "focus": (
                "Prioritize impact-driven bullets that show ownership, scale, and "
                "business outcomes."
            ),
            "suggested_update": (
                "Rewrite your top bullets to lead with action verbs, quantify the "
                f"result, and naturally mention {missing_focus} where accurate."
            ),
        }
    )
    items.append(
        {
            "section_name": "Skills",
            "focus": "Mirror the job description's technical language so ATS matching is stronger.",
            "suggested_update": (
                "Group your most relevant tools first and add any missing requirements "
                "you genuinely have experience with."
            ),
        }
    )

    if not heuristic_result.has_education:
        items.append(
            {
                "section_name": "Education",
                "focus": "Make sure required credentials are easy for recruiters to spot.",
                "suggested_update": (
                    "Add an Education section with your degree, institution, and "
                    "any relevant certifications."
                ),
            }
        )
    else:
        items.append(
            {
                "section_name": "Projects",
                "focus": "Use projects to cover gaps that are not obvious in formal roles.",
                "suggested_update": (
                    "If you have relevant side projects, add one with technologies, "
                    "scope, and measurable outcomes tied to this role."
                ),
            }
        )

    return items[:_MAX_SECTION_FEEDBACK]


def _response_needs_retry(parsed: dict[str, Any]) -> bool:
    """Require a richer response than the bare minimum old schema."""
    summary = str(parsed.get("role_fit_summary") or "").strip()
    bullet_rewrites = _clean_bullet_rewrites(parsed.get("bullet_rewrites"))
    priority_gap_feedback = _clean_string_list(parsed.get("priority_gap_feedback"))
    section_feedback = _clean_section_feedback(parsed.get("section_feedback"))

    return (
        not summary
        or len(bullet_rewrites) < _MIN_BULLET_REWRITES
        or len(priority_gap_feedback) < _MIN_PRIORITY_GAPS
        or len(section_feedback) < _MIN_SECTION_FEEDBACK
    )


def ai_enhancement_needs_refresh(payload: dict | None) -> bool:
    """Refresh cached AI payloads that were created by the old thin schema."""
    if not isinstance(payload, dict):
        return True

    summary = str(payload.get("role_fit_summary") or "").strip()
    bullet_rewrites = _clean_bullet_rewrites(payload.get("bullet_rewrites"))
    priority_gap_feedback = _clean_string_list(payload.get("priority_gap_feedback"))
    section_feedback = _clean_section_feedback(payload.get("section_feedback"))

    return (
        not summary
        or (len(priority_gap_feedback) == 0 and len(section_feedback) == 0)
        or len(bullet_rewrites) < 2
    )


def _sanitize_llm_response(
    parsed: dict[str, Any],
    *,
    heuristic_result: AnalysisResult,
    target_role: str | None,
) -> dict[str, Any]:
    """Repair incomplete model output and top it up with heuristic fallbacks."""
    raw_bullets = parsed.get("bullet_rewrites")
    cleaned_bullets = _clean_bullet_rewrites(raw_bullets)
    if isinstance(raw_bullets, list) and len(cleaned_bullets) < len(raw_bullets):
        logger.warning(
            "Dropped %d incomplete bullet_rewrite(s) from LLM response",
            len(raw_bullets) - len(cleaned_bullets),
        )
    if len(cleaned_bullets) < _MIN_BULLET_REWRITES:
        logger.warning(
            "Only %d complete bullet_rewrite(s) after filtering; below target of %d",
            len(cleaned_bullets),
            _MIN_BULLET_REWRITES,
        )
    parsed["bullet_rewrites"] = cleaned_bullets

    parsed["keyword_context_tips"] = _clean_keyword_context_tips(
        parsed.get("keyword_context_tips")
    )

    parsed["priority_gap_feedback"] = _merge_unique_strings(
        _clean_string_list(parsed.get("priority_gap_feedback")),
        _build_heuristic_priority_gap_feedback(
            heuristic_result=heuristic_result,
            target_role=target_role,
        ),
        max_items=_MAX_PRIORITY_GAPS,
    )

    parsed["section_feedback"] = _merge_section_feedback(
        _clean_section_feedback(parsed.get("section_feedback")),
        _build_heuristic_section_feedback(
            heuristic_result=heuristic_result,
            target_role=target_role,
        ),
        max_items=_MAX_SECTION_FEEDBACK,
    )

    role_fit_summary = str(parsed.get("role_fit_summary") or "").strip()
    if not role_fit_summary or role_fit_summary.lower() in {"n/a", "none", "null"}:
        logger.warning("LLM response missing role_fit_summary; using heuristic fallback")
        role_fit_summary = _build_heuristic_role_fit_summary(
            heuristic_result=heuristic_result,
            target_role=target_role,
        )
    parsed["role_fit_summary"] = role_fit_summary

    return parsed
    raw_bullets = parsed.get("bullet_rewrites")
    if isinstance(raw_bullets, list):
        complete = [
            b for b in raw_bullets
            if isinstance(b, dict)
            and b.get("original")
            and b.get("rewritten")
            and b.get("rationale")
        ]
        if len(complete) < len(raw_bullets):
            logger.warning(
                "Dropped %d incomplete bullet_rewrite(s) from LLM response",
                len(raw_bullets) - len(complete),
            )
        parsed["bullet_rewrites"] = complete
        if len(complete) < 4:
            logger.warning(
                "Only %d complete bullet_rewrite(s) after filtering — below minimum of 4",
                len(complete),
            )

    # Ensure keyword_context_tips is always a list
    if not isinstance(parsed.get("keyword_context_tips"), list):
        parsed["keyword_context_tips"] = []

    # Provide a fallback for the required role_fit_summary when truncated
    if not parsed.get("role_fit_summary"):
        logger.warning("LLM response missing role_fit_summary — using fallback")
        parsed["role_fit_summary"] = (
            "The AI summary was unavailable for this analysis. "
            "Please re-run the audit to generate a complete result."
        )

    return parsed


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
  "priority_gap_feedback": [
    "..."
  ],
  "section_feedback": [
    {
      "section_name": "...",
      "focus": "...",
      "suggested_update": "..."
    }
  ],
  "bullet_rewrites": [
    {"original": "...", "rewritten": "...", "rationale": "..."}
  ],
  "keyword_context_tips": [
    {"keyword": "...", "suggested_section": "...", "example_usage": "..."}
  ],
  "role_fit_summary": "A 2-3 sentence qualitative analysis of candidate fit."
}

Rules:
- Provide 3-5 priority_gap_feedback items focused on the biggest resume-to-role gaps.
- Provide 2-4 section_feedback items for the sections that most affect role fit.
- Provide EXACTLY 4-6 bullet rewrites focusing on the weakest examples. You MUST provide at least 4.
- For each missing keyword, show WHERE and HOW to insert it naturally.
- The role_fit_summary should be honest, constructive, and specific to the target role.
- Do NOT invent experience the candidate does not have.
- Do NOT include any personally identifiable information in your response.
- Every key in the schema must be present, even when a list is empty.
- Return ONLY the raw JSON object. Do NOT wrap it in markdown code fences or add any text outside the JSON.
"""


def _build_prompt(
    anonymized_text: str,
    job_description: str,
    missing_keywords: list[str],
    keyword_score: int,
    formatting_flags: dict[str, Any] | None,
    target_role: str | None,
) -> list[dict[str, str]]:
    """Construct the chat messages for the LLM call."""

    # Summarize heuristic gaps
    gap_lines: list[str] = []
    if target_role:
        gap_lines.append(f"Target role: {target_role}")
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


def _coerce_message_content(content: Any) -> str:
    """Normalize provider-specific content shapes into plain text."""
    if isinstance(content, str):
        return content

    if isinstance(content, list):
        parts: list[str] = []
        for item in content:
            if isinstance(item, str):
                parts.append(item)
                continue
            if not isinstance(item, dict):
                continue
            text = item.get("text") or item.get("content")
            if isinstance(text, str) and text.strip():
                parts.append(text.strip())
        return "\n".join(parts).strip()

    return ""


def _build_retry_messages(
    base_messages: list[dict[str, str]],
    *,
    prior_content: str | None,
    retry_reason: str,
) -> list[dict[str, str]]:
    """Ask the model for a corrected second attempt."""
    messages = list(base_messages)
    if prior_content:
        messages.append({"role": "assistant", "content": prior_content})
    messages.append(
        {
            "role": "user",
            "content": (
                "The previous response was incomplete. "
                f"{retry_reason} "
                "Return ONLY valid JSON with every schema key present, including "
                "3-5 priority_gap_feedback items, 2-4 section_feedback items, "
                "4-6 bullet_rewrites, keyword_context_tips, and a non-empty "
                "role_fit_summary."
            ),
        }
    )
    return messages


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
    job_title: str | None = None,
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
            target_role=job_title,
        )

        parsed: dict[str, Any] | None = None
        retry_messages = messages

        # 3. Call LLM via litellm, retrying once if the first response is thin.
        for attempt in range(2):
            logger.info(
                "Calling LLM (%s) for AI enhancement (attempt %d)",
                settings.LLM_PROVIDER,
                attempt + 1,
            )
            response = litellm.completion(
                model=settings.LLM_PROVIDER,
                api_key=settings.LITELLM_API_KEY,
                messages=retry_messages,
                temperature=settings.LITELLM_TEMPERATURE,
                max_tokens=settings.LITELLM_MAX_TOKENS,
                timeout=30,
            )

            content = _coerce_message_content(response.choices[0].message.content)
            if not content:
                logger.warning("LLM returned empty content on attempt %d", attempt + 1)
                if attempt == 0:
                    retry_messages = _build_retry_messages(
                        messages,
                        prior_content=None,
                        retry_reason="The previous response was empty.",
                    )
                    continue
                return None

            try:
                candidate = _extract_json(content)
            except json.JSONDecodeError as exc:
                logger.warning(
                    "LLM returned invalid JSON on attempt %d: %s",
                    attempt + 1,
                    exc,
                )
                if attempt == 0:
                    retry_messages = _build_retry_messages(
                        messages,
                        prior_content=content,
                        retry_reason="The previous response was not valid JSON.",
                    )
                    continue
                raise

            if attempt == 0 and _response_needs_retry(candidate):
                logger.warning(
                    "LLM response was incomplete on first attempt; requesting a retry"
                )
                retry_messages = _build_retry_messages(
                    messages,
                    prior_content=content,
                    retry_reason=(
                        "The previous response omitted required fields or returned too few items."
                    ),
                )
                continue

            parsed = candidate
            break

        if parsed is None:
            return None

        # 4b. Sanitise: drop structurally-incomplete items, then top up with heuristics.
        parsed = _sanitize_llm_response(
            parsed,
            heuristic_result=heuristic_result,
            target_role=job_title,
        )

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

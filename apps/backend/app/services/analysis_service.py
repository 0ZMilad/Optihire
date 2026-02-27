"""
Analysis service: heuristic ATS scoring of a resume against a job description.
"""

import hashlib
import re
from decimal import Decimal
from uuid import UUID

from fastapi import HTTPException, status
from sqlmodel import Session, select

from app.models.analysis_model import AnalysisResult, JobDescription
from app.models.resume_model import Resume
from app.schemas.analysis_schema import AnalysisResultRead

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

ANALYSIS_VERSION = "1.0"

# Common English stopwords excluded from keyword extraction
_STOPWORDS = frozenset({
    "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for",
    "of", "with", "by", "from", "up", "about", "as", "is", "was", "are",
    "were", "be", "been", "being", "have", "has", "had", "do", "does", "did",
    "will", "would", "could", "should", "may", "might", "shall", "must",
    "can", "that", "this", "these", "those", "we", "you", "they", "their",
    "our", "its", "it", "not", "no", "so", "if", "then", "than", "when",
    "where", "which", "who", "whom", "what", "how", "all", "any", "both",
    "each", "few", "more", "most", "other", "some", "such", "into", "through",
    "during", "before", "after", "above", "below", "between", "out", "off",
    "over", "under", "again", "further", "once", "here", "there", "while",
    "am", "per", "via", "i", "me", "he", "she", "him", "her", "us", "them",
})

# Strong action verbs indicative of effective resume language
_ACTION_VERB_PATTERN = re.compile(
    r"^\s*(?:achieved|administered|analysed|analyzed|built|collaborated|"
    r"coordinated|created|delivered|designed|developed|directed|drove|enabled|"
    r"engineered|established|executed|facilitated|generated|implemented|improved|"
    r"increased|initiated|launched|led|managed|mentored|optimised|optimized|"
    r"orchestrated|oversaw|partnered|planned|produced|reduced|resolved|scaled|"
    r"spearheaded|streamlined|supervised|supported|trained|transformed|utilized|"
    r"validated|wrote)\b",
    re.IGNORECASE | re.MULTILINE,
)

# Section header regexes (line-level, case-insensitive)
_SEC_CONTACT = re.compile(
    r"[\w.+-]+@[\w-]+\.[a-zA-Z]{2,}|(\+\d[\d\s\-(). ]{7,})",
    re.IGNORECASE,
)
_SEC_SUMMARY = re.compile(
    r"^\s*(?:summary|objective|profile|about\s+me|professional\s+summary|career\s+summary)\s*$",
    re.IGNORECASE | re.MULTILINE,
)
_SEC_EXPERIENCE = re.compile(
    r"^\s*(?:experience|work\s+experience|employment|employment\s+history|"
    r"work\s+history|professional\s+experience|career)\s*$",
    re.IGNORECASE | re.MULTILINE,
)
_SEC_EDUCATION = re.compile(
    r"^\s*(?:education|academic|degree|qualifications?|university|college)\s*$",
    re.IGNORECASE | re.MULTILINE,
)
_SEC_SKILLS = re.compile(
    r"^\s*(?:skills|technical\s+skills|competencies|technologies|expertise|core\s+competencies)\s*$",
    re.IGNORECASE | re.MULTILINE,
)

# Bullet character detection
_BULLET_PATTERN = re.compile(r"^[\s]*[•\-\*▸◦▪➤➔→✓✔]\s+", re.MULTILINE)


# ---------------------------------------------------------------------------
# Private helpers
# ---------------------------------------------------------------------------

def _sha256(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def _tokenize(text: str) -> list[str]:
    """Return lowercase alphabetic tokens ≥3 chars that are not stopwords."""
    words = re.findall(r"[a-zA-Z]+", text.lower())
    return [w for w in words if len(w) >= 3 and w not in _STOPWORDS]


def _bigrams(tokens: list[str]) -> list[str]:
    return [f"{tokens[i]} {tokens[i + 1]}" for i in range(len(tokens) - 1)]


def _score_keywords(
    resume_text: str, jd_text: str
) -> tuple[int, list[str], list[str], Decimal | None]:
    """
    Compute keyword overlap between job description and resume.

    Returns:
        keyword_score (0-100), matched_keywords, missing_keywords, keyword_density
    """
    jd_tokens = _tokenize(jd_text)
    jd_bigrams = _bigrams(jd_tokens)
    # Unique JD terms (unigrams + bigrams), insertion-ordered
    jd_terms: list[str] = list(dict.fromkeys(jd_tokens + jd_bigrams))

    resume_lower = resume_text.lower()
    resume_word_set = set(_tokenize(resume_text))

    matched: list[str] = []
    missing: list[str] = []

    for term in jd_terms:
        if " " in term:
            hit = term in resume_lower  # phrase search
        else:
            hit = term in resume_word_set
        (matched if hit else missing).append(term)

    total = len(jd_terms)
    score = min(round((len(matched) / total) * 100), 100) if total else 0

    resume_token_count = len(_tokenize(resume_text))
    density: Decimal | None = (
        Decimal(str(round(len(matched) / resume_token_count, 3)))
        if resume_token_count
        else None
    )

    return score, matched, missing, density


def _score_sections(resume_text: str) -> tuple[int, dict[str, bool]]:
    """Detect presence of the five key resume sections."""
    flags = {
        "has_contact_info": bool(_SEC_CONTACT.search(resume_text)),
        "has_summary": bool(_SEC_SUMMARY.search(resume_text)),
        "has_experience": bool(_SEC_EXPERIENCE.search(resume_text)),
        "has_education": bool(_SEC_EDUCATION.search(resume_text)),
        "has_skills": bool(_SEC_SKILLS.search(resume_text)),
    }
    score = round((sum(flags.values()) / len(flags)) * 100)
    return score, flags


def _score_formatting(resume_text: str) -> tuple[int, dict[str, bool]]:
    """Detect formatting quality: bullets, action verbs, line-length consistency."""
    has_bullets = len(_BULLET_PATTERN.findall(resume_text)) >= 3
    has_action_verbs = len(_ACTION_VERB_PATTERN.findall(resume_text)) >= 2

    non_empty_lines = [l for l in resume_text.splitlines() if l.strip()]
    long_lines = sum(1 for l in non_empty_lines if len(l) > 100)
    has_consistent = (
        (long_lines / len(non_empty_lines)) < 0.3 if non_empty_lines else False
    )
    is_scannable = has_bullets and has_consistent

    # Weighted: bullets 40 pts, action verbs 30 pts, consistent formatting 30 pts
    score = (40 if has_bullets else 0) + (30 if has_action_verbs else 0) + (30 if has_consistent else 0)

    return score, {
        "has_consistent_formatting": has_consistent,
        "has_bullet_points": has_bullets,
        "has_action_verbs": has_action_verbs,
        "is_scannable": is_scannable,
    }


def _build_suggestions(
    keyword_score: int,
    section_score: int,
    formatting_score: int,
    flags: dict[str, bool],
    missing_keywords: list[str],
) -> dict[str, list[str]]:
    """Build actionable improvement suggestions grouped by category."""
    suggestions: dict[str, list[str]] = {}

    kw_tips: list[str] = []
    if keyword_score < 40:
        kw_tips.append(
            "Your resume matches fewer than 40% of the job description keywords. "
            "Tailor your language to closely mirror the job posting."
        )
    if missing_keywords:
        preview = ", ".join(missing_keywords[:10])
        kw_tips.append(f"Consider incorporating these missing keywords: {preview}.")
    if kw_tips:
        suggestions["keywords"] = kw_tips

    sec_tips: list[str] = []
    if not flags.get("has_contact_info"):
        sec_tips.append("Add a contact section with your email and phone number.")
    if not flags.get("has_summary"):
        sec_tips.append("Add a professional summary or objective at the top of your resume.")
    if not flags.get("has_experience"):
        sec_tips.append("Include a clearly labelled Work Experience section.")
    if not flags.get("has_education"):
        sec_tips.append("Add an Education section listing your qualifications.")
    if not flags.get("has_skills"):
        sec_tips.append("Add a Skills section listing your key technical abilities.")
    if sec_tips:
        suggestions["sections"] = sec_tips

    fmt_tips: list[str] = []
    if not flags.get("has_bullet_points"):
        fmt_tips.append(
            "Use bullet points (•) to list responsibilities and achievements "
            "instead of dense paragraph text."
        )
    if not flags.get("has_action_verbs"):
        fmt_tips.append(
            "Start bullet points with strong action verbs "
            "(e.g., 'Achieved', 'Developed', 'Led', 'Optimized')."
        )
    if not flags.get("has_consistent_formatting"):
        fmt_tips.append(
            "Shorten lines to fewer than 100 characters for better ATS scannability."
        )
    if fmt_tips:
        suggestions["formatting"] = fmt_tips

    return suggestions


def _extract_jd_keywords(jd_text: str) -> list[str]:
    """Return the top 30 unique unigrams from the JD sorted by frequency."""
    freq: dict[str, int] = {}
    for token in _tokenize(jd_text):
        freq[token] = freq.get(token, 0) + 1
    return [k for k, _ in sorted(freq.items(), key=lambda x: -x[1])][:30]


# ---------------------------------------------------------------------------
# Public service functions
# ---------------------------------------------------------------------------

def run_audit(
    *,
    user_id: UUID,
    resume_id: UUID,
    job_description_text: str,
    job_title: str | None,
    db: Session,
) -> AnalysisResultRead:
    """
    Run a heuristic ATS analysis of the given resume against the job description.

    Flow:
        1. Fetch resume, verify ownership, assert raw_text is available.
        2. Hash inputs for cache & dedup.
        3. Return cached AnalysisResult if the same combination was already analysed.
        4. Upsert JobDescription row (keyed on jd_hash).
        5. Run heuristic scoring (keywords → sections → formatting → overall).
        6. Persist new AnalysisResult and return.
    """
    # 1. Fetch resume -----------------------------------------------------------
    resume = db.get(Resume, resume_id)
    if resume is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found.",
        )
    if resume.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied.",
        )
    if not resume.raw_text:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                "Resume has not been parsed yet. "
                "Please wait until parsing is complete before running an audit."
            ),
        )

    raw_text: str = resume.raw_text

    # 2. Hash inputs ------------------------------------------------------------
    resume_hash = _sha256(raw_text)
    jd_hash = _sha256(job_description_text.strip())

    # 3. Cache check ------------------------------------------------------------
    cached = db.exec(
        select(AnalysisResult).where(
            AnalysisResult.resume_id == resume_id,
            AnalysisResult.resume_content_hash == resume_hash,
            AnalysisResult.job_description_hash == jd_hash,
            AnalysisResult.analysis_version == ANALYSIS_VERSION,
        )
    ).first()

    if cached is not None:
        return AnalysisResultRead.model_validate(cached)

    # 4. Upsert JobDescription --------------------------------------------------
    existing_jd = db.exec(
        select(JobDescription).where(JobDescription.jd_hash == jd_hash)
    ).first()

    if existing_jd is not None:
        jd_row = existing_jd
    else:
        snippet = (job_description_text[:300] if len(job_description_text) > 300 else None)
        jd_row = JobDescription(
            user_id=user_id,
            job_title=job_title or "Untitled Position",
            description=job_description_text,
            snippet=snippet,
            extracted_keywords=_extract_jd_keywords(job_description_text),
            jd_hash=jd_hash,
        )
        db.add(jd_row)
        db.flush()  # assigns id without committing the transaction

    # 5. Score ------------------------------------------------------------------
    keyword_score, matched_kw, missing_kw, density = _score_keywords(raw_text, job_description_text)
    section_score, section_flags = _score_sections(raw_text)
    formatting_score, formatting_flags = _score_formatting(raw_text)

    overall_score = round(
        keyword_score * 0.40
        + section_score * 0.35
        + formatting_score * 0.25
    )

    all_flags: dict[str, bool] = {**section_flags, **formatting_flags}

    suggestions = _build_suggestions(
        keyword_score,
        section_score,
        formatting_score,
        all_flags,
        missing_kw,
    )

    # 6. Persist ----------------------------------------------------------------
    result = AnalysisResult(
        resume_id=resume_id,
        job_description_id=jd_row.id,
        resume_content_hash=resume_hash,
        job_description_hash=jd_hash,
        overall_score=overall_score,
        keyword_score=keyword_score,
        formatting_score=formatting_score,
        section_score=section_score,
        matched_keywords=matched_kw,
        missing_keywords=missing_kw,
        keyword_density=density,
        suggestions_payload=suggestions if suggestions else None,
        analysis_version=ANALYSIS_VERSION,
        **all_flags,
    )
    db.add(result)
    db.commit()
    db.refresh(result)

    return AnalysisResultRead.model_validate(result)


def get_audit_result(
    *,
    result_id: UUID,
    user_id: UUID,
    db: Session,
) -> AnalysisResultRead:
    """
    Retrieve a previously computed analysis result by ID.
    Verifies ownership via the associated resume's user_id.
    """
    result = db.get(AnalysisResult, result_id)
    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis result not found.",
        )

    resume = db.get(Resume, result.resume_id)
    if resume is None or resume.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied.",
        )

    return AnalysisResultRead.model_validate(result)

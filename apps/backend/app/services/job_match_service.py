"""
Service for computing curated job matches against a user's resume.

Matching pipeline
=================
1. **Multi-source skill collection** — pulls from ``ResumeSkill`` rows,
   ``ResumeExperience.skills_used``, ``ResumeProject.technologies_used``,
   and a quick scan of ``Resume.raw_text`` against the analysis-service's
   tech taxonomy.  This prevents false negatives when a skill was *used*
   in a role but not listed in the formal skills section.

2. **Synonym-aware normalisation** — every token (both resume-side and
   job-keyword-side) is mapped to its canonical form via the existing
   ``_SYNONYMS`` dictionary from the analysis service so that "React.js",
   "ReactJS", and "React" all resolve to a single identity.

3. **Experience-level scoring** — the user's total years of experience
   (computed from ``ResumeExperience`` date ranges) is compared against the
   job's ``experience_level`` to produce a 0-100 experience-match score.

4. **Composite score** — ``match_score = 80 % × skill_match + 20 % ×
   experience_match``, giving the skill signal primacy while still
   surfacing experience-level mismatches.
"""

from __future__ import annotations

import re
from datetime import date
from uuid import UUID

from fastapi import HTTPException, status
from sqlmodel import Session, select

from app.data.curated_jobs import CURATED_JOBS
from app.models.analysis_model import AnalysisResult
from app.models.job_model import UserJobApplication
from app.models.resume_model import (
    Resume,
    ResumeExperience,
    ResumeProject,
    ResumeSkill,
)
from app.schemas.job_schema import CuratedJobListing, JobMatchResponse
from app.services.analysis_service import (
    _SYNONYMS,
    _SYNONYM_REVERSE,
    _TECH_TOOLS,
    _FINANCE_TOOLS,
    _HEALTHCARE_TOOLS,
    _MARKETING_TOOLS,
    _CERTIFICATIONS,
)

# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

# Merge all known tool taxonomies into one lookup set.
_ALL_KNOWN_SKILLS: frozenset[str] = (
    _TECH_TOOLS | _FINANCE_TOOLS | _HEALTHCARE_TOOLS | _MARKETING_TOOLS | _CERTIFICATIONS
)

# Pre-compiled word-boundary splitter for raw-text scanning.
_TOKEN_RE = re.compile(r"[A-Za-z0-9#+./-]+")


def _canonicalise(term: str) -> str:
    """Return the canonical (lowered) form via the synonym table, or the
    lowered term itself if no mapping exists."""
    t = term.strip().lower()
    return _SYNONYM_REVERSE.get(t, t)


def _collect_resume_skills(
    resume: Resume,
    skill_rows: list[ResumeSkill],
    experience_rows: list[ResumeExperience],
    project_rows: list[ResumeProject],
) -> set[str]:
    """Build a de-duplicated set of *canonical* skill tokens from every
    available source on the resume."""
    canonical: set[str] = set()

    # 1. Formal skill rows (most reliable signal).
    for row in skill_rows:
        canonical.add(_canonicalise(row.skill_name))

    # 2. skills_used[] arrays from work-experience entries.
    for exp in experience_rows:
        for skill in (exp.skills_used or []):
            canonical.add(_canonicalise(skill))

    # 3. technologies_used[] arrays from project entries.
    for proj in project_rows:
        for tech in (proj.technologies_used or []):
            canonical.add(_canonicalise(tech))

    # 4. Light scan of raw_text for known taxonomy terms that weren't
    #    captured by the structured parsers.  Only adds tokens that
    #    already exist in the master taxonomy so we don't flood the set
    #    with noise.
    if resume.raw_text:
        text_lower = resume.raw_text.lower()
        # Tokenise once so single-word lookups are O(1) instead of O(len(text)).
        text_tokens = frozenset(_TOKEN_RE.findall(text_lower))
        for term in _ALL_KNOWN_SKILLS:
            if len(term) <= 1:
                continue
            if " " in term:
                # Multi-word term: substring search is unavoidable.
                if term in text_lower:
                    canonical.add(_canonicalise(term))
            else:
                # Single-word: O(1) set membership.
                if term in text_tokens:
                    canonical.add(_canonicalise(term))

    return canonical


# Experience-level → approximate target-years midpoint.
_LEVEL_YEARS: dict[str | None, float] = {
    "graduate": 0.5,
    "entry": 1.0,
    "junior": 2.0,
    "mid": 4.0,
    "senior": 7.0,
    "lead": 10.0,
}


def _compute_years_of_experience(experiences: list[ResumeExperience]) -> float:
    """Sum distinct months across all experience entries, handling overlaps
    naively (good enough for a heuristic).  Returns total years."""
    if not experiences:
        return 0.0
    today = date.today()
    total_months = 0.0
    for exp in experiences:
        start = exp.start_date
        end = exp.end_date or (today if exp.is_current else today)
        if end < start:
            continue
        months = (end.year - start.year) * 12 + (end.month - start.month)
        total_months += max(months, 0)
    return round(total_months / 12, 1)


def _experience_match_score(
    actual_years: float,
    target_level: str | None,
) -> int:
    """Return 0-100 indicating how well the candidate's experience aligns
    with the job level.  Full marks at/above target, linear penalty below,
    mild over-qualification penalty."""
    target = _LEVEL_YEARS.get(target_level)
    if target is None:
        return 75  # Unknown level — neutral default.
    if actual_years >= target:
        # Slight penalty for large over-qualification (max -15).
        over = actual_years - target
        penalty = min(over * 3, 15)
        return max(round(100 - penalty), 60)
    # Under-qualified: linear falloff.
    ratio = actual_years / target if target else 1.0
    return max(round(ratio * 100), 0)


def _match_keywords(
    job_keywords: list[str],
    resume_canonical: set[str],
) -> tuple[list[str], list[str], int]:
    """Match a job's extracted_keywords against the canonical resume skill
    set.  Returns ``(matched_display, missing_display, score_0_100)``
    where the display lists use the *original* keyword casing."""
    matched: list[str] = []
    missing: list[str] = []
    for kw in job_keywords:
        if _canonicalise(kw) in resume_canonical:
            matched.append(kw)
        else:
            missing.append(kw)
    total = len(job_keywords)
    score = round(len(matched) / total * 100) if total else 0
    return matched, missing, score


# ---------------------------------------------------------------------------
# Pre-canonicalised job data — built once at import time so every API request
# avoids repeating synonym lookups across all curated job keywords.
# ---------------------------------------------------------------------------

_ACTIVE_JOBS: list[tuple[dict, list[str]]] = [
    (job, [_canonicalise(kw) for kw in job.get("extracted_keywords", [])])
    for job in CURATED_JOBS
    if job.get("is_active", True)
]

# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def get_job_matches(
    resume_id: UUID,
    user_id: UUID,
    db: Session,
) -> list[JobMatchResponse]:
    """
    Return curated job matches enriched with skill- and experience-level
    scoring for the given resume.

    Raises:
        404 – resume does not exist / belongs to a different user
        404 – no AnalysisResult exists yet (resume not analyzed)
    """
    # A: Verify ownership.
    resume = db.exec(
        select(Resume).where(
            Resume.id == resume_id,
            Resume.user_id == user_id,
            Resume.deleted_at.is_(None),
        )
    ).first()
    if resume is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found or access denied",
        )

    # B: Guard — at least one analysis must exist.
    analysis = db.exec(
        select(AnalysisResult)
        .where(AnalysisResult.resume_id == resume_id)
        .limit(1)
    ).first()
    if analysis is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume has not been analyzed yet. Run an analysis first.",
        )

    # C: Collect structured data from all related tables.
    skill_rows = db.exec(
        select(ResumeSkill).where(ResumeSkill.resume_id == resume_id)
    ).all()
    experience_rows = db.exec(
        select(ResumeExperience).where(ResumeExperience.resume_id == resume_id)
    ).all()
    project_rows = db.exec(
        select(ResumeProject).where(ResumeProject.resume_id == resume_id)
    ).all()

    # D: Build canonical skill set from every source.
    resume_skills = _collect_resume_skills(resume, skill_rows, experience_rows, project_rows)

    # E: Compute candidate's total years of experience.
    actual_years = _compute_years_of_experience(experience_rows)

    # F: Load stored application state for all curated jobs in one query
    #    to avoid N+1 selects inside the scoring loop.
    app_records = db.exec(
        select(UserJobApplication).where(
            UserJobApplication.user_id == user_id,
            UserJobApplication.resume_id == resume_id,
        )
    ).all()
    app_by_job: dict[str, UserJobApplication] = {r.job_listing_id: r for r in app_records}

    # G: Score each active curated job using pre-canonicalised keyword data
    #    to avoid re-running synonym lookups on every request.
    results: list[JobMatchResponse] = []
    for job, canon_keywords in _ACTIVE_JOBS:
        app_record = app_by_job.get(job["id"])

        display_keywords: list[str] = job.get("extracted_keywords", [])
        matched = [d for d, c in zip(display_keywords, canon_keywords) if c in resume_skills]
        missing = [d for d, c in zip(display_keywords, canon_keywords) if c not in resume_skills]
        skill_score = round(len(matched) / len(display_keywords) * 100) if display_keywords else 0

        exp_score = _experience_match_score(actual_years, job.get("experience_level"))

        # Composite: skill match is the dominant signal.
        composite = round(skill_score * 0.80 + exp_score * 0.20)

        results.append(
            JobMatchResponse(
                id=f"{resume_id}::{job['id']}",
                resume_id=resume_id,
                job_listing_id=job["id"],
                match_score=composite,
                skill_match_score=skill_score,
                experience_match_score=exp_score,
                matched_skills=matched,
                missing_skills=missing,
                application_status=app_record.application_status if app_record else "not_applied",
                job_listing=CuratedJobListing(**job),
            )
        )

    results.sort(key=lambda r: r.match_score, reverse=True)
    return results

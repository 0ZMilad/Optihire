"""
Service for computing curated job matches against a user's resume.

The matching algorithm:
  1. Load the parsed ResumeSkill rows for the resume (normalized skill names).
  2. For each active curated job, compare its extracted_keywords against the
     skill set using case-insensitive string equality.
  3. Compute match_score = round(matched / total_keywords * 100).
  4. Return all jobs sorted by match_score descending so the best fits appear
     first — the frontend handles further filtering and pagination.
"""

from uuid import UUID

from fastapi import HTTPException, status
from sqlmodel import Session, select

from app.data.curated_jobs import CURATED_JOBS
from app.models.analysis_model import AnalysisResult
from app.models.resume_model import Resume, ResumeSkill
from app.schemas.job_schema import CuratedJobListing, JobMatchResponse


def get_job_matches(
    resume_id: UUID,
    user_id: UUID,
    db: Session,
) -> list[JobMatchResponse]:
    """
    Return a list of curated job matches hydrated with per-job match data.

    Raises:
        404 – if the resume does not exist (or belongs to a different user)
        404 – if no AnalysisResult exists for the resume (not yet analyzed)
    """
    # A: Verify the resume exists and belongs to the requesting user.
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

    # B: Require at least one completed analysis so there is meaningful skill
    #    data to match against (prevents misleading 0% results on fresh uploads).
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

    # C: Build a normalized skill set from the parsed ResumeSkill rows.
    skill_rows = db.exec(
        select(ResumeSkill).where(ResumeSkill.resume_id == resume_id)
    ).all()
    resume_skill_set: set[str] = {row.skill_name.strip().lower() for row in skill_rows}

    # D–F: Score each active curated job and construct response objects.
    results: list[JobMatchResponse] = []

    for job in CURATED_JOBS:
        if not job.get("is_active", True):
            continue

        keywords: list[str] = job.get("extracted_keywords", [])
        matched = [kw for kw in keywords if kw.strip().lower() in resume_skill_set]
        missing = [kw for kw in keywords if kw.strip().lower() not in resume_skill_set]
        match_score = round(len(matched) / len(keywords) * 100) if keywords else 0

        results.append(
            JobMatchResponse(
                id=f"{resume_id}::{job['id']}",
                resume_id=resume_id,
                job_listing_id=job["id"],
                match_score=match_score,
                matched_skills=matched,
                missing_skills=missing,
                job_listing=CuratedJobListing(**job),
            )
        )

    results.sort(key=lambda r: r.match_score, reverse=True)
    return results

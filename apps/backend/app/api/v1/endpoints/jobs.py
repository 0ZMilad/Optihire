"""
Jobs router — manages user interaction state with curated job listings.

Routes:
  PATCH /api/v1/jobs/matches/{match_id}/status  — update application status
"""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.core.dependencies import get_current_user_id
from app.db.session import get_db
from app.models.job_model import UserJobApplication
from app.models.resume_model import Resume
from app.schemas.job_schema import JobStatusUpdate

router = APIRouter()


def _parse_match_id(match_id: str) -> tuple[UUID, str]:
    """Split ``{resume_id}::{job_listing_id}`` into its components."""
    try:
        resume_id_str, job_listing_id = match_id.split("::", 1)
        return UUID(resume_id_str), job_listing_id
    except (ValueError, AttributeError):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid match_id format. Expected '{resume_id}::{job_listing_id}'.",
        )


def _assert_resume_owned(db: Session, resume_id: UUID, user_id: UUID) -> None:
    """Raise 404 if the resume does not exist or belongs to another user."""
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
            detail="Resume not found.",
        )


def _get_or_create_application(
    db: Session,
    user_id: UUID,
    resume_id: UUID,
    job_listing_id: str,
) -> UserJobApplication:
    """Return the existing record or initialise a new default one (not yet committed)."""
    record = db.exec(
        select(UserJobApplication).where(
            UserJobApplication.user_id == user_id,
            UserJobApplication.resume_id == resume_id,
            UserJobApplication.job_listing_id == job_listing_id,
        )
    ).first()
    if record is None:
        record = UserJobApplication(
            user_id=user_id,
            resume_id=resume_id,
            job_listing_id=job_listing_id,
        )
        db.add(record)
        db.flush()  # populate .id without committing
    return record


@router.patch(
    "/matches/{match_id}/status",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Update application status for a curated job match",
)
def update_match_status(
    match_id: str,
    payload: JobStatusUpdate,
    user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
) -> None:
    resume_id, job_listing_id = _parse_match_id(match_id)
    _assert_resume_owned(db, resume_id, user_id)
    record = _get_or_create_application(db, user_id, resume_id, job_listing_id)
    record.application_status = payload.status
    db.add(record)
    db.commit()




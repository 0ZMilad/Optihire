from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy import delete as sa_delete, or_
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, select

from app.models.analysis_model import (
    AnalysisResult,
    JobDescription,
    SkillCorrection,
    Suggestion,
    SuggestionInteraction,
)
from app.models.file_model import ParseTask, UploadedFile
from app.models.job_model import UserJobApplication
from app.models.resume_model import (
    Resume,
    ResumeCertification,
    ResumeCustomSection,
    ResumeEducation,
    ResumeExperience,
    ResumeProject,
    ResumeSkill,
)
from app.models.user_model import User, UserOnboardingProgress
from app.schemas.user_schema import UserCreate, UserUpdate


def create_user(db: Session, user_data: UserCreate) -> User:
    """
    Create a new user in the database.
    
    Raises IntegrityError if user with email/supabase_id already exists.
    This is handled by the global exception handler in main.py.
    """
    user = User.model_validate(user_data)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def get_user_by_id(db: Session, user_id: UUID) -> User | None:
    """Get a user by their ID."""
    statement = select(User).where(User.id == user_id, User.deleted_at.is_(None))
    user = db.exec(statement).first()
    return user


def get_user_by_supabase_id(db: Session, supabase_user_id: UUID) -> User | None:
    """Get a user by their Supabase user ID."""
    statement = select(User).where(
        User.supabase_user_id == supabase_user_id, User.deleted_at.is_(None)
    )
    user = db.exec(statement).first()
    return user


def update_user(db: Session, user_id: UUID, user_data: UserUpdate) -> User | None:
    """
    Update a user's information.
    
    Raises IntegrityError if update violates unique constraints.
    This is handled by the global exception handler in main.py.
    """
    user = get_user_by_id(db, user_id)
    if not user:
        return None

    # Update only provided fields
    update_data = user_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(user, key, value)

    user.updated_at = datetime.now(timezone.utc)

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


def delete_user(db: Session, user_id: UUID) -> bool:
    """Soft delete a user (sets deleted_at timestamp)."""
    user = get_user_by_id(db, user_id)
    if not user:
        return False

    user.deleted_at = datetime.now(timezone.utc)
    user.is_active = False

    db.add(user)
    db.commit()
    return True


def purge_user_account(db: Session, user_id: UUID) -> list[str]:
    """
    Hard-delete every row owned by the user and return storage paths that
    must be removed from Supabase Storage.

    Deletion order respects FK dependency (child tables before parents):
      SuggestionInteractions → Suggestions → AnalysisResults
      → Resume sections → Resumes
      → JobDescriptions
      → SkillCorrections, UserJobApplications, ParseTasks, UploadedFiles
      → UserOnboardingProgress
      → User
    """
    # ── 1. Collect storage paths before any rows are removed ─────────────────
    storage_paths: list[str] = []

    resume_file_paths = db.execute(
        select(Resume.file_path).where(
            Resume.user_id == user_id, Resume.file_path.isnot(None)
        )
    ).scalars().all()
    storage_paths.extend(resume_file_paths)

    uploaded_keys = db.execute(
        select(UploadedFile.object_key).where(UploadedFile.user_id == user_id)
    ).scalars().all()
    storage_paths.extend(uploaded_keys)

    # ── 2. Gather IDs needed for child-table deletes ──────────────────────────
    resume_ids: list[UUID] = db.execute(
        select(Resume.id).where(Resume.user_id == user_id)
    ).scalars().all()

    jd_ids: list[UUID] = db.execute(
        select(JobDescription.id).where(JobDescription.user_id == user_id)
    ).scalars().all()

    analysis_ids: list[UUID] = []
    if resume_ids or jd_ids:
        clauses = []
        if resume_ids:
            clauses.append(AnalysisResult.resume_id.in_(resume_ids))
        if jd_ids:
            clauses.append(AnalysisResult.job_description_id.in_(jd_ids))
        analysis_ids = db.execute(
            select(AnalysisResult.id).where(or_(*clauses))
        ).scalars().all()

    suggestion_ids: list[UUID] = []
    if analysis_ids:
        suggestion_ids = db.execute(
            select(Suggestion.id).where(Suggestion.analysis_id.in_(analysis_ids))
        ).scalars().all()

    # ── 3. Delete in dependency order ─────────────────────────────────────────
    # SuggestionInteractions (linked by suggestion and by user_id directly)
    if suggestion_ids:
        db.execute(
            sa_delete(SuggestionInteraction).where(
                SuggestionInteraction.suggestion_id.in_(suggestion_ids)
            )
        )
    db.execute(
        sa_delete(SuggestionInteraction).where(
            SuggestionInteraction.user_id == user_id
        )
    )

    # Suggestions
    if analysis_ids:
        db.execute(
            sa_delete(Suggestion).where(Suggestion.analysis_id.in_(analysis_ids))
        )

    # AnalysisResults
    if resume_ids:
        db.execute(
            sa_delete(AnalysisResult).where(AnalysisResult.resume_id.in_(resume_ids))
        )
    if jd_ids:
        db.execute(
            sa_delete(AnalysisResult).where(
                AnalysisResult.job_description_id.in_(jd_ids)
            )
        )

    # Resume child sections
    if resume_ids:
        for SectionModel in (
            ResumeExperience,
            ResumeEducation,
            ResumeSkill,
            ResumeCertification,
            ResumeProject,
            ResumeCustomSection,
        ):
            db.execute(
                sa_delete(SectionModel).where(SectionModel.resume_id.in_(resume_ids))
            )

    # Resumes
    db.execute(sa_delete(Resume).where(Resume.user_id == user_id))

    # JobDescriptions (after AnalysisResults referencing them are gone)
    db.execute(sa_delete(JobDescription).where(JobDescription.user_id == user_id))

    # Remaining user-owned rows (no further child dependencies)
    db.execute(sa_delete(SkillCorrection).where(SkillCorrection.user_id == user_id))
    db.execute(
        sa_delete(UserJobApplication).where(UserJobApplication.user_id == user_id)
    )
    db.execute(sa_delete(ParseTask).where(ParseTask.user_id == user_id))
    db.execute(sa_delete(UploadedFile).where(UploadedFile.user_id == user_id))
    db.execute(
        sa_delete(UserOnboardingProgress).where(
            UserOnboardingProgress.user_id == user_id
        )
    )

    # Finally remove the user row itself
    db.execute(sa_delete(User).where(User.id == user_id))

    db.commit()

    return [p for p in storage_paths if p]

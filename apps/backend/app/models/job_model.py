"""
Job application tracking model.

Stores per-user application status for curated job listings.
The curated listings themselves live in-memory in ``app/data/curated_jobs.py``.
"""

from datetime import datetime, timezone
from uuid import UUID, uuid4

from sqlalchemy import Index, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlmodel import Column, Field, SQLModel


class UserJobApplication(SQLModel, table=True):
    """Tracks a user's interaction state with a curated job listing."""

    __tablename__ = "user_job_applications"
    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "resume_id",
            "job_listing_id",
            name="uniq_uja_user_resume_job",
        ),
        Index("idx_uja_resume", "resume_id"),
    )

    id: UUID = Field(
        default_factory=uuid4,
        sa_column=Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4),
    )
    user_id: UUID = Field(
        sa_column=Column(PGUUID(as_uuid=True), nullable=False, index=True)
    )
    resume_id: UUID = Field(
        sa_column=Column(PGUUID(as_uuid=True), nullable=False)
    )
    # Matches the string id in curated_jobs.py (e.g. "jl-001").
    job_listing_id: str = Field(max_length=50, nullable=False)
    application_status: str = Field(default="not_applied", max_length=20)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column_kwargs={"server_default": func.now()},
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column_kwargs={"server_default": func.now(), "onupdate": func.now()},
    )

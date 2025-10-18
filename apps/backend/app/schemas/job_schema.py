"""
Schemas for job listings, matching, and feedback.
"""

from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, Field

from app.schemas.common_schema import ExperienceLevel, FeedbackType, JobType, RemoteType

# ===== JOB LISTINGS =====


class JobListingCreate(BaseModel):
    """Create a new job listing."""

    external_id: str | None = Field(None, max_length=255)
    source: str = Field(..., max_length=50)
    job_title: str = Field(..., max_length=200)
    company_name: str = Field(..., max_length=200)
    location: str | None = Field(None, max_length=255)
    remote_type: RemoteType | None = None
    salary_min: int | None = Field(None, ge=0)
    salary_max: int | None = Field(None, ge=0)
    salary_currency: str = Field(default="USD", max_length=3)
    description: str | None = None
    requirements: str | None = None
    benefits: str | None = None
    job_type: JobType | None = None
    experience_level: ExperienceLevel | None = None
    posted_date: date | None = None
    application_deadline: date | None = None
    external_url: str | None = Field(None, max_length=500)


class JobListingUpdate(BaseModel):
    """Update a job listing."""

    job_title: str | None = Field(None, max_length=200)
    company_name: str | None = Field(None, max_length=200)
    location: str | None = Field(None, max_length=255)
    remote_type: RemoteType | None = None
    salary_min: int | None = Field(None, ge=0)
    salary_max: int | None = Field(None, ge=0)
    description: str | None = None
    requirements: str | None = None
    benefits: str | None = None
    is_active: bool | None = None


class JobListingRead(BaseModel):
    """Read job listing data."""

    id: UUID
    external_id: str | None
    source: str
    job_title: str
    company_name: str
    location: str | None
    remote_type: str | None
    salary_min: int | None
    salary_max: int | None
    salary_currency: str
    description: str | None
    requirements: str | None
    benefits: str | None
    job_type: str | None
    experience_level: str | None
    posted_date: date | None
    application_deadline: date | None
    external_url: str | None
    is_active: bool
    extracted_keywords: list[str]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ===== JOB MATCHES =====


class JobMatchCreate(BaseModel):
    """Create a new job match."""

    user_id: UUID
    resume_id: UUID
    job_listing_id: UUID
    match_score: int = Field(..., ge=0, le=100)
    skill_match_score: int | None = Field(None, ge=0, le=100)
    experience_match_score: int | None = Field(None, ge=0, le=100)
    location_match_score: int | None = Field(None, ge=0, le=100)
    matched_skills: list[str] = Field(default_factory=list)
    missing_skills: list[str] = Field(default_factory=list)


class JobMatchUpdate(BaseModel):
    """Update a job match."""

    is_saved: bool | None = None
    is_hidden: bool | None = None


class JobMatchRead(BaseModel):
    """Read job match data."""

    id: UUID
    user_id: UUID
    resume_id: UUID
    job_listing_id: UUID
    match_score: int
    skill_match_score: int | None
    experience_match_score: int | None
    location_match_score: int | None
    matched_skills: list[str]
    missing_skills: list[str]
    is_saved: bool
    is_hidden: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ===== USER JOB FEEDBACK =====


class UserJobFeedbackCreate(BaseModel):
    """Create user feedback on a job."""

    user_id: UUID
    job_listing_id: UUID
    feedback_type: FeedbackType


class UserJobFeedbackRead(BaseModel):
    """Read user job feedback data."""

    id: UUID
    user_id: UUID
    job_listing_id: UUID
    feedback_type: str
    created_at: datetime

    model_config = {"from_attributes": True}

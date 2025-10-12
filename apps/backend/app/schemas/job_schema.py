"""
Schemas for job listings, matching, and feedback.
"""
from uuid import UUID
from datetime import datetime, date
from typing import Optional, List
from pydantic import BaseModel, Field

from app.schemas.common_schema import RemoteType, ExperienceLevel, JobType, FeedbackType


# ===== JOB LISTINGS =====

class JobListingCreate(BaseModel):
    """Create a new job listing."""
    external_id: Optional[str] = Field(None, max_length=255)
    source: str = Field(..., max_length=50)
    job_title: str = Field(..., max_length=200)
    company_name: str = Field(..., max_length=200)
    location: Optional[str] = Field(None, max_length=255)
    remote_type: Optional[RemoteType] = None
    salary_min: Optional[int] = Field(None, ge=0)
    salary_max: Optional[int] = Field(None, ge=0)
    salary_currency: str = Field(default="USD", max_length=3)
    description: Optional[str] = None
    requirements: Optional[str] = None
    benefits: Optional[str] = None
    job_type: Optional[JobType] = None
    experience_level: Optional[ExperienceLevel] = None
    posted_date: Optional[date] = None
    application_deadline: Optional[date] = None
    external_url: Optional[str] = Field(None, max_length=500)


class JobListingUpdate(BaseModel):
    """Update a job listing."""
    job_title: Optional[str] = Field(None, max_length=200)
    company_name: Optional[str] = Field(None, max_length=200)
    location: Optional[str] = Field(None, max_length=255)
    remote_type: Optional[RemoteType] = None
    salary_min: Optional[int] = Field(None, ge=0)
    salary_max: Optional[int] = Field(None, ge=0)
    description: Optional[str] = None
    requirements: Optional[str] = None
    benefits: Optional[str] = None
    is_active: Optional[bool] = None


class JobListingRead(BaseModel):
    """Read job listing data."""
    id: UUID
    external_id: Optional[str]
    source: str
    job_title: str
    company_name: str
    location: Optional[str]
    remote_type: Optional[str]
    salary_min: Optional[int]
    salary_max: Optional[int]
    salary_currency: str
    description: Optional[str]
    requirements: Optional[str]
    benefits: Optional[str]
    job_type: Optional[str]
    experience_level: Optional[str]
    posted_date: Optional[date]
    application_deadline: Optional[date]
    external_url: Optional[str]
    is_active: bool
    extracted_keywords: List[str]
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
    skill_match_score: Optional[int] = Field(None, ge=0, le=100)
    experience_match_score: Optional[int] = Field(None, ge=0, le=100)
    location_match_score: Optional[int] = Field(None, ge=0, le=100)
    matched_skills: List[str] = Field(default_factory=list)
    missing_skills: List[str] = Field(default_factory=list)


class JobMatchUpdate(BaseModel):
    """Update a job match."""
    is_saved: Optional[bool] = None
    is_hidden: Optional[bool] = None


class JobMatchRead(BaseModel):
    """Read job match data."""
    id: UUID
    user_id: UUID
    resume_id: UUID
    job_listing_id: UUID
    match_score: int
    skill_match_score: Optional[int]
    experience_match_score: Optional[int]
    location_match_score: Optional[int]
    matched_skills: List[str]
    missing_skills: List[str]
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

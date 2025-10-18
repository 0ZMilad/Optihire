"""
Schemas for job application tracking.
"""

from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field

from app.schemas.common_schema import ActivityType, ApplicationStatus

# ===== JOB APPLICATIONS =====


class JobApplicationCreate(BaseModel):
    """Create a new job application."""

    user_id: UUID
    resume_id: UUID | None = None
    job_listing_id: UUID | None = None
    company_name: str = Field(..., max_length=200)
    job_title: str = Field(..., max_length=200)
    job_location: str | None = Field(None, max_length=255)
    job_url: str | None = Field(None, max_length=500)
    salary_range: str | None = Field(None, max_length=100)
    status: ApplicationStatus = ApplicationStatus.APPLIED
    application_date: date
    application_method: str | None = Field(None, max_length=50)
    notes: str | None = None
    cover_letter_file_id: UUID | None = None


class JobApplicationUpdate(BaseModel):
    """Update a job application."""

    resume_id: UUID | None = None
    status: ApplicationStatus | None = None
    job_location: str | None = Field(None, max_length=255)
    job_url: str | None = Field(None, max_length=500)
    salary_range: str | None = Field(None, max_length=100)
    last_follow_up_date: date | None = None
    next_follow_up_date: date | None = None
    interview_dates: dict | None = None
    notes: str | None = None
    rejection_date: date | None = None
    rejection_reason: str | None = None
    offer_date: date | None = None
    offer_amount: int | None = None
    offer_accepted: bool | None = None


class JobApplicationRead(BaseModel):
    """Read job application data."""

    id: UUID
    user_id: UUID
    resume_id: UUID | None
    job_listing_id: UUID | None
    company_name: str
    job_title: str
    job_location: str | None
    job_url: str | None
    salary_range: str | None
    status: str
    application_date: date
    application_method: str | None
    last_follow_up_date: date | None
    next_follow_up_date: date | None
    interview_dates: dict | None
    notes: str | None
    cover_letter_file_id: UUID | None
    rejection_date: date | None
    rejection_reason: str | None
    offer_date: date | None
    offer_amount: int | None
    offer_accepted: bool | None
    created_at: datetime
    updated_at: datetime
    deleted_at: datetime | None

    model_config = {"from_attributes": True}


# ===== APPLICATION CONTACTS =====


class ApplicationContactCreate(BaseModel):
    """Create a new application contact."""

    application_id: UUID
    contact_name: str = Field(..., max_length=200)
    contact_title: str | None = Field(None, max_length=200)
    contact_email: EmailStr | None = None
    contact_phone: str | None = Field(None, max_length=30)
    contact_linkedin: str | None = Field(None, max_length=255)
    is_primary: bool = False
    notes: str | None = None


class ApplicationContactUpdate(BaseModel):
    """Update an application contact."""

    contact_name: str | None = Field(None, max_length=200)
    contact_title: str | None = Field(None, max_length=200)
    contact_email: EmailStr | None = None
    contact_phone: str | None = Field(None, max_length=30)
    contact_linkedin: str | None = Field(None, max_length=255)
    is_primary: bool | None = None
    notes: str | None = None


class ApplicationContactRead(BaseModel):
    """Read application contact data."""

    id: UUID
    application_id: UUID
    contact_name: str
    contact_title: str | None
    contact_email: str | None
    contact_phone: str | None
    contact_linkedin: str | None
    is_primary: bool
    notes: str | None
    created_at: datetime
    updated_at: datetime
    deleted_at: datetime | None

    model_config = {"from_attributes": True}


# ===== APPLICATION ACTIVITIES =====


class ApplicationActivityCreate(BaseModel):
    """Create a new application activity."""

    application_id: UUID
    activity_type: ActivityType
    activity_description: str | None = None
    activity_date: datetime = Field(default_factory=datetime.now)
    created_by: UUID | None = None


class ApplicationActivityRead(BaseModel):
    """Read application activity data."""

    id: UUID
    application_id: UUID
    activity_type: str
    activity_description: str | None
    activity_date: datetime
    created_by: UUID | None
    created_at: datetime

    model_config = {"from_attributes": True}

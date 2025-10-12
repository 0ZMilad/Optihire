"""
Schemas for job application tracking.
"""
from uuid import UUID
from datetime import datetime, date
from typing import Optional
from pydantic import BaseModel, Field, EmailStr

from app.schemas.common_schema import ApplicationStatus, ActivityType


# ===== JOB APPLICATIONS =====

class JobApplicationCreate(BaseModel):
    """Create a new job application."""
    user_id: UUID
    resume_id: Optional[UUID] = None
    job_listing_id: Optional[UUID] = None
    company_name: str = Field(..., max_length=200)
    job_title: str = Field(..., max_length=200)
    job_location: Optional[str] = Field(None, max_length=255)
    job_url: Optional[str] = Field(None, max_length=500)
    salary_range: Optional[str] = Field(None, max_length=100)
    status: ApplicationStatus = ApplicationStatus.APPLIED
    application_date: date
    application_method: Optional[str] = Field(None, max_length=50)
    notes: Optional[str] = None
    cover_letter_file_id: Optional[UUID] = None


class JobApplicationUpdate(BaseModel):
    """Update a job application."""
    resume_id: Optional[UUID] = None
    status: Optional[ApplicationStatus] = None
    job_location: Optional[str] = Field(None, max_length=255)
    job_url: Optional[str] = Field(None, max_length=500)
    salary_range: Optional[str] = Field(None, max_length=100)
    last_follow_up_date: Optional[date] = None
    next_follow_up_date: Optional[date] = None
    interview_dates: Optional[dict] = None
    notes: Optional[str] = None
    rejection_date: Optional[date] = None
    rejection_reason: Optional[str] = None
    offer_date: Optional[date] = None
    offer_amount: Optional[int] = None
    offer_accepted: Optional[bool] = None


class JobApplicationRead(BaseModel):
    """Read job application data."""
    id: UUID
    user_id: UUID
    resume_id: Optional[UUID]
    job_listing_id: Optional[UUID]
    company_name: str
    job_title: str
    job_location: Optional[str]
    job_url: Optional[str]
    salary_range: Optional[str]
    status: str
    application_date: date
    application_method: Optional[str]
    last_follow_up_date: Optional[date]
    next_follow_up_date: Optional[date]
    interview_dates: Optional[dict]
    notes: Optional[str]
    cover_letter_file_id: Optional[UUID]
    rejection_date: Optional[date]
    rejection_reason: Optional[str]
    offer_date: Optional[date]
    offer_amount: Optional[int]
    offer_accepted: Optional[bool]
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime]

    model_config = {"from_attributes": True}


# ===== APPLICATION CONTACTS =====

class ApplicationContactCreate(BaseModel):
    """Create a new application contact."""
    application_id: UUID
    contact_name: str = Field(..., max_length=200)
    contact_title: Optional[str] = Field(None, max_length=200)
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = Field(None, max_length=30)
    contact_linkedin: Optional[str] = Field(None, max_length=255)
    is_primary: bool = False
    notes: Optional[str] = None


class ApplicationContactUpdate(BaseModel):
    """Update an application contact."""
    contact_name: Optional[str] = Field(None, max_length=200)
    contact_title: Optional[str] = Field(None, max_length=200)
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = Field(None, max_length=30)
    contact_linkedin: Optional[str] = Field(None, max_length=255)
    is_primary: Optional[bool] = None
    notes: Optional[str] = None


class ApplicationContactRead(BaseModel):
    """Read application contact data."""
    id: UUID
    application_id: UUID
    contact_name: str
    contact_title: Optional[str]
    contact_email: Optional[str]
    contact_phone: Optional[str]
    contact_linkedin: Optional[str]
    is_primary: bool
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime]

    model_config = {"from_attributes": True}


# ===== APPLICATION ACTIVITIES =====

class ApplicationActivityCreate(BaseModel):
    """Create a new application activity."""
    application_id: UUID
    activity_type: ActivityType
    activity_description: Optional[str] = None
    activity_date: datetime = Field(default_factory=datetime.now)
    created_by: Optional[UUID] = None


class ApplicationActivityRead(BaseModel):
    """Read application activity data."""
    id: UUID
    application_id: UUID
    activity_type: str
    activity_description: Optional[str]
    activity_date: datetime
    created_by: Optional[UUID]
    created_at: datetime

    model_config = {"from_attributes": True}

"""
Schemas for content generation tools (cover letters, interview prep, project suggestions).
"""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field

from app.schemas.common_schema import ProjectStatus

# ===== COVER LETTERS =====


class CoverLetterCreate(BaseModel):
    """Create a new cover letter."""

    user_id: UUID
    resume_id: UUID | None = None
    content: str
    generated_by: str = Field(default="ai", max_length=50)


class CoverLetterUpdate(BaseModel):
    """Update a cover letter."""

    content: str | None = None


class CoverLetterRead(BaseModel):
    """Read cover letter data."""

    id: UUID
    user_id: UUID
    resume_id: UUID | None
    content: str
    generated_by: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ===== INTERVIEW QUESTIONS =====


class InterviewQuestionCreate(BaseModel):
    """Create new interview questions."""

    user_id: UUID
    job_title: str | None = Field(None, max_length=200)
    questions: list[str]


class InterviewQuestionRead(BaseModel):
    """Read interview questions data."""

    id: UUID
    user_id: UUID
    job_title: str | None
    questions: list[str]
    created_at: datetime

    model_config = {"from_attributes": True}


# ===== SUGGESTED PROJECTS =====


class SuggestedProjectCreate(BaseModel):
    """Create a new suggested project."""

    title: str = Field(..., max_length=200)
    description: str | None = None
    difficulty_level: str | None = Field(None, max_length=50)
    estimated_hours: int | None = Field(None, ge=0)
    skills_gained: list[str] = Field(default_factory=list)
    project_url: str | None = Field(None, max_length=500)
    field: str | None = Field(None, max_length=50)


class SuggestedProjectUpdate(BaseModel):
    """Update a suggested project."""

    title: str | None = Field(None, max_length=200)
    description: str | None = None
    difficulty_level: str | None = Field(None, max_length=50)
    estimated_hours: int | None = Field(None, ge=0)
    skills_gained: list[str] | None = None
    project_url: str | None = Field(None, max_length=500)
    is_active: bool | None = None


class SuggestedProjectRead(BaseModel):
    """Read suggested project data."""

    id: UUID
    title: str
    description: str | None
    difficulty_level: str | None
    estimated_hours: int | None
    skills_gained: list[str]
    project_url: str | None
    field: str | None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ===== USER SUGGESTED PROJECTS =====


class UserSuggestedProjectCreate(BaseModel):
    """Create a user-project association."""

    user_id: UUID
    project_id: UUID
    status: ProjectStatus = ProjectStatus.SUGGESTED


class UserSuggestedProjectUpdate(BaseModel):
    """Update user project progress."""

    status: ProjectStatus | None = None
    started_at: datetime | None = None
    completed_at: datetime | None = None


class UserSuggestedProjectRead(BaseModel):
    """Read user project association data."""

    id: UUID
    user_id: UUID
    project_id: UUID
    status: str
    started_at: datetime | None
    completed_at: datetime | None
    created_at: datetime

    model_config = {"from_attributes": True}

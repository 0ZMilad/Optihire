"""
Schemas for content generation tools (cover letters, interview prep, project suggestions).
"""
from uuid import UUID
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field

from app.schemas.common_schema import ProjectStatus


# ===== COVER LETTERS =====

class CoverLetterCreate(BaseModel):
    """Create a new cover letter."""
    user_id: UUID
    resume_id: Optional[UUID] = None
    content: str
    generated_by: str = Field(default="ai", max_length=50)


class CoverLetterUpdate(BaseModel):
    """Update a cover letter."""
    content: Optional[str] = None


class CoverLetterRead(BaseModel):
    """Read cover letter data."""
    id: UUID
    user_id: UUID
    resume_id: Optional[UUID]
    content: str
    generated_by: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ===== INTERVIEW QUESTIONS =====

class InterviewQuestionCreate(BaseModel):
    """Create new interview questions."""
    user_id: UUID
    job_title: Optional[str] = Field(None, max_length=200)
    questions: List[str]


class InterviewQuestionRead(BaseModel):
    """Read interview questions data."""
    id: UUID
    user_id: UUID
    job_title: Optional[str]
    questions: List[str]
    created_at: datetime

    model_config = {"from_attributes": True}


# ===== SUGGESTED PROJECTS =====

class SuggestedProjectCreate(BaseModel):
    """Create a new suggested project."""
    title: str = Field(..., max_length=200)
    description: Optional[str] = None
    difficulty_level: Optional[str] = Field(None, max_length=50)
    estimated_hours: Optional[int] = Field(None, ge=0)
    skills_gained: List[str] = Field(default_factory=list)
    project_url: Optional[str] = Field(None, max_length=500)
    field: Optional[str] = Field(None, max_length=50)


class SuggestedProjectUpdate(BaseModel):
    """Update a suggested project."""
    title: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = None
    difficulty_level: Optional[str] = Field(None, max_length=50)
    estimated_hours: Optional[int] = Field(None, ge=0)
    skills_gained: Optional[List[str]] = None
    project_url: Optional[str] = Field(None, max_length=500)
    is_active: Optional[bool] = None


class SuggestedProjectRead(BaseModel):
    """Read suggested project data."""
    id: UUID
    title: str
    description: Optional[str]
    difficulty_level: Optional[str]
    estimated_hours: Optional[int]
    skills_gained: List[str]
    project_url: Optional[str]
    field: Optional[str]
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
    status: Optional[ProjectStatus] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None


class UserSuggestedProjectRead(BaseModel):
    """Read user project association data."""
    id: UUID
    user_id: UUID
    project_id: UUID
    status: str
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    created_at: datetime

    model_config = {"from_attributes": True}

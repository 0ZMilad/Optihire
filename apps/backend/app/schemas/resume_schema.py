"""
Schemas for resumes and all related sections.
"""
from uuid import UUID
from datetime import datetime, date
from typing import Optional, List
from decimal import Decimal
from pydantic import BaseModel, Field, EmailStr, HttpUrl


# ===== RESUME TEMPLATES =====

class ResumeTemplateRead(BaseModel):
    """Read resume template data."""
    id: UUID
    name: str
    version: str
    path: str
    thumbnail_url: Optional[str]
    is_default: bool
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ===== MAIN RESUME =====

class ResumeCreate(BaseModel):
    """Create a new resume."""
    user_id: UUID
    version_name: str = Field(..., max_length=100)
    template_id: Optional[UUID] = None
    is_primary: bool = False
    full_name: Optional[str] = Field(None, max_length=200)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=30)
    location: Optional[str] = Field(None, max_length=255)
    linkedin_url: Optional[str] = Field(None, max_length=255)
    github_url: Optional[str] = Field(None, max_length=255)
    portfolio_url: Optional[str] = Field(None, max_length=255)
    professional_summary: Optional[str] = None


class ResumeUpdate(BaseModel):
    """Update a resume."""
    version_name: Optional[str] = Field(None, max_length=100)
    template_id: Optional[UUID] = None
    is_primary: Optional[bool] = None
    section_order: Optional[dict] = None
    full_name: Optional[str] = Field(None, max_length=200)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=30)
    location: Optional[str] = Field(None, max_length=255)
    linkedin_url: Optional[str] = Field(None, max_length=255)
    github_url: Optional[str] = Field(None, max_length=255)
    portfolio_url: Optional[str] = Field(None, max_length=255)
    professional_summary: Optional[str] = None


class ResumeRead(BaseModel):
    """Read resume data."""
    id: UUID
    user_id: UUID
    version_name: str
    template_id: Optional[UUID]
    is_primary: bool
    section_order: Optional[dict]
    content_hash: Optional[str]
    full_name: Optional[str]
    email: Optional[str]
    phone: Optional[str]
    location: Optional[str]
    linkedin_url: Optional[str]
    github_url: Optional[str]
    portfolio_url: Optional[str]
    professional_summary: Optional[str]
    last_analyzed_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime]

    model_config = {"from_attributes": True}


# ===== EXPERIENCE =====

class ExperienceCreate(BaseModel):
    """Create a new experience entry."""
    resume_id: UUID
    company_name: str = Field(..., max_length=200)
    job_title: str = Field(..., max_length=200)
    location: Optional[str] = Field(None, max_length=255)
    start_date: date
    end_date: Optional[date] = None
    is_current: bool = False
    description: Optional[str] = None
    achievements: List[str] = Field(default_factory=list)
    skills_used: List[str] = Field(default_factory=list)
    display_order: int = 0


class ExperienceUpdate(BaseModel):
    """Update an experience entry."""
    company_name: Optional[str] = Field(None, max_length=200)
    job_title: Optional[str] = Field(None, max_length=200)
    location: Optional[str] = Field(None, max_length=255)
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_current: Optional[bool] = None
    description: Optional[str] = None
    achievements: Optional[List[str]] = None
    skills_used: Optional[List[str]] = None
    display_order: Optional[int] = None


class ExperienceRead(BaseModel):
    """Read experience data."""
    id: UUID
    resume_id: UUID
    company_name: str
    job_title: str
    location: Optional[str]
    start_date: date
    end_date: Optional[date]
    is_current: bool
    description: Optional[str]
    achievements: List[str]
    skills_used: List[str]
    display_order: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ===== EDUCATION =====

class EducationCreate(BaseModel):
    """Create a new education entry."""
    resume_id: UUID
    institution_name: str = Field(..., max_length=200)
    degree_type: Optional[str] = Field(None, max_length=100)
    field_of_study: Optional[str] = Field(None, max_length=200)
    location: Optional[str] = Field(None, max_length=255)
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_current: bool = False
    gpa: Optional[Decimal] = Field(None, ge=0, le=4.0)
    achievements: List[str] = Field(default_factory=list)
    relevant_coursework: List[str] = Field(default_factory=list)
    display_order: int = 0


class EducationUpdate(BaseModel):
    """Update an education entry."""
    institution_name: Optional[str] = Field(None, max_length=200)
    degree_type: Optional[str] = Field(None, max_length=100)
    field_of_study: Optional[str] = Field(None, max_length=200)
    location: Optional[str] = Field(None, max_length=255)
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_current: Optional[bool] = None
    gpa: Optional[Decimal] = Field(None, ge=0, le=4.0)
    achievements: Optional[List[str]] = None
    relevant_coursework: Optional[List[str]] = None
    display_order: Optional[int] = None


class EducationRead(BaseModel):
    """Read education data."""
    id: UUID
    resume_id: UUID
    institution_name: str
    degree_type: Optional[str]
    field_of_study: Optional[str]
    location: Optional[str]
    start_date: Optional[date]
    end_date: Optional[date]
    is_current: bool
    gpa: Optional[Decimal]
    achievements: List[str]
    relevant_coursework: List[str]
    display_order: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ===== SKILLS =====

class SkillCreate(BaseModel):
    """Create a new skill entry."""
    resume_id: UUID
    skill_name: str = Field(..., max_length=100)
    skill_category: Optional[str] = Field(None, max_length=50)
    proficiency_level: Optional[str] = Field(None, max_length=20)
    years_of_experience: Optional[Decimal] = Field(None, ge=0, le=99.9)
    is_primary: bool = False
    display_order: int = 0


class SkillUpdate(BaseModel):
    """Update a skill entry."""
    skill_name: Optional[str] = Field(None, max_length=100)
    skill_category: Optional[str] = Field(None, max_length=50)
    proficiency_level: Optional[str] = Field(None, max_length=20)
    years_of_experience: Optional[Decimal] = Field(None, ge=0, le=99.9)
    is_primary: Optional[bool] = None
    display_order: Optional[int] = None


class SkillRead(BaseModel):
    """Read skill data."""
    id: UUID
    resume_id: UUID
    skill_name: str
    skill_category: Optional[str]
    proficiency_level: Optional[str]
    years_of_experience: Optional[Decimal]
    is_primary: bool
    display_order: int
    created_at: datetime

    model_config = {"from_attributes": True}


# ===== CERTIFICATIONS =====

class CertificationCreate(BaseModel):
    """Create a new certification entry."""
    resume_id: UUID
    certification_name: str = Field(..., max_length=200)
    issuing_organization: Optional[str] = Field(None, max_length=200)
    issue_date: Optional[date] = None
    expiry_date: Optional[date] = None
    credential_id: Optional[str] = Field(None, max_length=100)
    credential_url: Optional[str] = Field(None, max_length=500)
    display_order: int = 0


class CertificationUpdate(BaseModel):
    """Update a certification entry."""
    certification_name: Optional[str] = Field(None, max_length=200)
    issuing_organization: Optional[str] = Field(None, max_length=200)
    issue_date: Optional[date] = None
    expiry_date: Optional[date] = None
    credential_id: Optional[str] = Field(None, max_length=100)
    credential_url: Optional[str] = Field(None, max_length=500)
    display_order: Optional[int] = None


class CertificationRead(BaseModel):
    """Read certification data."""
    id: UUID
    resume_id: UUID
    certification_name: str
    issuing_organization: Optional[str]
    issue_date: Optional[date]
    expiry_date: Optional[date]
    credential_id: Optional[str]
    credential_url: Optional[str]
    display_order: int
    created_at: datetime

    model_config = {"from_attributes": True}


# ===== PROJECTS =====

class ProjectCreate(BaseModel):
    """Create a new project entry."""
    resume_id: UUID
    project_name: str = Field(..., max_length=200)
    role: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None
    technologies_used: List[str] = Field(default_factory=list)
    project_url: Optional[str] = Field(None, max_length=500)
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_current: bool = False
    achievements: List[str] = Field(default_factory=list)
    display_order: int = 0


class ProjectUpdate(BaseModel):
    """Update a project entry."""
    project_name: Optional[str] = Field(None, max_length=200)
    role: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None
    technologies_used: Optional[List[str]] = None
    project_url: Optional[str] = Field(None, max_length=500)
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_current: Optional[bool] = None
    achievements: Optional[List[str]] = None
    display_order: Optional[int] = None


class ProjectRead(BaseModel):
    """Read project data."""
    id: UUID
    resume_id: UUID
    project_name: str
    role: Optional[str]
    description: Optional[str]
    technologies_used: List[str]
    project_url: Optional[str]
    start_date: Optional[date]
    end_date: Optional[date]
    is_current: bool
    achievements: List[str]
    display_order: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ===== CUSTOM SECTIONS =====

class CustomSectionCreate(BaseModel):
    """Create a new custom section."""
    resume_id: UUID
    section_title: str = Field(..., max_length=100)
    section_type: Optional[str] = Field(None, max_length=50)
    content: dict
    display_order: int = 0


class CustomSectionUpdate(BaseModel):
    """Update a custom section."""
    section_title: Optional[str] = Field(None, max_length=100)
    section_type: Optional[str] = Field(None, max_length=50)
    content: Optional[dict] = None
    display_order: Optional[int] = None


class CustomSectionRead(BaseModel):
    """Read custom section data."""
    id: UUID
    resume_id: UUID
    section_title: str
    section_type: Optional[str]
    content: dict
    display_order: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ===== COMBINED RESUME =====

class ResumeComplete(ResumeRead):
    """Complete resume with all related sections."""
    experiences: List[ExperienceRead] = Field(default_factory=list)
    education: List[EducationRead] = Field(default_factory=list)
    skills: List[SkillRead] = Field(default_factory=list)
    certifications: List[CertificationRead] = Field(default_factory=list)
    projects: List[ProjectRead] = Field(default_factory=list)
    custom_sections: List[CustomSectionRead] = Field(default_factory=list)

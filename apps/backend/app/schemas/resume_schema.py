"""
Schemas for resumes and all related sections.
"""

from datetime import date, datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field

# ===== RESUME TEMPLATES =====


class ResumeTemplateRead(BaseModel):
    """Read resume template data."""

    id: UUID
    name: str
    version: str
    path: str
    thumbnail_url: str | None
    is_default: bool
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ===== MAIN RESUME =====


class ResumeCreate(BaseModel):
    """Create a new resume."""

    user_id: UUID
    version_name: str = Field(..., max_length=100)
    template_id: UUID | None = None
    is_primary: bool = False
    full_name: str | None = Field(None, max_length=200)
    email: EmailStr | None = None
    phone: str | None = Field(None, max_length=30)
    location: str | None = Field(None, max_length=255)
    linkedin_url: str | None = Field(None, max_length=255)
    github_url: str | None = Field(None, max_length=255)
    portfolio_url: str | None = Field(None, max_length=255)
    professional_summary: str | None = None


class ResumeUpdate(BaseModel):
    """Update a resume."""

    version_name: str | None = Field(None, max_length=100)
    template_id: UUID | None = None
    is_primary: bool | None = None
    section_order: dict | None = None
    full_name: str | None = Field(None, max_length=200)
    email: EmailStr | None = None
    phone: str | None = Field(None, max_length=30)
    location: str | None = Field(None, max_length=255)
    linkedin_url: str | None = Field(None, max_length=255)
    github_url: str | None = Field(None, max_length=255)
    portfolio_url: str | None = Field(None, max_length=255)
    professional_summary: str | None = None


class ResumeRead(BaseModel):
    """Read resume data."""

    id: UUID
    user_id: UUID
    version_name: str
    template_id: UUID | None
    is_primary: bool
    section_order: dict | None
    content_hash: str | None
    full_name: str | None
    email: str | None
    phone: str | None
    location: str | None
    linkedin_url: str | None
    github_url: str | None
    portfolio_url: str | None
    professional_summary: str | None
    raw_text: str | None
    processing_status: str
    error_message: str | None
    last_analyzed_at: datetime | None
    created_at: datetime
    updated_at: datetime
    deleted_at: datetime | None

    model_config = {"from_attributes": True}


class ResumeParseStatusResponse(BaseModel):
    """Response schema for resume parsing status."""

    id: UUID
    status: str
    message: str
    created_at: datetime
    updated_at: datetime
    error_details: str | None = None

    model_config = {"from_attributes": True}


# ===== EXPERIENCE =====


class ExperienceCreate(BaseModel):
    """Create a new experience entry."""

    resume_id: UUID
    company_name: str = Field(..., max_length=200)
    job_title: str = Field(..., max_length=200)
    location: str | None = Field(None, max_length=255)
    start_date: date
    end_date: date | None = None
    is_current: bool = False
    description: str | None = None
    achievements: list[str] = Field(default_factory=list)
    skills_used: list[str] = Field(default_factory=list)
    display_order: int = 0


class ExperienceUpdate(BaseModel):
    """Update an experience entry."""

    company_name: str | None = Field(None, max_length=200)
    job_title: str | None = Field(None, max_length=200)
    location: str | None = Field(None, max_length=255)
    start_date: date | None = None
    end_date: date | None = None
    is_current: bool | None = None
    description: str | None = None
    achievements: list[str] | None = None
    skills_used: list[str] | None = None
    display_order: int | None = None


class ExperienceRead(BaseModel):
    """Read experience data."""

    id: UUID
    resume_id: UUID
    company_name: str
    job_title: str
    location: str | None
    start_date: date
    end_date: date | None
    is_current: bool
    description: str | None
    achievements: list[str]
    skills_used: list[str]
    display_order: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ===== EDUCATION =====


class EducationCreate(BaseModel):
    """Create a new education entry."""

    resume_id: UUID
    institution_name: str = Field(..., max_length=200)
    degree_type: str | None = Field(None, max_length=100)
    field_of_study: str | None = Field(None, max_length=200)
    location: str | None = Field(None, max_length=255)
    start_date: date | None = None
    end_date: date | None = None
    is_current: bool = False
    gpa: Decimal | None = Field(None, ge=0, le=4.0)
    achievements: list[str] = Field(default_factory=list)
    relevant_coursework: list[str] = Field(default_factory=list)
    display_order: int = 0


class EducationUpdate(BaseModel):
    """Update an education entry."""

    institution_name: str | None = Field(None, max_length=200)
    degree_type: str | None = Field(None, max_length=100)
    field_of_study: str | None = Field(None, max_length=200)
    location: str | None = Field(None, max_length=255)
    start_date: date | None = None
    end_date: date | None = None
    is_current: bool | None = None
    gpa: Decimal | None = Field(None, ge=0, le=4.0)
    achievements: list[str] | None = None
    relevant_coursework: list[str] | None = None
    display_order: int | None = None


class EducationRead(BaseModel):
    """Read education data."""

    id: UUID
    resume_id: UUID
    institution_name: str
    degree_type: str | None
    field_of_study: str | None
    location: str | None
    start_date: date | None
    end_date: date | None
    is_current: bool
    gpa: Decimal | None
    achievements: list[str]
    relevant_coursework: list[str]
    display_order: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ===== SKILLS =====


class SkillCreate(BaseModel):
    """Create a new skill entry."""

    resume_id: UUID
    skill_name: str = Field(..., max_length=100)
    skill_category: str | None = Field(None, max_length=50)
    proficiency_level: str | None = Field(None, max_length=20)
    years_of_experience: Decimal | None = Field(None, ge=0, le=99.9)
    is_primary: bool = False
    display_order: int = 0


class SkillUpdate(BaseModel):
    """Update a skill entry."""

    skill_name: str | None = Field(None, max_length=100)
    skill_category: str | None = Field(None, max_length=50)
    proficiency_level: str | None = Field(None, max_length=20)
    years_of_experience: Decimal | None = Field(None, ge=0, le=99.9)
    is_primary: bool | None = None
    display_order: int | None = None


class SkillRead(BaseModel):
    """Read skill data."""

    id: UUID
    resume_id: UUID
    skill_name: str
    skill_category: str | None
    proficiency_level: str | None
    years_of_experience: Decimal | None
    is_primary: bool
    display_order: int
    created_at: datetime

    model_config = {"from_attributes": True}


# ===== CERTIFICATIONS =====


class CertificationCreate(BaseModel):
    """Create a new certification entry."""

    resume_id: UUID
    certification_name: str = Field(..., max_length=200)
    issuing_organization: str | None = Field(None, max_length=200)
    issue_date: date | None = None
    expiry_date: date | None = None
    credential_id: str | None = Field(None, max_length=100)
    credential_url: str | None = Field(None, max_length=500)
    display_order: int = 0


class CertificationUpdate(BaseModel):
    """Update a certification entry."""

    certification_name: str | None = Field(None, max_length=200)
    issuing_organization: str | None = Field(None, max_length=200)
    issue_date: date | None = None
    expiry_date: date | None = None
    credential_id: str | None = Field(None, max_length=100)
    credential_url: str | None = Field(None, max_length=500)
    display_order: int | None = None


class CertificationRead(BaseModel):
    """Read certification data."""

    id: UUID
    resume_id: UUID
    certification_name: str
    issuing_organization: str | None
    issue_date: date | None
    expiry_date: date | None
    credential_id: str | None
    credential_url: str | None
    display_order: int
    created_at: datetime

    model_config = {"from_attributes": True}


# ===== PROJECTS =====


class ProjectCreate(BaseModel):
    """Create a new project entry."""

    resume_id: UUID
    project_name: str = Field(..., max_length=200)
    role: str | None = Field(None, max_length=100)
    description: str | None = None
    technologies_used: list[str] = Field(default_factory=list)
    project_url: str | None = Field(None, max_length=500)
    start_date: date | None = None
    end_date: date | None = None
    is_current: bool = False
    achievements: list[str] = Field(default_factory=list)
    display_order: int = 0


class ProjectUpdate(BaseModel):
    """Update a project entry."""

    project_name: str | None = Field(None, max_length=200)
    role: str | None = Field(None, max_length=100)
    description: str | None = None
    technologies_used: list[str] | None = None
    project_url: str | None = Field(None, max_length=500)
    start_date: date | None = None
    end_date: date | None = None
    is_current: bool | None = None
    achievements: list[str] | None = None
    display_order: int | None = None


class ProjectRead(BaseModel):
    """Read project data."""

    id: UUID
    resume_id: UUID
    project_name: str
    role: str | None
    description: str | None
    technologies_used: list[str]
    project_url: str | None
    start_date: date | None
    end_date: date | None
    is_current: bool
    achievements: list[str]
    display_order: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ===== CUSTOM SECTIONS =====


class CustomSectionCreate(BaseModel):
    """Create a new custom section."""

    resume_id: UUID
    section_title: str = Field(..., max_length=100)
    section_type: str | None = Field(None, max_length=50)
    content: dict
    display_order: int = 0


class CustomSectionUpdate(BaseModel):
    """Update a custom section."""

    section_title: str | None = Field(None, max_length=100)
    section_type: str | None = Field(None, max_length=50)
    content: dict | None = None
    display_order: int | None = None


class CustomSectionRead(BaseModel):
    """Read custom section data."""

    id: UUID
    resume_id: UUID
    section_title: str
    section_type: str | None
    content: dict
    display_order: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ===== COMBINED RESUME =====


class ResumeComplete(ResumeRead):
    """Complete resume with all related sections."""

    experiences: list[ExperienceRead] = Field(default_factory=list)
    education: list[EducationRead] = Field(default_factory=list)
    skills: list[SkillRead] = Field(default_factory=list)
    certifications: list[CertificationRead] = Field(default_factory=list)
    projects: list[ProjectRead] = Field(default_factory=list)
    custom_sections: list[CustomSectionRead] = Field(default_factory=list)

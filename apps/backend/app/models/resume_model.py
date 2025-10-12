"""
Resume and related section models for database operations.
"""
from typing import Optional, List
from uuid import UUID, uuid4
from datetime import datetime, date
from decimal import Decimal
from sqlmodel import SQLModel, Field, Column
from sqlalchemy import func, Text, ARRAY, String, UniqueConstraint, JSON, Index
from sqlalchemy.dialects.postgresql import UUID as PGUUID, JSONB


class ResumeTemplate(SQLModel, table=True):
    """Resume templates for different styles."""
    __tablename__ = "resume_templates"
    
    id: UUID = Field(
        default_factory=uuid4,

        sa_column=Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    )
    name: str = Field(max_length=100, nullable=False)
    version: str = Field(max_length=20, nullable=False, default="1.0")
    path: str = Field(max_length=255, nullable=False)
    thumbnail_url: Optional[str] = Field(default=None, max_length=500)
    is_default: bool = Field(default=False)
    is_active: bool = Field(default=True)
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column_kwargs={"server_default": func.now()}
    )


class Resume(SQLModel, table=True):
    """Main resume table."""
    __tablename__ = "resumes"
    __table_args__ = (
        Index("idx_resumes_user", "user_id"),
        Index("idx_resumes_content_hash", "content_hash"),
        Index("idx_resumes_primary", "user_id", unique=True, postgresql_where="is_primary = TRUE"),
    )
    
    id: UUID = Field(
        default_factory=uuid4,

        sa_column=Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    )
    user_id: UUID = Field(
        sa_column=Column(PGUUID(as_uuid=True), nullable=False, index=True)
    )
    version_name: str = Field(max_length=100, nullable=False)
    template_id: Optional[UUID] = Field(
        default=None,
        sa_column=Column(PGUUID(as_uuid=True), nullable=True)
    )
    is_primary: bool = Field(default=False)
    section_order: Optional[dict] = Field(default=None, sa_column=Column(JSONB))
    content_hash: Optional[str] = Field(default=None, max_length=64)
    full_name: Optional[str] = Field(default=None, max_length=200)
    email: Optional[str] = Field(default=None, max_length=255)
    phone: Optional[str] = Field(default=None, max_length=30)
    location: Optional[str] = Field(default=None, max_length=255)
    linkedin_url: Optional[str] = Field(default=None, max_length=255)
    github_url: Optional[str] = Field(default=None, max_length=255)
    portfolio_url: Optional[str] = Field(default=None, max_length=255)
    professional_summary: Optional[str] = Field(default=None, sa_column=Column(Text))
    last_analyzed_at: Optional[datetime] = Field(default=None)
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column_kwargs={"server_default": func.now()}
    )
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column_kwargs={"server_default": func.now(), "onupdate": func.now()}
    )
    deleted_at: Optional[datetime] = Field(default=None)


class ResumeExperience(SQLModel, table=True):
    """Work experience entries for resumes."""
    __tablename__ = "resume_experiences"
    __table_args__ = (
        Index("idx_exp_resume", "resume_id"),
    )
    
    id: UUID = Field(
        default_factory=uuid4,

        sa_column=Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    )
    resume_id: UUID = Field(
        sa_column=Column(PGUUID(as_uuid=True), nullable=False, index=True)
    )
    company_name: str = Field(max_length=200, nullable=False)
    job_title: str = Field(max_length=200, nullable=False)
    location: Optional[str] = Field(default=None, max_length=255)
    start_date: date = Field(nullable=False)
    end_date: Optional[date] = Field(default=None)
    is_current: bool = Field(default=False)
    description: Optional[str] = Field(default=None, sa_column=Column(Text))
    achievements: List[str] = Field(
        default_factory=list,
        sa_column=Column(ARRAY(String), server_default='{}')
    )
    skills_used: List[str] = Field(
        default_factory=list,
        sa_column=Column(ARRAY(String), server_default='{}')
    )
    display_order: int = Field(default=0, nullable=False)
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column_kwargs={"server_default": func.now()}
    )
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column_kwargs={"server_default": func.now(), "onupdate": func.now()}
    )


class ResumeEducation(SQLModel, table=True):
    """Education entries for resumes."""
    __tablename__ = "resume_education"
    __table_args__ = (
        Index("idx_edu_resume", "resume_id"),
    )
    
    id: UUID = Field(
        default_factory=uuid4,

        sa_column=Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    )
    resume_id: UUID = Field(
        sa_column=Column(PGUUID(as_uuid=True), nullable=False, index=True)
    )
    institution_name: str = Field(max_length=200, nullable=False)
    degree_type: Optional[str] = Field(default=None, max_length=100)
    field_of_study: Optional[str] = Field(default=None, max_length=200)
    location: Optional[str] = Field(default=None, max_length=255)
    start_date: Optional[date] = Field(default=None)
    end_date: Optional[date] = Field(default=None)
    is_current: bool = Field(default=False)
    gpa: Optional[Decimal] = Field(default=None, max_digits=3, decimal_places=2)
    achievements: List[str] = Field(
        default_factory=list,
        sa_column=Column(ARRAY(String), server_default='{}')
    )
    relevant_coursework: List[str] = Field(
        default_factory=list,
        sa_column=Column(ARRAY(String), server_default='{}')
    )
    display_order: int = Field(default=0, nullable=False)
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column_kwargs={"server_default": func.now()}
    )
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column_kwargs={"server_default": func.now(), "onupdate": func.now()}
    )


class ResumeSkill(SQLModel, table=True):
    """Skills for resumes."""
    __tablename__ = "resume_skills"
    __table_args__ = (
        UniqueConstraint("resume_id", "skill_name", name="uq_resume_skill"),
        Index("idx_skill_resume", "resume_id"),
    )
    
    id: UUID = Field(
        default_factory=uuid4,

        sa_column=Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    )
    resume_id: UUID = Field(
        sa_column=Column(PGUUID(as_uuid=True), nullable=False, index=True)
    )
    skill_name: str = Field(max_length=100, nullable=False)
    skill_category: Optional[str] = Field(default=None, max_length=50)
    proficiency_level: Optional[str] = Field(default=None, max_length=20)
    years_of_experience: Optional[Decimal] = Field(default=None, max_digits=4, decimal_places=1)
    is_primary: bool = Field(default=False)
    display_order: int = Field(default=0, nullable=False)
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column_kwargs={"server_default": func.now()}
    )


class ResumeCertification(SQLModel, table=True):
    """Certifications for resumes."""
    __tablename__ = "resume_certifications"
    __table_args__ = (
        Index("idx_cert_resume", "resume_id"),
    )
    
    id: UUID = Field(
        default_factory=uuid4,

        sa_column=Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    )
    resume_id: UUID = Field(
        sa_column=Column(PGUUID(as_uuid=True), nullable=False, index=True)
    )
    certification_name: str = Field(max_length=200, nullable=False)
    issuing_organization: Optional[str] = Field(default=None, max_length=200)
    issue_date: Optional[date] = Field(default=None)
    expiry_date: Optional[date] = Field(default=None)
    credential_id: Optional[str] = Field(default=None, max_length=100)
    credential_url: Optional[str] = Field(default=None, max_length=500)
    display_order: int = Field(default=0, nullable=False)
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column_kwargs={"server_default": func.now()}
    )


class ResumeProject(SQLModel, table=True):
    """Projects for resumes."""
    __tablename__ = "resume_projects"
    __table_args__ = (
        Index("idx_proj_resume", "resume_id"),
    )
    
    id: UUID = Field(
        default_factory=uuid4,

        sa_column=Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    )
    resume_id: UUID = Field(
        sa_column=Column(PGUUID(as_uuid=True), nullable=False, index=True)
    )
    project_name: str = Field(max_length=200, nullable=False)
    role: Optional[str] = Field(default=None, max_length=100)
    description: Optional[str] = Field(default=None, sa_column=Column(Text))
    technologies_used: List[str] = Field(
        default_factory=list,
        sa_column=Column(ARRAY(String), server_default='{}')
    )
    project_url: Optional[str] = Field(default=None, max_length=500)
    start_date: Optional[date] = Field(default=None)
    end_date: Optional[date] = Field(default=None)
    is_current: bool = Field(default=False)
    achievements: List[str] = Field(
        default_factory=list,
        sa_column=Column(ARRAY(String), server_default='{}')
    )
    display_order: int = Field(default=0, nullable=False)
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column_kwargs={"server_default": func.now()}
    )
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column_kwargs={"server_default": func.now(), "onupdate": func.now()}
    )


class ResumeCustomSection(SQLModel, table=True):
    """Custom sections for resumes."""
    __tablename__ = "resume_custom_sections"
    __table_args__ = (
        Index("idx_custom_resume", "resume_id"),
    )
    
    id: UUID = Field(
        default_factory=uuid4,

        sa_column=Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    )
    resume_id: UUID = Field(
        sa_column=Column(PGUUID(as_uuid=True), nullable=False, index=True)
    )
    section_title: str = Field(max_length=100, nullable=False)
    section_type: Optional[str] = Field(default=None, max_length=50)
    content: dict = Field(sa_column=Column(JSONB, nullable=False))
    display_order: int = Field(default=0, nullable=False)
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column_kwargs={"server_default": func.now()}
    )
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column_kwargs={"server_default": func.now(), "onupdate": func.now()}
    )

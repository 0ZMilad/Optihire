"""
Resume and related section models for database operations.
"""

from datetime import date, datetime
from decimal import Decimal
from uuid import UUID, uuid4

from sqlalchemy import ARRAY, Index, String, Text, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlmodel import Column, Field, SQLModel


class ResumeTemplate(SQLModel, table=True):
    """Resume templates for different styles."""

    __tablename__ = "resume_templates"

    id: UUID = Field(
        default_factory=uuid4,
        sa_column=Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4),
    )
    name: str = Field(max_length=100, nullable=False)
    version: str = Field(max_length=20, nullable=False, default="1.0")
    path: str = Field(max_length=255, nullable=False)
    thumbnail_url: str | None = Field(default=None, max_length=500)
    is_default: bool = Field(default=False)
    is_active: bool = Field(default=True)
    created_at: datetime = Field(
        default_factory=datetime.utcnow, sa_column_kwargs={"server_default": func.now()}
    )


class Resume(SQLModel, table=True):
    """Main resume table."""

    __tablename__ = "resumes"
    __table_args__ = (
        Index("idx_resumes_user", "user_id"),
        Index("idx_resumes_content_hash", "content_hash"),
        Index(
            "idx_resumes_primary",
            "user_id",
            unique=True,
            postgresql_where="is_primary = TRUE",
        ),
    )

    id: UUID = Field(
        default_factory=uuid4,
        sa_column=Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4),
    )
    user_id: UUID = Field(
        sa_column=Column(PGUUID(as_uuid=True), nullable=False, index=True)
    )
    version_name: str = Field(max_length=100, nullable=False)
    template_id: UUID | None = Field(
        default=None, sa_column=Column(PGUUID(as_uuid=True), nullable=True)
    )
    is_primary: bool = Field(default=False)
    section_order: dict | None = Field(default=None, sa_column=Column(JSONB))
    content_hash: str | None = Field(default=None, max_length=64)
    file_path: str | None = Field(default=None, max_length=500)
    file_url: str | None = Field(default=None, max_length=500)
    full_name: str | None = Field(default=None, max_length=200)
    email: str | None = Field(default=None, max_length=255)
    phone: str | None = Field(default=None, max_length=30)
    location: str | None = Field(default=None, max_length=255)
    linkedin_url: str | None = Field(default=None, max_length=255)
    github_url: str | None = Field(default=None, max_length=255)
    portfolio_url: str | None = Field(default=None, max_length=255)
    professional_summary: str | None = Field(default=None, sa_column=Column(Text))
    processing_status: str = Field(default="Pending", max_length=20)
    error_message: str | None = Field(default=None, sa_column=Column(Text))
    last_analyzed_at: datetime | None = Field(default=None)
    created_at: datetime = Field(
        default_factory=datetime.utcnow, sa_column_kwargs={"server_default": func.now()}
    )
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column_kwargs={"server_default": func.now(), "onupdate": func.now()},
    )
    deleted_at: datetime | None = Field(default=None)


class ResumeExperience(SQLModel, table=True):
    """Work experience entries for resumes."""

    __tablename__ = "resume_experiences"
    __table_args__ = (Index("idx_exp_resume", "resume_id"),)

    id: UUID = Field(
        default_factory=uuid4,
        sa_column=Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4),
    )
    resume_id: UUID = Field(
        sa_column=Column(PGUUID(as_uuid=True), nullable=False, index=True)
    )
    company_name: str = Field(max_length=200, nullable=False)
    job_title: str = Field(max_length=200, nullable=False)
    location: str | None = Field(default=None, max_length=255)
    start_date: date = Field(nullable=False)
    end_date: date | None = Field(default=None)
    is_current: bool = Field(default=False)
    description: str | None = Field(default=None, sa_column=Column(Text))
    achievements: list[str] = Field(
        default_factory=list, sa_column=Column(ARRAY(String), server_default="{}")
    )
    skills_used: list[str] = Field(
        default_factory=list, sa_column=Column(ARRAY(String), server_default="{}")
    )
    display_order: int = Field(default=0, nullable=False)
    created_at: datetime = Field(
        default_factory=datetime.utcnow, sa_column_kwargs={"server_default": func.now()}
    )
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column_kwargs={"server_default": func.now(), "onupdate": func.now()},
    )


class ResumeEducation(SQLModel, table=True):
    """Education entries for resumes."""

    __tablename__ = "resume_education"
    __table_args__ = (Index("idx_edu_resume", "resume_id"),)

    id: UUID = Field(
        default_factory=uuid4,
        sa_column=Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4),
    )
    resume_id: UUID = Field(
        sa_column=Column(PGUUID(as_uuid=True), nullable=False, index=True)
    )
    institution_name: str = Field(max_length=200, nullable=False)
    degree_type: str | None = Field(default=None, max_length=100)
    field_of_study: str | None = Field(default=None, max_length=200)
    location: str | None = Field(default=None, max_length=255)
    start_date: date | None = Field(default=None)
    end_date: date | None = Field(default=None)
    is_current: bool = Field(default=False)
    gpa: Decimal | None = Field(default=None, max_digits=3, decimal_places=2)
    achievements: list[str] = Field(
        default_factory=list, sa_column=Column(ARRAY(String), server_default="{}")
    )
    relevant_coursework: list[str] = Field(
        default_factory=list, sa_column=Column(ARRAY(String), server_default="{}")
    )
    display_order: int = Field(default=0, nullable=False)
    created_at: datetime = Field(
        default_factory=datetime.utcnow, sa_column_kwargs={"server_default": func.now()}
    )
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column_kwargs={"server_default": func.now(), "onupdate": func.now()},
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
        sa_column=Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4),
    )
    resume_id: UUID = Field(
        sa_column=Column(PGUUID(as_uuid=True), nullable=False, index=True)
    )
    skill_name: str = Field(max_length=100, nullable=False)
    skill_category: str | None = Field(default=None, max_length=50)
    proficiency_level: str | None = Field(default=None, max_length=20)
    years_of_experience: Decimal | None = Field(
        default=None, max_digits=4, decimal_places=1
    )
    is_primary: bool = Field(default=False)
    display_order: int = Field(default=0, nullable=False)
    created_at: datetime = Field(
        default_factory=datetime.utcnow, sa_column_kwargs={"server_default": func.now()}
    )


class ResumeCertification(SQLModel, table=True):
    """Certifications for resumes."""

    __tablename__ = "resume_certifications"
    __table_args__ = (Index("idx_cert_resume", "resume_id"),)

    id: UUID = Field(
        default_factory=uuid4,
        sa_column=Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4),
    )
    resume_id: UUID = Field(
        sa_column=Column(PGUUID(as_uuid=True), nullable=False, index=True)
    )
    certification_name: str = Field(max_length=200, nullable=False)
    issuing_organization: str | None = Field(default=None, max_length=200)
    issue_date: date | None = Field(default=None)
    expiry_date: date | None = Field(default=None)
    credential_id: str | None = Field(default=None, max_length=100)
    credential_url: str | None = Field(default=None, max_length=500)
    display_order: int = Field(default=0, nullable=False)
    created_at: datetime = Field(
        default_factory=datetime.utcnow, sa_column_kwargs={"server_default": func.now()}
    )


class ResumeProject(SQLModel, table=True):
    """Projects for resumes."""

    __tablename__ = "resume_projects"
    __table_args__ = (Index("idx_proj_resume", "resume_id"),)

    id: UUID = Field(
        default_factory=uuid4,
        sa_column=Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4),
    )
    resume_id: UUID = Field(
        sa_column=Column(PGUUID(as_uuid=True), nullable=False, index=True)
    )
    project_name: str = Field(max_length=200, nullable=False)
    role: str | None = Field(default=None, max_length=100)
    description: str | None = Field(default=None, sa_column=Column(Text))
    technologies_used: list[str] = Field(
        default_factory=list, sa_column=Column(ARRAY(String), server_default="{}")
    )
    project_url: str | None = Field(default=None, max_length=500)
    start_date: date | None = Field(default=None)
    end_date: date | None = Field(default=None)
    is_current: bool = Field(default=False)
    achievements: list[str] = Field(
        default_factory=list, sa_column=Column(ARRAY(String), server_default="{}")
    )
    display_order: int = Field(default=0, nullable=False)
    created_at: datetime = Field(
        default_factory=datetime.utcnow, sa_column_kwargs={"server_default": func.now()}
    )
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column_kwargs={"server_default": func.now(), "onupdate": func.now()},
    )


class ResumeCustomSection(SQLModel, table=True):
    """Custom sections for resumes."""

    __tablename__ = "resume_custom_sections"
    __table_args__ = (Index("idx_custom_resume", "resume_id"),)

    id: UUID = Field(
        default_factory=uuid4,
        sa_column=Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4),
    )
    resume_id: UUID = Field(
        sa_column=Column(PGUUID(as_uuid=True), nullable=False, index=True)
    )
    section_title: str = Field(max_length=100, nullable=False)
    section_type: str | None = Field(default=None, max_length=50)
    content: dict = Field(sa_column=Column(JSONB, nullable=False))
    display_order: int = Field(default=0, nullable=False)
    created_at: datetime = Field(
        default_factory=datetime.utcnow, sa_column_kwargs={"server_default": func.now()}
    )
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column_kwargs={"server_default": func.now(), "onupdate": func.now()},
    )

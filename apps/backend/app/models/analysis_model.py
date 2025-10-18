"""
Analysis, suggestions, and job description models for database operations.
"""

from datetime import datetime
from decimal import Decimal
from uuid import UUID, uuid4

from sqlalchemy import (
    ARRAY,
    CheckConstraint,
    Index,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlmodel import Column, Field, SQLModel


class JobDescription(SQLModel, table=True):
    """Job descriptions for analysis."""

    __tablename__ = "job_descriptions"

    id: UUID = Field(
        default_factory=uuid4,
        sa_column=Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4),
    )
    user_id: UUID = Field(
        sa_column=Column(PGUUID(as_uuid=True), nullable=False, index=True)
    )
    job_title: str = Field(max_length=200, nullable=False)
    company_name: str | None = Field(default=None, max_length=200)
    description: str = Field(sa_column=Column(Text, nullable=False))
    snippet: str | None = Field(default=None, max_length=300)
    requirements: str | None = Field(default=None, sa_column=Column(Text))
    extracted_keywords: list[str] = Field(
        default_factory=list, sa_column=Column(ARRAY(String), server_default="{}")
    )
    jd_hash: str | None = Field(default=None, max_length=64)
    created_at: datetime = Field(
        default_factory=datetime.utcnow, sa_column_kwargs={"server_default": func.now()}
    )


class AnalysisResult(SQLModel, table=True):
    """ATS analysis results for resumes."""

    __tablename__ = "analysis_results"
    __table_args__ = (
        CheckConstraint(
            "overall_score >= 0 AND overall_score <= 100", name="chk_overall_score"
        ),
        CheckConstraint(
            "keyword_score >= 0 AND keyword_score <= 100", name="chk_keyword_score"
        ),
        CheckConstraint(
            "formatting_score >= 0 AND formatting_score <= 100",
            name="chk_formatting_score",
        ),
        CheckConstraint(
            "section_score >= 0 AND section_score <= 100", name="chk_section_score"
        ),
        Index("idx_analysis_resume", "resume_id"),
        Index("idx_analysis_jobdesc", "job_description_id"),
        Index("idx_analysis_time", "analyzed_at"),
        UniqueConstraint(
            "resume_id",
            "job_description_id",
            "resume_content_hash",
            "job_description_hash",
            "skills_version",
            "keywords_rules_version",
            "analysis_version",
            name="uniq_analysis_deterministic",
        ),
    )

    id: UUID = Field(
        default_factory=uuid4,
        sa_column=Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4),
    )
    resume_id: UUID = Field(
        sa_column=Column(PGUUID(as_uuid=True), nullable=False, index=True)
    )
    job_description_id: UUID | None = Field(
        default=None, sa_column=Column(PGUUID(as_uuid=True), nullable=True, index=True)
    )
    resume_content_hash: str | None = Field(default=None, max_length=64)
    job_description_hash: str | None = Field(default=None, max_length=64)
    overall_score: int = Field(nullable=False)
    keyword_score: int = Field(nullable=False)
    formatting_score: int = Field(nullable=False)
    section_score: int = Field(nullable=False)
    matched_keywords: list[str] = Field(
        default_factory=list, sa_column=Column(ARRAY(String), server_default="{}")
    )
    missing_keywords: list[str] = Field(
        default_factory=list, sa_column=Column(ARRAY(String), server_default="{}")
    )
    keyword_density: Decimal | None = Field(
        default=None, max_digits=6, decimal_places=3
    )
    has_contact_info: bool = Field(default=False)
    has_summary: bool = Field(default=False)
    has_experience: bool = Field(default=False)
    has_education: bool = Field(default=False)
    has_skills: bool = Field(default=False)
    has_consistent_formatting: bool = Field(default=False)
    has_bullet_points: bool = Field(default=False)
    has_action_verbs: bool = Field(default=False)
    is_scannable: bool = Field(default=False)
    suggestions_payload: dict | None = Field(default=None, sa_column=Column(JSONB))
    skills_version: str | None = Field(default=None, max_length=20)
    keywords_rules_version: str | None = Field(default=None, max_length=20)
    analysis_version: str = Field(default="1.0", max_length=20, nullable=False)
    analyzed_at: datetime = Field(
        default_factory=datetime.utcnow, sa_column_kwargs={"server_default": func.now()}
    )


class Suggestion(SQLModel, table=True):
    """Improvement suggestions from analysis."""

    __tablename__ = "suggestions"
    __table_args__ = (
        CheckConstraint(
            "state IN ('suggested', 'viewed', 'acted_upon', 'dismissed')",
            name="chk_suggestion_state",
        ),
        CheckConstraint(
            "impact_level IN ('high', 'medium', 'low')", name="chk_suggestion_impact"
        ),
        Index("idx_suggestions_analysis", "analysis_id"),
        Index("idx_suggestions_state", "state"),
    )

    id: UUID = Field(
        default_factory=uuid4,
        sa_column=Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4),
    )
    analysis_id: UUID = Field(
        sa_column=Column(PGUUID(as_uuid=True), nullable=False, index=True)
    )
    rule_id: str = Field(max_length=100, nullable=False)
    suggestion_text: str = Field(sa_column=Column(Text, nullable=False))
    impact_level: str = Field(max_length=10, nullable=False)
    state: str = Field(max_length=20, nullable=False, default="suggested")
    rules_version: str = Field(max_length=20, nullable=False)
    context: dict | None = Field(default=None, sa_column=Column(JSONB))
    created_at: datetime = Field(
        default_factory=datetime.utcnow, sa_column_kwargs={"server_default": func.now()}
    )
    resolved_at: datetime | None = Field(default=None)


class SuggestionInteraction(SQLModel, table=True):
    """User interactions with suggestions."""

    __tablename__ = "suggestion_interactions"

    id: UUID = Field(
        default_factory=uuid4,
        sa_column=Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4),
    )
    suggestion_id: UUID = Field(
        sa_column=Column(PGUUID(as_uuid=True), nullable=False, index=True)
    )
    user_id: UUID = Field(
        sa_column=Column(PGUUID(as_uuid=True), nullable=False, index=True)
    )
    action: str = Field(max_length=20, nullable=False)
    details: dict | None = Field(default=None, sa_column=Column(JSONB))
    created_at: datetime = Field(
        default_factory=datetime.utcnow, sa_column_kwargs={"server_default": func.now()}
    )


class SkillCorrection(SQLModel, table=True):
    """User skill corrections for analysis improvement."""

    __tablename__ = "skill_corrections"
    __table_args__ = (Index("idx_skill_corrections_resume", "resume_id"),)

    id: UUID = Field(
        default_factory=uuid4,
        sa_column=Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4),
    )
    user_id: UUID = Field(
        sa_column=Column(PGUUID(as_uuid=True), nullable=False, index=True)
    )
    resume_id: UUID = Field(
        sa_column=Column(PGUUID(as_uuid=True), nullable=False, index=True)
    )
    skill: str = Field(max_length=100, nullable=False)
    action: str = Field(max_length=20, nullable=False)
    source: str = Field(max_length=20, nullable=False, default="user")
    created_at: datetime = Field(
        default_factory=datetime.utcnow, sa_column_kwargs={"server_default": func.now()}
    )


class IndustryKeyword(SQLModel, table=True):
    """Industry-specific keywords for analysis."""

    __tablename__ = "industry_keywords"
    __table_args__ = (
        CheckConstraint(
            "importance_score >= 0 AND importance_score <= 100",
            name="chk_importance_score",
        ),
        UniqueConstraint(
            "industry",
            "keyword",
            "job_category",
            "rules_version",
            name="uq_industry_keyword",
        ),
    )

    id: UUID = Field(
        default_factory=uuid4,
        sa_column=Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4),
    )
    industry: str = Field(max_length=100, nullable=False)
    job_category: str | None = Field(default=None, max_length=100)
    keyword: str = Field(max_length=100, nullable=False)
    keyword_type: str | None = Field(default=None, max_length=50)
    importance_score: int = Field(default=50, nullable=False)
    is_trending: bool = Field(default=False)
    rules_version: str = Field(max_length=20, nullable=False, default="v1")
    created_at: datetime = Field(
        default_factory=datetime.utcnow, sa_column_kwargs={"server_default": func.now()}
    )
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column_kwargs={"server_default": func.now(), "onupdate": func.now()},
    )

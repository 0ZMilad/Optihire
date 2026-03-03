"""
Schemas for ATS analysis, suggestions, and job descriptions.
"""

from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, Field

from app.schemas.common_schema import ImpactLevel, SuggestionState


# ===== AI ENHANCEMENT =====


class BulletRewrite(BaseModel):
    """A before/after rewrite suggestion for a weak resume bullet."""

    original: str = Field(..., description="The original bullet text from the resume.")
    rewritten: str = Field(..., description="The improved bullet using JD context.")
    rationale: str = Field(..., description="Why the rewrite is stronger.")


class KeywordContextTip(BaseModel):
    """Guidance on where and how to naturally insert a missing keyword."""

    keyword: str = Field(..., description="The missing keyword to incorporate.")
    suggested_section: str = Field(..., description="Resume section to place it in (e.g. Experience, Skills).")
    example_usage: str = Field(..., description="Example sentence or bullet showing natural usage.")


class AIEnhancementPayload(BaseModel):
    """Structured output from the LLM career-coach layer."""

    bullet_rewrites: list[BulletRewrite] = Field(default_factory=list)
    keyword_context_tips: list[KeywordContextTip] = Field(default_factory=list)
    role_fit_summary: str = Field(..., description="A 2-3 sentence qualitative analysis of candidate fit.")


# ===== AUDIT REQUEST =====


class AuditRequest(BaseModel):
    """Inbound payload for triggering a resume audit against a job description."""

    resume_id: UUID
    job_description: str = Field(..., min_length=1, description="Full text of the job description to analyse against.")
    job_title: str | None = Field(default=None, max_length=200, description="Optional job title for context.")


# ===== JOB DESCRIPTIONS =====


class JobDescriptionCreate(BaseModel):
    """Create a new job description."""

    user_id: UUID
    job_title: str = Field(..., max_length=200)
    company_name: str | None = Field(None, max_length=200)
    description: str
    snippet: str | None = Field(None, max_length=300)
    requirements: str | None = None


class JobDescriptionRead(BaseModel):
    """Read job description data."""

    id: UUID
    user_id: UUID
    job_title: str
    company_name: str | None
    description: str
    snippet: str | None
    requirements: str | None
    extracted_keywords: list[str]
    jd_hash: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


# ===== ANALYSIS RESULTS =====


class AnalysisResultCreate(BaseModel):
    """Create a new analysis result."""

    resume_id: UUID
    job_description_id: UUID | None = None
    resume_content_hash: str | None = Field(None, max_length=64)
    job_description_hash: str | None = Field(None, max_length=64)
    overall_score: int = Field(..., ge=0, le=100)
    keyword_score: int = Field(..., ge=0, le=100)
    formatting_score: int = Field(..., ge=0, le=100)
    section_score: int = Field(..., ge=0, le=100)
    matched_keywords: list[str] = Field(default_factory=list)
    missing_keywords: list[str] = Field(default_factory=list)
    keyword_density: Decimal | None = None
    has_contact_info: bool = False
    has_summary: bool = False
    has_experience: bool = False
    has_education: bool = False
    has_skills: bool = False
    has_consistent_formatting: bool = False
    has_bullet_points: bool = False
    has_action_verbs: bool = False
    is_scannable: bool = False
    suggestions_payload: dict | None = None
    ai_enhancement: dict | None = None
    skills_version: str | None = Field(None, max_length=20)
    keywords_rules_version: str | None = Field(None, max_length=20)
    analysis_version: str = Field(default="3.0", max_length=20)


class AnalysisResultRead(BaseModel):
    """Read analysis result data."""

    id: UUID
    resume_id: UUID
    job_description_id: UUID | None
    resume_content_hash: str | None
    job_description_hash: str | None
    overall_score: int
    keyword_score: int
    formatting_score: int
    section_score: int
    matched_keywords: list[str]
    missing_keywords: list[str]
    keyword_density: Decimal | None
    has_contact_info: bool
    has_summary: bool
    has_experience: bool
    has_education: bool
    has_skills: bool
    has_consistent_formatting: bool
    has_bullet_points: bool
    has_action_verbs: bool
    is_scannable: bool
    suggestions_payload: dict | None
    ai_enhancement: AIEnhancementPayload | None = None
    skills_version: str | None
    keywords_rules_version: str | None
    analysis_version: str
    analyzed_at: datetime

    model_config = {"from_attributes": True}


# ===== SUGGESTIONS =====


class SuggestionCreate(BaseModel):
    """Create a new suggestion."""

    analysis_id: UUID
    rule_id: str = Field(..., max_length=100)
    suggestion_text: str
    impact_level: ImpactLevel
    rules_version: str = Field(..., max_length=20)
    context: dict | None = None


class SuggestionUpdate(BaseModel):
    """Update a suggestion."""

    state: SuggestionState | None = None
    resolved_at: datetime | None = None


class SuggestionRead(BaseModel):
    """Read suggestion data."""

    id: UUID
    analysis_id: UUID
    rule_id: str
    suggestion_text: str
    impact_level: ImpactLevel
    state: SuggestionState
    rules_version: str
    context: dict | None
    created_at: datetime
    resolved_at: datetime | None

    model_config = {"from_attributes": True}


# ===== SUGGESTION INTERACTIONS =====


class SuggestionInteractionCreate(BaseModel):
    """Create a new suggestion interaction."""

    suggestion_id: UUID
    user_id: UUID
    action: str = Field(..., max_length=20)
    details: dict | None = None


class SuggestionInteractionRead(BaseModel):
    """Read suggestion interaction data."""

    id: UUID
    suggestion_id: UUID
    user_id: UUID
    action: str
    details: dict | None
    created_at: datetime

    model_config = {"from_attributes": True}


# ===== SKILL CORRECTIONS =====


class SkillCorrectionCreate(BaseModel):
    """Create a new skill correction."""

    user_id: UUID
    resume_id: UUID
    skill: str = Field(..., max_length=100)
    action: str = Field(..., max_length=20)
    source: str = Field(default="user", max_length=20)


class SkillCorrectionRead(BaseModel):
    """Read skill correction data."""

    id: UUID
    user_id: UUID
    resume_id: UUID
    skill: str
    action: str
    source: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ===== INDUSTRY KEYWORDS =====


class IndustryKeywordCreate(BaseModel):
    """Create a new industry keyword."""

    industry: str = Field(..., max_length=100)
    job_category: str | None = Field(None, max_length=100)
    keyword: str = Field(..., max_length=100)
    keyword_type: str | None = Field(None, max_length=50)
    importance_score: int = Field(default=50, ge=0, le=100)
    is_trending: bool = False
    rules_version: str = Field(default="v1", max_length=20)


class IndustryKeywordUpdate(BaseModel):
    """Update an industry keyword."""

    importance_score: int | None = Field(None, ge=0, le=100)
    is_trending: bool | None = None


class IndustryKeywordRead(BaseModel):
    """Read industry keyword data."""

    id: UUID
    industry: str
    job_category: str | None
    keyword: str
    keyword_type: str | None
    importance_score: int
    is_trending: bool
    rules_version: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

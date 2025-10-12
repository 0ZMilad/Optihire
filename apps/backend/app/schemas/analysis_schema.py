"""
Schemas for ATS analysis, suggestions, and job descriptions.
"""
from uuid import UUID
from datetime import datetime
from typing import Optional, List
from decimal import Decimal
from pydantic import BaseModel, Field

from app.schemas.common_schema import ImpactLevel, SuggestionState


# ===== JOB DESCRIPTIONS =====

class JobDescriptionCreate(BaseModel):
    """Create a new job description."""
    user_id: UUID
    job_title: str = Field(..., max_length=200)
    company_name: Optional[str] = Field(None, max_length=200)
    description: str
    snippet: Optional[str] = Field(None, max_length=300)
    requirements: Optional[str] = None


class JobDescriptionRead(BaseModel):
    """Read job description data."""
    id: UUID
    user_id: UUID
    job_title: str
    company_name: Optional[str]
    description: str
    snippet: Optional[str]
    requirements: Optional[str]
    extracted_keywords: List[str]
    jd_hash: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


# ===== ANALYSIS RESULTS =====

class AnalysisResultCreate(BaseModel):
    """Create a new analysis result."""
    resume_id: UUID
    job_description_id: Optional[UUID] = None
    resume_content_hash: Optional[str] = Field(None, max_length=64)
    job_description_hash: Optional[str] = Field(None, max_length=64)
    overall_score: int = Field(..., ge=0, le=100)
    keyword_score: int = Field(..., ge=0, le=100)
    formatting_score: int = Field(..., ge=0, le=100)
    section_score: int = Field(..., ge=0, le=100)
    matched_keywords: List[str] = Field(default_factory=list)
    missing_keywords: List[str] = Field(default_factory=list)
    keyword_density: Optional[Decimal] = None
    has_contact_info: bool = False
    has_summary: bool = False
    has_experience: bool = False
    has_education: bool = False
    has_skills: bool = False
    has_consistent_formatting: bool = False
    has_bullet_points: bool = False
    has_action_verbs: bool = False
    is_scannable: bool = False
    suggestions_payload: Optional[dict] = None
    skills_version: Optional[str] = Field(None, max_length=20)
    keywords_rules_version: Optional[str] = Field(None, max_length=20)
    analysis_version: str = Field(default="1.0", max_length=20)


class AnalysisResultRead(BaseModel):
    """Read analysis result data."""
    id: UUID
    resume_id: UUID
    job_description_id: Optional[UUID]
    resume_content_hash: Optional[str]
    job_description_hash: Optional[str]
    overall_score: int
    keyword_score: int
    formatting_score: int
    section_score: int
    matched_keywords: List[str]
    missing_keywords: List[str]
    keyword_density: Optional[Decimal]
    has_contact_info: bool
    has_summary: bool
    has_experience: bool
    has_education: bool
    has_skills: bool
    has_consistent_formatting: bool
    has_bullet_points: bool
    has_action_verbs: bool
    is_scannable: bool
    suggestions_payload: Optional[dict]
    skills_version: Optional[str]
    keywords_rules_version: Optional[str]
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
    context: Optional[dict] = None


class SuggestionUpdate(BaseModel):
    """Update a suggestion."""
    state: Optional[SuggestionState] = None
    resolved_at: Optional[datetime] = None


class SuggestionRead(BaseModel):
    """Read suggestion data."""
    id: UUID
    analysis_id: UUID
    rule_id: str
    suggestion_text: str
    impact_level: ImpactLevel
    state: SuggestionState
    rules_version: str
    context: Optional[dict]
    created_at: datetime
    resolved_at: Optional[datetime]

    model_config = {"from_attributes": True}


# ===== SUGGESTION INTERACTIONS =====

class SuggestionInteractionCreate(BaseModel):
    """Create a new suggestion interaction."""
    suggestion_id: UUID
    user_id: UUID
    action: str = Field(..., max_length=20)
    details: Optional[dict] = None


class SuggestionInteractionRead(BaseModel):
    """Read suggestion interaction data."""
    id: UUID
    suggestion_id: UUID
    user_id: UUID
    action: str
    details: Optional[dict]
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
    job_category: Optional[str] = Field(None, max_length=100)
    keyword: str = Field(..., max_length=100)
    keyword_type: Optional[str] = Field(None, max_length=50)
    importance_score: int = Field(default=50, ge=0, le=100)
    is_trending: bool = False
    rules_version: str = Field(default="v1", max_length=20)


class IndustryKeywordUpdate(BaseModel):
    """Update an industry keyword."""
    importance_score: Optional[int] = Field(None, ge=0, le=100)
    is_trending: Optional[bool] = None


class IndustryKeywordRead(BaseModel):
    """Read industry keyword data."""
    id: UUID
    industry: str
    job_category: Optional[str]
    keyword: str
    keyword_type: Optional[str]
    importance_score: int
    is_trending: bool
    rules_version: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

"""
Schema exports for the Optihire application.
"""

# Analysis schemas
from app.schemas.analysis_schema import (
    AnalysisResultCreate,
    AnalysisResultRead,
    IndustryKeywordCreate,
    IndustryKeywordRead,
    IndustryKeywordUpdate,
    JobDescriptionCreate,
    JobDescriptionRead,
    SkillCorrectionCreate,
    SkillCorrectionRead,
    SuggestionCreate,
    SuggestionInteractionCreate,
    SuggestionInteractionRead,
    SuggestionRead,
    SuggestionUpdate,
)

# Common enums
from app.schemas.common_schema import (
    ActivityType,
    ApplicationStatus,
    ExperienceLevel,
    FeedbackType,
    IdempotencyStatus,
    ImpactLevel,
    JobType,
    ParseStatus,
    ProjectStatus,
    RemoteType,
    StorageBackend,
    SuggestionState,
)

# Resume schemas
from app.schemas.resume_schema import (
    CertificationCreate,
    CertificationRead,
    CertificationUpdate,
    CustomSectionCreate,
    CustomSectionRead,
    CustomSectionUpdate,
    EducationCreate,
    EducationRead,
    EducationUpdate,
    ExperienceCreate,
    ExperienceRead,
    ExperienceUpdate,
    ProjectCreate,
    ProjectRead,
    ProjectUpdate,
    ResumeComplete,
    ResumeCreate,
    ResumeRead,
    ResumeTemplateRead,
    ResumeUpdate,
    SkillCreate,
    SkillRead,
    SkillUpdate,
)

# User schemas
from app.schemas.user_schema import (
    OnboardingProgressCreate,
    OnboardingProgressRead,
    UserCreate,
    UserRead,
    UserUpdate,
)

__all__ = [
    # Common enums
    "StorageBackend",
    "ParseStatus",
    "ImpactLevel",
    "SuggestionState",
    "ApplicationStatus",
    "ActivityType",
    "RemoteType",
    "ExperienceLevel",
    "JobType",
    "FeedbackType",
    "ProjectStatus",
    "IdempotencyStatus",
    # User
    "UserCreate",
    "UserUpdate",
    "UserRead",
    "OnboardingProgressCreate",
    "OnboardingProgressRead",
    # Resume
    "ResumeTemplateRead",
    "ResumeCreate",
    "ResumeUpdate",
    "ResumeRead",
    "ResumeComplete",
    "ExperienceCreate",
    "ExperienceUpdate",
    "ExperienceRead",
    "EducationCreate",
    "EducationUpdate",
    "EducationRead",
    "SkillCreate",
    "SkillUpdate",
    "SkillRead",
    "CertificationCreate",
    "CertificationUpdate",
    "CertificationRead",
    "ProjectCreate",
    "ProjectUpdate",
    "ProjectRead",
    "CustomSectionCreate",
    "CustomSectionUpdate",
    "CustomSectionRead",
    # Analysis
    "JobDescriptionCreate",
    "JobDescriptionRead",
    "AnalysisResultCreate",
    "AnalysisResultRead",
    "SuggestionCreate",
    "SuggestionUpdate",
    "SuggestionRead",
    "SuggestionInteractionCreate",
    "SuggestionInteractionRead",
    "SkillCorrectionCreate",
    "SkillCorrectionRead",
    "IndustryKeywordCreate",
    "IndustryKeywordUpdate",
    "IndustryKeywordRead",
]


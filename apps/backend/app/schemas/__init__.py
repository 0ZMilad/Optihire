"""
Schema exports for the Optihire application.
"""

# Common enums
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

# Application schemas
from app.schemas.application_schema import (
    ApplicationActivityCreate,
    ApplicationActivityRead,
    ApplicationContactCreate,
    ApplicationContactRead,
    ApplicationContactUpdate,
    JobApplicationCreate,
    JobApplicationRead,
    JobApplicationUpdate,
)
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

# Content schemas
from app.schemas.content_schema import (
    CoverLetterCreate,
    CoverLetterRead,
    CoverLetterUpdate,
    InterviewQuestionCreate,
    InterviewQuestionRead,
    SuggestedProjectCreate,
    SuggestedProjectRead,
    SuggestedProjectUpdate,
    UserSuggestedProjectCreate,
    UserSuggestedProjectRead,
    UserSuggestedProjectUpdate,
)

# File schemas
from app.schemas.file_schema import (
    ParseTaskCreate,
    ParseTaskRead,
    ParseTaskUpdate,
    UploadedFileCreate,
    UploadedFileRead,
    UploadedFileUpdate,
)

# Job schemas
from app.schemas.job_schema import (
    JobListingCreate,
    JobListingRead,
    JobListingUpdate,
    JobMatchCreate,
    JobMatchRead,
    JobMatchUpdate,
    UserJobFeedbackCreate,
    UserJobFeedbackRead,
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

# System schemas
from app.schemas.system_schema import (
    AuditLogCreate,
    AuditLogRead,
    FeatureFlagCreate,
    FeatureFlagRead,
    FeatureFlagUpdate,
    IdempotencyKeyCreate,
    IdempotencyKeyRead,
    IdempotencyKeyUpdate,
    SystemConfigCreate,
    SystemConfigRead,
    SystemConfigUpdate,
    SystemHealthCheckCreate,
    SystemHealthCheckRead,
    TelemetryEventCreate,
    TelemetryEventRead,
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
    # File
    "UploadedFileCreate",
    "UploadedFileUpdate",
    "UploadedFileRead",
    "ParseTaskCreate",
    "ParseTaskUpdate",
    "ParseTaskRead",
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
    # Job
    "JobListingCreate",
    "JobListingUpdate",
    "JobListingRead",
    "JobMatchCreate",
    "JobMatchUpdate",
    "JobMatchRead",
    "UserJobFeedbackCreate",
    "UserJobFeedbackRead",
    # Application
    "JobApplicationCreate",
    "JobApplicationUpdate",
    "JobApplicationRead",
    "ApplicationContactCreate",
    "ApplicationContactUpdate",
    "ApplicationContactRead",
    "ApplicationActivityCreate",
    "ApplicationActivityRead",
    # Content
    "CoverLetterCreate",
    "CoverLetterUpdate",
    "CoverLetterRead",
    "InterviewQuestionCreate",
    "InterviewQuestionRead",
    "SuggestedProjectCreate",
    "SuggestedProjectUpdate",
    "SuggestedProjectRead",
    "UserSuggestedProjectCreate",
    "UserSuggestedProjectUpdate",
    "UserSuggestedProjectRead",
    # System
    "SystemConfigCreate",
    "SystemConfigUpdate",
    "SystemConfigRead",
    "FeatureFlagCreate",
    "FeatureFlagUpdate",
    "FeatureFlagRead",
    "IdempotencyKeyCreate",
    "IdempotencyKeyUpdate",
    "IdempotencyKeyRead",
    "AuditLogCreate",
    "AuditLogRead",
    "SystemHealthCheckCreate",
    "SystemHealthCheckRead",
    "TelemetryEventCreate",
    "TelemetryEventRead",
]

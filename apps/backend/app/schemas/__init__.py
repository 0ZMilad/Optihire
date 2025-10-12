"""
Schema exports for the OptiHire application.
"""

# Common enums
from app.schemas.common_schema import (
    StorageBackend,
    ParseStatus,
    ImpactLevel,
    SuggestionState,
    ApplicationStatus,
    ActivityType,
    RemoteType,
    ExperienceLevel,
    JobType,
    FeedbackType,
    ProjectStatus,
    IdempotencyStatus,
)

# User schemas
from app.schemas.user_schema import (
    UserCreate,
    UserUpdate,
    UserRead,
    OnboardingProgressCreate,
    OnboardingProgressRead,
)

# File schemas
from app.schemas.file_schema import (
    UploadedFileCreate,
    UploadedFileUpdate,
    UploadedFileRead,
    ParseTaskCreate,
    ParseTaskUpdate,
    ParseTaskRead,
)

# Resume schemas
from app.schemas.resume_schema import (
    ResumeTemplateRead,
    ResumeCreate,
    ResumeUpdate,
    ResumeRead,
    ResumeComplete,
    ExperienceCreate,
    ExperienceUpdate,
    ExperienceRead,
    EducationCreate,
    EducationUpdate,
    EducationRead,
    SkillCreate,
    SkillUpdate,
    SkillRead,
    CertificationCreate,
    CertificationUpdate,
    CertificationRead,
    ProjectCreate,
    ProjectUpdate,
    ProjectRead,
    CustomSectionCreate,
    CustomSectionUpdate,
    CustomSectionRead,
)

# Analysis schemas
from app.schemas.analysis_schema import (
    JobDescriptionCreate,
    JobDescriptionRead,
    AnalysisResultCreate,
    AnalysisResultRead,
    SuggestionCreate,
    SuggestionUpdate,
    SuggestionRead,
    SuggestionInteractionCreate,
    SuggestionInteractionRead,
    SkillCorrectionCreate,
    SkillCorrectionRead,
    IndustryKeywordCreate,
    IndustryKeywordUpdate,
    IndustryKeywordRead,
)

# Job schemas
from app.schemas.job_schema import (
    JobListingCreate,
    JobListingUpdate,
    JobListingRead,
    JobMatchCreate,
    JobMatchUpdate,
    JobMatchRead,
    UserJobFeedbackCreate,
    UserJobFeedbackRead,
)

# Application schemas
from app.schemas.application_schema import (
    JobApplicationCreate,
    JobApplicationUpdate,
    JobApplicationRead,
    ApplicationContactCreate,
    ApplicationContactUpdate,
    ApplicationContactRead,
    ApplicationActivityCreate,
    ApplicationActivityRead,
)

# Content schemas
from app.schemas.content_schema import (
    CoverLetterCreate,
    CoverLetterUpdate,
    CoverLetterRead,
    InterviewQuestionCreate,
    InterviewQuestionRead,
    SuggestedProjectCreate,
    SuggestedProjectUpdate,
    SuggestedProjectRead,
    UserSuggestedProjectCreate,
    UserSuggestedProjectUpdate,
    UserSuggestedProjectRead,
)

# System schemas
from app.schemas.system_schema import (
    SystemConfigCreate,
    SystemConfigUpdate,
    SystemConfigRead,
    FeatureFlagCreate,
    FeatureFlagUpdate,
    FeatureFlagRead,
    IdempotencyKeyCreate,
    IdempotencyKeyUpdate,
    IdempotencyKeyRead,
    AuditLogCreate,
    AuditLogRead,
    SystemHealthCheckCreate,
    SystemHealthCheckRead,
    TelemetryEventCreate,
    TelemetryEventRead,
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

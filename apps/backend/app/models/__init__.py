"""
Database models for the OptiHire application.
"""

# User models
# Analysis models
from app.models.analysis_model import (
    AnalysisResult,
    IndustryKeyword,
    JobDescription,
    SkillCorrection,
    Suggestion,
    SuggestionInteraction,
)

# File models
from app.models.file_model import ParseTask, UploadedFile

# Resume models
from app.models.resume_model import (
    Resume,
    ResumeCertification,
    ResumeCustomSection,
    ResumeEducation,
    ResumeExperience,
    ResumeProject,
    ResumeSkill,
    ResumeTemplate,
)
from app.models.user_model import User, UserOnboardingProgress

__all__ = [
    # User
    "User",
    "UserOnboardingProgress",
    # File
    "UploadedFile",
    "ParseTask",
    # Resume
    "ResumeTemplate",
    "Resume",
    "ResumeExperience",
    "ResumeEducation",
    "ResumeSkill",
    "ResumeCertification",
    "ResumeProject",
    "ResumeCustomSection",
    # Analysis
    "JobDescription",
    "AnalysisResult",
    "Suggestion",
    "SuggestionInteraction",
    "SkillCorrection",
    "IndustryKeyword",
]

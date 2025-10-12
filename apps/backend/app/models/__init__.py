"""
Database models for the OptiHire application.
"""

# User models
from app.models.user_model import User, UserOnboardingProgress

# File models
from app.models.file_model import UploadedFile, ParseTask

# Resume models
from app.models.resume_model import (
    ResumeTemplate,
    Resume,
    ResumeExperience,
    ResumeEducation,
    ResumeSkill,
    ResumeCertification,
    ResumeProject,
    ResumeCustomSection,
)

# Analysis models
from app.models.analysis_model import (
    JobDescription,
    AnalysisResult,
    Suggestion,
    SuggestionInteraction,
    SkillCorrection,
    IndustryKeyword,
)

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

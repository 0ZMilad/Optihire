"""
Common schemas and enums shared across the application.
"""

from enum import Enum


class StorageBackend(str, Enum):
    """Storage backend options for file uploads."""

    LOCAL = "local"
    S3 = "s3"
    AZURE = "azure"


class ParseStatus(str, Enum):
    """Status of file parsing tasks."""

    QUEUED = "queued"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class ImpactLevel(str, Enum):
    """Impact level for suggestions."""

    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class SuggestionState(str, Enum):
    """State of a suggestion."""

    SUGGESTED = "suggested"
    VIEWED = "viewed"
    ACTED_UPON = "acted_upon"
    DISMISSED = "dismissed"


class ApplicationStatus(str, Enum):
    """Status of job applications."""

    PLANNED = "planned"
    APPLIED = "applied"
    PHONE_SCREEN = "phone_screen"
    INTERVIEW = "interview"
    OFFER = "offer"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    WITHDRAWN = "withdrawn"


class ActivityType(str, Enum):
    """Type of application activity."""

    NOTE = "note"
    STATUS_CHANGE = "status_change"
    EMAIL = "email"
    CALL = "call"
    INTERVIEW = "interview"


class RemoteType(str, Enum):
    """Remote work options."""

    ONSITE = "onsite"
    REMOTE = "remote"
    HYBRID = "hybrid"


class ExperienceLevel(str, Enum):
    """Job experience levels."""

    ENTRY = "entry"
    JUNIOR = "junior"
    MID = "mid"
    SENIOR = "senior"
    LEAD = "lead"
    PRINCIPAL = "principal"


class JobType(str, Enum):
    """Job type options."""

    FULL_TIME = "full_time"
    PART_TIME = "part_time"
    CONTRACT = "contract"
    INTERNSHIP = "internship"
    FREELANCE = "freelance"


class FeedbackType(str, Enum):
    """User feedback type for jobs."""

    INTERESTED = "interested"
    NOT_INTERESTED = "not_interested"
    APPLIED = "applied"
    SAVED = "saved"


class ProjectStatus(str, Enum):
    """Status of suggested projects."""

    SUGGESTED = "suggested"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    ABANDONED = "abandoned"


class IdempotencyStatus(str, Enum):
    """Status of idempotency keys."""

    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

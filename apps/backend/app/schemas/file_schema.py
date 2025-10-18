"""
Schemas for file uploads and parsing tasks.
"""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field

from app.schemas.common_schema import ParseStatus, StorageBackend

# ===== UPLOADED FILES =====


class UploadedFileCreate(BaseModel):
    """Create a new uploaded file record."""

    user_id: UUID
    object_key: str = Field(..., max_length=500, description="S3/Azure object key")
    storage_backend: StorageBackend = StorageBackend.AZURE
    file_name: str = Field(..., max_length=255)
    mime_type: str = Field(..., max_length=100)
    file_size_bytes: int = Field(..., gt=0)
    checksum_sha256: str | None = Field(None, max_length=64)


class UploadedFileUpdate(BaseModel):
    """Update an uploaded file record."""

    finalized_at: datetime | None = None
    extracted_text: str | None = None
    presigned_expires_at: datetime | None = None


class UploadedFileRead(BaseModel):
    """Read uploaded file data."""

    id: UUID
    user_id: UUID
    object_key: str
    storage_backend: str
    file_name: str
    mime_type: str
    file_size_bytes: int
    checksum_sha256: str | None
    presigned_expires_at: datetime | None
    finalized_at: datetime | None
    ttl_expires_at: datetime | None
    extracted_text: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ===== PARSE TASKS =====


class ParseTaskCreate(BaseModel):
    """Create a new parse task."""

    user_id: UUID
    file_id: UUID | None = None
    status: ParseStatus = ParseStatus.QUEUED


class ParseTaskUpdate(BaseModel):
    """Update a parse task."""

    status: ParseStatus | None = None
    error_class: str | None = Field(None, max_length=100)
    error_message: str | None = None
    started_at: datetime | None = None
    completed_at: datetime | None = None


class ParseTaskRead(BaseModel):
    """Read parse task data."""

    id: UUID
    user_id: UUID
    file_id: UUID | None
    status: ParseStatus
    error_class: str | None
    error_message: str | None
    started_at: datetime | None
    completed_at: datetime | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

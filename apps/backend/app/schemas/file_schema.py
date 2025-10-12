"""
Schemas for file uploads and parsing tasks.
"""
from uuid import UUID
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

from app.schemas.common_schema import StorageBackend, ParseStatus


# ===== UPLOADED FILES =====

class UploadedFileCreate(BaseModel):
    """Create a new uploaded file record."""
    user_id: UUID
    object_key: str = Field(..., max_length=500, description="S3/Azure object key")
    storage_backend: StorageBackend = StorageBackend.AZURE
    file_name: str = Field(..., max_length=255)
    mime_type: str = Field(..., max_length=100)
    file_size_bytes: int = Field(..., gt=0)
    checksum_sha256: Optional[str] = Field(None, max_length=64)


class UploadedFileUpdate(BaseModel):
    """Update an uploaded file record."""
    finalized_at: Optional[datetime] = None
    extracted_text: Optional[str] = None
    presigned_expires_at: Optional[datetime] = None


class UploadedFileRead(BaseModel):
    """Read uploaded file data."""
    id: UUID
    user_id: UUID
    object_key: str
    storage_backend: str
    file_name: str
    mime_type: str
    file_size_bytes: int
    checksum_sha256: Optional[str]
    presigned_expires_at: Optional[datetime]
    finalized_at: Optional[datetime]
    ttl_expires_at: Optional[datetime]
    extracted_text: Optional[str]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ===== PARSE TASKS =====

class ParseTaskCreate(BaseModel):
    """Create a new parse task."""
    user_id: UUID
    file_id: Optional[UUID] = None
    status: ParseStatus = ParseStatus.QUEUED


class ParseTaskUpdate(BaseModel):
    """Update a parse task."""
    status: Optional[ParseStatus] = None
    error_class: Optional[str] = Field(None, max_length=100)
    error_message: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None


class ParseTaskRead(BaseModel):
    """Read parse task data."""
    id: UUID
    user_id: UUID
    file_id: Optional[UUID]
    status: ParseStatus
    error_class: Optional[str]
    error_message: Optional[str]
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

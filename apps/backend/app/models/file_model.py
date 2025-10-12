"""
File upload and parsing models for database operations.
"""
from typing import Optional
from uuid import UUID, uuid4
from datetime import datetime
from sqlmodel import SQLModel, Field, Column
from sqlalchemy import func, Text
from sqlalchemy.dialects.postgresql import UUID as PGUUID


class UploadedFile(SQLModel, table=True):
    """Uploaded files table for S3/Azure storage tracking."""
    __tablename__ = "uploaded_files"
    
    id: UUID = Field(
        default_factory=uuid4,

        sa_column=Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    )
    user_id: UUID = Field(
        sa_column=Column(PGUUID(as_uuid=True), nullable=False, index=True)
    )
    object_key: str = Field(max_length=500, nullable=False)
    storage_backend: str = Field(max_length=20, nullable=False, default="azure")
    file_name: str = Field(max_length=255, nullable=False)
    mime_type: str = Field(max_length=100, nullable=False)
    file_size_bytes: int = Field(nullable=False)
    checksum_sha256: Optional[str] = Field(default=None, max_length=64)
    presigned_expires_at: Optional[datetime] = Field(default=None)
    finalized_at: Optional[datetime] = Field(default=None)
    ttl_expires_at: Optional[datetime] = Field(default=None)
    extracted_text: Optional[str] = Field(default=None, sa_column=Column(Text))
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column_kwargs={"server_default": func.now()}
    )
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column_kwargs={"server_default": func.now(), "onupdate": func.now()}
    )


class ParseTask(SQLModel, table=True):
    """Parse tasks for processing uploaded files."""
    __tablename__ = "parse_tasks"
    
    id: UUID = Field(
        default_factory=uuid4,

        sa_column=Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    )
    user_id: UUID = Field(
        sa_column=Column(PGUUID(as_uuid=True), nullable=False, index=True)
    )
    file_id: Optional[UUID] = Field(
        default=None,
        sa_column=Column(PGUUID(as_uuid=True), nullable=True, index=True)
    )
    status: str = Field(max_length=20, nullable=False, default="queued", index=True)
    error_class: Optional[str] = Field(default=None, max_length=100)
    error_message: Optional[str] = Field(default=None, sa_column=Column(Text))
    started_at: Optional[datetime] = Field(default=None)
    completed_at: Optional[datetime] = Field(default=None)
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column_kwargs={"server_default": func.now()}
    )
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column_kwargs={"server_default": func.now(), "onupdate": func.now()}
    )

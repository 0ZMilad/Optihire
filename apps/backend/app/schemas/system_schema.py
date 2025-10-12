"""
Schemas for system configuration, feature flags, idempotency, audit logs, and telemetry.
"""
from uuid import UUID
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

from app.schemas.common_schema import IdempotencyStatus


# ===== SYSTEM CONFIG =====

class SystemConfigCreate(BaseModel):
    """Create a new system configuration."""
    config_key: str = Field(..., max_length=100)
    config_value: dict
    description: Optional[str] = None


class SystemConfigUpdate(BaseModel):
    """Update a system configuration."""
    config_value: Optional[dict] = None
    description: Optional[str] = None


class SystemConfigRead(BaseModel):
    """Read system configuration data."""
    id: UUID
    config_key: str
    config_value: dict
    description: Optional[str]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ===== FEATURE FLAGS =====

class FeatureFlagCreate(BaseModel):
    """Create a new feature flag."""
    flag_key: str = Field(..., max_length=100)
    enabled: bool = False
    description: Optional[str] = None


class FeatureFlagUpdate(BaseModel):
    """Update a feature flag."""
    enabled: Optional[bool] = None
    description: Optional[str] = None


class FeatureFlagRead(BaseModel):
    """Read feature flag data."""
    id: UUID
    flag_key: str
    enabled: bool
    description: Optional[str]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ===== IDEMPOTENCY KEYS =====

class IdempotencyKeyCreate(BaseModel):
    """Create a new idempotency key."""
    user_id: UUID
    scope: str = Field(..., max_length=50)
    idempotency_key: str = Field(..., max_length=128)
    request_fingerprint: Optional[str] = Field(None, max_length=200)
    target_table: Optional[str] = Field(None, max_length=100)
    target_id: Optional[UUID] = None
    status: IdempotencyStatus = IdempotencyStatus.PROCESSING


class IdempotencyKeyUpdate(BaseModel):
    """Update an idempotency key."""
    status: Optional[IdempotencyStatus] = None
    target_id: Optional[UUID] = None


class IdempotencyKeyRead(BaseModel):
    """Read idempotency key data."""
    id: UUID
    user_id: UUID
    scope: str
    idempotency_key: str
    request_fingerprint: Optional[str]
    target_table: Optional[str]
    target_id: Optional[UUID]
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ===== AUDIT LOGS =====

class AuditLogCreate(BaseModel):
    """Create a new audit log entry."""
    user_id: Optional[UUID] = None
    action: str = Field(..., max_length=100)
    resource_type: Optional[str] = Field(None, max_length=100)
    resource_id: Optional[UUID] = None
    correlation_id: Optional[UUID] = None
    redacted_details: Optional[dict] = None


class AuditLogRead(BaseModel):
    """Read audit log data."""
    id: UUID
    user_id: Optional[UUID]
    action: str
    resource_type: Optional[str]
    resource_id: Optional[UUID]
    correlation_id: Optional[UUID]
    redacted_details: Optional[dict]
    created_at: datetime

    model_config = {"from_attributes": True}


# ===== SYSTEM HEALTH CHECKS =====

class SystemHealthCheckCreate(BaseModel):
    """Create a new health check record."""
    status: str = Field(..., max_length=50)
    details: Optional[dict] = None


class SystemHealthCheckRead(BaseModel):
    """Read health check data."""
    id: UUID
    status: str
    checked_at: datetime
    details: Optional[dict]

    model_config = {"from_attributes": True}


# ===== TELEMETRY EVENTS =====

class TelemetryEventCreate(BaseModel):
    """Create a new telemetry event."""
    event_name: str = Field(..., max_length=100)
    user_hash: Optional[str] = Field(None, max_length=128)
    payload: Optional[dict] = None


class TelemetryEventRead(BaseModel):
    """Read telemetry event data."""
    id: UUID
    event_name: str
    user_hash: Optional[str]
    payload: Optional[dict]
    created_at: datetime

    model_config = {"from_attributes": True}

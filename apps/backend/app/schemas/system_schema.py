"""
Schemas for system configuration, feature flags, idempotency, audit logs, and telemetry.
"""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field

from app.schemas.common_schema import IdempotencyStatus

# ===== SYSTEM CONFIG =====


class SystemConfigCreate(BaseModel):
    """Create a new system configuration."""

    config_key: str = Field(..., max_length=100)
    config_value: dict
    description: str | None = None


class SystemConfigUpdate(BaseModel):
    """Update a system configuration."""

    config_value: dict | None = None
    description: str | None = None


class SystemConfigRead(BaseModel):
    """Read system configuration data."""

    id: UUID
    config_key: str
    config_value: dict
    description: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ===== FEATURE FLAGS =====


class FeatureFlagCreate(BaseModel):
    """Create a new feature flag."""

    flag_key: str = Field(..., max_length=100)
    enabled: bool = False
    description: str | None = None


class FeatureFlagUpdate(BaseModel):
    """Update a feature flag."""

    enabled: bool | None = None
    description: str | None = None


class FeatureFlagRead(BaseModel):
    """Read feature flag data."""

    id: UUID
    flag_key: str
    enabled: bool
    description: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ===== IDEMPOTENCY KEYS =====


class IdempotencyKeyCreate(BaseModel):
    """Create a new idempotency key."""

    user_id: UUID
    scope: str = Field(..., max_length=50)
    idempotency_key: str = Field(..., max_length=128)
    request_fingerprint: str | None = Field(None, max_length=200)
    target_table: str | None = Field(None, max_length=100)
    target_id: UUID | None = None
    status: IdempotencyStatus = IdempotencyStatus.PROCESSING


class IdempotencyKeyUpdate(BaseModel):
    """Update an idempotency key."""

    status: IdempotencyStatus | None = None
    target_id: UUID | None = None


class IdempotencyKeyRead(BaseModel):
    """Read idempotency key data."""

    id: UUID
    user_id: UUID
    scope: str
    idempotency_key: str
    request_fingerprint: str | None
    target_table: str | None
    target_id: UUID | None
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ===== AUDIT LOGS =====


class AuditLogCreate(BaseModel):
    """Create a new audit log entry."""

    user_id: UUID | None = None
    action: str = Field(..., max_length=100)
    resource_type: str | None = Field(None, max_length=100)
    resource_id: UUID | None = None
    correlation_id: UUID | None = None
    redacted_details: dict | None = None


class AuditLogRead(BaseModel):
    """Read audit log data."""

    id: UUID
    user_id: UUID | None
    action: str
    resource_type: str | None
    resource_id: UUID | None
    correlation_id: UUID | None
    redacted_details: dict | None
    created_at: datetime

    model_config = {"from_attributes": True}


# ===== SYSTEM HEALTH CHECKS =====


class SystemHealthCheckCreate(BaseModel):
    """Create a new health check record."""

    status: str = Field(..., max_length=50)
    details: dict | None = None


class SystemHealthCheckRead(BaseModel):
    """Read health check data."""

    id: UUID
    status: str
    checked_at: datetime
    details: dict | None

    model_config = {"from_attributes": True}


# ===== TELEMETRY EVENTS =====


class TelemetryEventCreate(BaseModel):
    """Create a new telemetry event."""

    event_name: str = Field(..., max_length=100)
    user_hash: str | None = Field(None, max_length=128)
    payload: dict | None = None


class TelemetryEventRead(BaseModel):
    """Read telemetry event data."""

    id: UUID
    event_name: str
    user_hash: str | None
    payload: dict | None
    created_at: datetime

    model_config = {"from_attributes": True}

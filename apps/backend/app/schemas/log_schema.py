"""
Schemas for frontend log submission.
Used for request/response validation when frontend sends logs to backend.
"""

from pydantic import BaseModel, Field
from typing import Any, Optional
from datetime import datetime


class FrontendLogPayload(BaseModel):
    """
    Schema for frontend log data received from browser.

    Attributes:
        level: Log level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        message: Log message
        context: Additional context data (user ID, action, etc.)
        timestamp: When the log was created (client-side)
        source: Source identifier (component, page, action)
        user_id: Optional user ID for tracking
        session_id: Optional session ID for tracking
        url: Page URL where log originated
        user_agent: Browser user agent string
        extra_data: Any additional arbitrary data
    """

    level: str = Field(..., description="Log level: DEBUG, INFO, WARNING, ERROR, CRITICAL")
    message: str = Field(..., description="Log message")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="When log was created")
    source: str = Field(..., description="Source (component, page, action name)")
    context: Optional[dict[str, Any]] = Field(default=None, description="Additional context")
    user_id: Optional[str] = Field(default=None, description="User ID")
    session_id: Optional[str] = Field(default=None, description="Session ID")
    url: Optional[str] = Field(default=None, description="Current page URL")
    user_agent: Optional[str] = Field(default=None, description="Browser user agent")
    extra_data: Optional[dict[str, Any]] = Field(default=None, description="Extra data")

    class Config:
        json_schema_extra = {
            "example": {
                "level": "ERROR",
                "message": "Login failed",
                "source": "login_page",
                "context": {"attempt": 1, "email": "user@example.com"},
                "user_id": "user_123",
                "session_id": "sess_456",
            }
        }


class LogResponse(BaseModel):
    """Response from log submission endpoint."""

    success: bool
    message: str
    log_id: Optional[str] = None

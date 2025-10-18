"""
User schemas for authentication and user management.
"""

from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    """Create a new user."""

    supabase_user_id: UUID
    email: EmailStr
    full_name: str | None = Field(None, max_length=200)
    phone: str | None = Field(None, max_length=30)
    location: str | None = Field(None, max_length=255)
    linkedin_url: str | None = Field(None, max_length=255)
    github_url: str | None = Field(None, max_length=255)
    portfolio_url: str | None = Field(None, max_length=255)
    preferred_roles: list[str] = Field(default_factory=list)
    preferred_locations: list[str] = Field(default_factory=list)
    preferred_salary_min: int | None = Field(None, ge=0)
    preferred_salary_max: int | None = Field(None, ge=0)
    years_of_experience: Decimal | None = Field(None, ge=0, le=99.9)


class UserUpdate(BaseModel):
    """Update user information."""

    email: EmailStr | None = None
    full_name: str | None = Field(None, max_length=200)
    phone: str | None = Field(None, max_length=30)
    location: str | None = Field(None, max_length=255)
    linkedin_url: str | None = Field(None, max_length=255)
    github_url: str | None = Field(None, max_length=255)
    portfolio_url: str | None = Field(None, max_length=255)
    preferred_roles: list[str] | None = None
    preferred_locations: list[str] | None = None
    preferred_salary_min: int | None = Field(None, ge=0)
    preferred_salary_max: int | None = Field(None, ge=0)
    years_of_experience: Decimal | None = Field(None, ge=0, le=99.9)
    has_completed_onboarding: bool | None = None
    is_active: bool | None = None


class UserRead(BaseModel):
    """Read user data."""

    id: UUID
    supabase_user_id: UUID
    email: EmailStr
    full_name: str | None
    phone: str | None
    location: str | None
    linkedin_url: str | None
    github_url: str | None
    portfolio_url: str | None
    preferred_roles: list[str]
    preferred_locations: list[str]
    preferred_salary_min: int | None
    preferred_salary_max: int | None
    years_of_experience: Decimal | None
    has_completed_onboarding: bool
    is_active: bool
    created_at: datetime
    updated_at: datetime
    last_login_at: datetime | None
    deleted_at: datetime | None

    model_config = {"from_attributes": True}


# ===== ONBOARDING PROGRESS =====


class OnboardingProgressCreate(BaseModel):
    """Create or update onboarding progress."""

    user_id: UUID
    data: dict


class OnboardingProgressRead(BaseModel):
    """Read onboarding progress data."""

    user_id: UUID
    data: dict
    updated_at: datetime

    model_config = {"from_attributes": True}

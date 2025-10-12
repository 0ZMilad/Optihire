"""
User schemas for authentication and user management.
"""
from uuid import UUID
from datetime import datetime
from typing import Optional, List
from decimal import Decimal
from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    """Create a new user."""
    supabase_user_id: UUID
    email: EmailStr
    full_name: Optional[str] = Field(None, max_length=200)
    phone: Optional[str] = Field(None, max_length=30)
    location: Optional[str] = Field(None, max_length=255)
    linkedin_url: Optional[str] = Field(None, max_length=255)
    github_url: Optional[str] = Field(None, max_length=255)
    portfolio_url: Optional[str] = Field(None, max_length=255)
    preferred_roles: List[str] = Field(default_factory=list)
    preferred_locations: List[str] = Field(default_factory=list)
    preferred_salary_min: Optional[int] = Field(None, ge=0)
    preferred_salary_max: Optional[int] = Field(None, ge=0)
    years_of_experience: Optional[Decimal] = Field(None, ge=0, le=99.9)


class UserUpdate(BaseModel):
    """Update user information."""
    email: Optional[EmailStr] = None
    full_name: Optional[str] = Field(None, max_length=200)
    phone: Optional[str] = Field(None, max_length=30)
    location: Optional[str] = Field(None, max_length=255)
    linkedin_url: Optional[str] = Field(None, max_length=255)
    github_url: Optional[str] = Field(None, max_length=255)
    portfolio_url: Optional[str] = Field(None, max_length=255)
    preferred_roles: Optional[List[str]] = None
    preferred_locations: Optional[List[str]] = None
    preferred_salary_min: Optional[int] = Field(None, ge=0)
    preferred_salary_max: Optional[int] = Field(None, ge=0)
    years_of_experience: Optional[Decimal] = Field(None, ge=0, le=99.9)
    has_completed_onboarding: Optional[bool] = None
    is_active: Optional[bool] = None


class UserRead(BaseModel):
    """Read user data."""
    id: UUID
    supabase_user_id: UUID
    email: EmailStr
    full_name: Optional[str]
    phone: Optional[str]
    location: Optional[str]
    linkedin_url: Optional[str]
    github_url: Optional[str]
    portfolio_url: Optional[str]
    preferred_roles: List[str]
    preferred_locations: List[str]
    preferred_salary_min: Optional[int]
    preferred_salary_max: Optional[int]
    years_of_experience: Optional[Decimal]
    has_completed_onboarding: bool
    is_active: bool
    created_at: datetime
    updated_at: datetime
    last_login_at: Optional[datetime]
    deleted_at: Optional[datetime]

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
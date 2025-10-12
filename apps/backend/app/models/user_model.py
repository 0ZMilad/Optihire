"""
User model for database operations.
"""
from typing import Optional, List
from uuid import UUID, uuid4
from datetime import datetime
from decimal import Decimal
from pydantic import EmailStr
from sqlmodel import SQLModel, Field, Column
from sqlalchemy import ARRAY, String, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID as PGUUID, JSONB


class UserBase(SQLModel):
    """Base user model with shared fields."""
    supabase_user_id: UUID = Field(
        sa_column=Column(PGUUID(as_uuid=True), unique=True, nullable=False, index=True)
    )
    email: EmailStr = Field(max_length=255, index=True, nullable=False)
    full_name: Optional[str] = Field(default=None, max_length=200)
    phone: Optional[str] = Field(default=None, max_length=30)
    location: Optional[str] = Field(default=None, max_length=255)
    linkedin_url: Optional[str] = Field(default=None, max_length=255)
    github_url: Optional[str] = Field(default=None, max_length=255)
    portfolio_url: Optional[str] = Field(default=None, max_length=255)
    preferred_roles: List[str] = Field(
        default_factory=list,
        sa_column=Column(ARRAY(String), nullable=True, server_default='{}')
    )
    preferred_locations: List[str] = Field(
        default_factory=list,
        sa_column=Column(ARRAY(String), nullable=True, server_default='{}')
    )
    preferred_salary_min: Optional[int] = Field(default=None, ge=0)
    preferred_salary_max: Optional[int] = Field(default=None, ge=0)
    years_of_experience: Optional[Decimal] = Field(default=None, max_digits=4, decimal_places=1)
    has_completed_onboarding: bool = Field(default=False)
    is_active: bool = Field(default=True)


class User(UserBase, table=True):
    """User table model."""
    __tablename__ = "users"
    __table_args__ = (
        UniqueConstraint("supabase_user_id", name="uq_users_supabase_user_id"),
        UniqueConstraint("email", name="uq_users_email"),
    )
    
    id: UUID = Field(
        default_factory=uuid4,
        sa_column=Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    )
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column_kwargs={"server_default": func.now()}
    )
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column_kwargs={"server_default": func.now(), "onupdate": func.now()}
    )
    last_login_at: Optional[datetime] = Field(default=None)
    deleted_at: Optional[datetime] = Field(default=None)


class UserOnboardingProgress(SQLModel, table=True):
    """User onboarding progress tracking."""
    __tablename__ = "user_onboarding_progress"
    
    user_id: UUID = Field(
        sa_column=Column(PGUUID(as_uuid=True), primary_key=True)
    )
    data: dict = Field(sa_column=Column("data", JSONB, nullable=False))  # JSONB in PostgreSQL
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column_kwargs={"server_default": func.now(), "onupdate": func.now()}
    )
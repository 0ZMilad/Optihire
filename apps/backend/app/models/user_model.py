from typing import Optional
from pydantic import EmailStr
from sqlmodel import SQLModel, Field
from sqlalchemy import UniqueConstraint

class UserBase(SQLModel):
    email: EmailStr = Field(index=True)
    supabase_user_id: str = Field(index=True)

class User(UserBase, table=True):
    __tablename__ = "users"
    __table_args__ = (
        UniqueConstraint("email", name="uq_users_email"),
        UniqueConstraint("supabase_user_id", name="uq_users_supabase_user_id"),
    )
    id: Optional[int] = Field(default=None, primary_key=True)
from datetime import datetime, timezone
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, select

from app.models.user_model import User
from app.schemas.user_schema import UserCreate, UserUpdate


def create_user(db: Session, user_data: UserCreate) -> User:
    """Create a new user in the database."""
    user = User.model_validate(user_data)
    db.add(user)
    try:
        db.commit()
    except IntegrityError as err:
        db.rollback()
        # You can add more specific checks here to see which constraint failed
        raise HTTPException(
            status_code=409,
            detail="User with this email or Supabase User ID already exists",
        ) from err
    db.refresh(user)
    return user


def get_user_by_id(db: Session, user_id: UUID) -> User | None:
    """Get a user by their ID."""
    statement = select(User).where(User.id == user_id, User.deleted_at.is_(None))
    user = db.exec(statement).first()
    return user


def get_user_by_supabase_id(db: Session, supabase_user_id: UUID) -> User | None:
    """Get a user by their Supabase user ID."""
    statement = select(User).where(
        User.supabase_user_id == supabase_user_id, User.deleted_at.is_(None)
    )
    user = db.exec(statement).first()
    return user


def update_user(db: Session, user_id: UUID, user_data: UserUpdate) -> User | None:
    """Update a user's information."""
    user = get_user_by_id(db, user_id)
    if not user:
        return None

    # Update only provided fields
    update_data = user_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(user, key, value)

    user.updated_at = datetime.now(timezone.utc)

    try:
        db.add(user)
        db.commit()
        db.refresh(user)
    except IntegrityError as err:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="User with this email already exists",
        ) from err

    return user


def delete_user(db: Session, user_id: UUID) -> bool:
    """Soft delete a user (sets deleted_at timestamp)."""
    user = get_user_by_id(db, user_id)
    if not user:
        return False

    user.deleted_at = datetime.now(timezone.utc)
    user.is_active = False

    db.add(user)
    db.commit()
    return True

from sqlalchemy.exc import IntegrityError
from sqlmodel import Session
from fastapi import HTTPException
from app.models.user_model import User
from app.schemas.user_schema import UserCreate

def create_user(db: Session, user_data: UserCreate) -> User:
    user = User.model_validate(user_data)
    db.add(user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        # You can add more specific checks here to see which constraint failed
        raise HTTPException(status_code=409, detail="User with this email or Supabase User ID already exists")
    db.refresh(user)
    return user
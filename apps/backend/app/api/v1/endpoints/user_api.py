from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.db.session import get_db
from app.schemas.user_schema import UserCreate, UserRead
from app.services import user_service

router = APIRouter()


@router.post("/", response_model=UserRead)
def create_new_user(user: UserCreate, db: Session = Depends(get_db)):
    """
    Create a new user. This corresponds to the user bootstrap process
    after their first authentication via Supabase Auth.
    """
    return user_service.create_user(db=db, user_data=user)

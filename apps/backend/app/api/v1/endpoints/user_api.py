from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from app.db.session import get_db
from app.schemas.user_schema import UserCreate, UserRead, UserUpdate
from app.services import user_service

router = APIRouter()


@router.post("/", response_model=UserRead, status_code=201)
def create_new_user(user: UserCreate, db: Session = Depends(get_db)):
    """
    Create a new user. This corresponds to the user bootstrap process
    after their first authentication via Supabase Auth.
    """
    return user_service.create_user(db=db, user_data=user)


@router.get("/{user_id}", response_model=UserRead)
def get_user(user_id: UUID, db: Session = Depends(get_db)):
    """
    Get a user by ID.
    """
    user = user_service.get_user_by_id(db=db, user_id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.patch("/{user_id}", response_model=UserRead)
def update_user(user_id: UUID, user_data: UserUpdate, db: Session = Depends(get_db)):
    """
    Update a user's profile information.
    """
    user = user_service.update_user(db=db, user_id=user_id, user_data=user_data)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.delete("/{user_id}", status_code=204)
def delete_user(user_id: UUID, db: Session = Depends(get_db)):
    """
    Soft delete a user (sets deleted_at timestamp).
    """
    success = user_service.delete_user(db=db, user_id=user_id)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    return None

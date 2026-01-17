from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from app.core.dependencies import get_current_user, get_current_user_id, require_scopes
from app.core.utils import require_found
from app.db.session import get_db
from app.schemas.user_schema import UserCreate, UserRead, UserUpdate
from app.services import user_service

router = APIRouter()


@router.post("/", response_model=UserRead, status_code=201, dependencies=[Depends(require_scopes(["users:create"]))])
async def create_new_user(
    user: UserCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Create a new user. This corresponds to the user bootstrap process
    after their first authentication via Supabase Auth.
    Only the authenticated user can create their own profile.
    """
    # Verify the user is creating their own profile (sub claim is their Supabase user ID)
    if str(user.supabase_user_id) != current_user["sub"]:
        raise HTTPException(
            status_code=403,
            detail="You can only create your own user profile"
        )
    
    return user_service.create_user(db=db, user_data=user)


@router.get("/profile", response_model=UserRead, dependencies=[Depends(require_scopes(["users:read"]))])
async def get_current_user_profile(
    db: Session = Depends(get_db),
    current_user_id: UUID = Depends(get_current_user_id),
):
    """
    Get the currently authenticated user's profile.
    Returns the profile information without requiring user_id as a path parameter.
    """
    user = user_service.get_user_by_id(db=db, user_id=current_user_id)
    return require_found(user, "User")


@router.put("/profile", response_model=UserRead, dependencies=[Depends(require_scopes(["users:update"]))])
async def update_current_user_profile(
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user_id: UUID = Depends(get_current_user_id),
):
    """
    Update the currently authenticated user's profile.
    Updates profile information without requiring user_id as a path parameter.
    """
    user = user_service.update_user(db=db, user_id=current_user_id, user_data=user_data)
    return require_found(user, "User")


@router.get("/{user_id}", response_model=UserRead, dependencies=[Depends(require_scopes(["users:read"]))])
async def get_user(
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user_id: UUID = Depends(get_current_user_id),
):
    """
    Get a user by ID. Users can only access their own profile.
    """
    # Verify user is accessing their own data
    if user_id != current_user_id:
        raise HTTPException(
            status_code=403,
            detail="You can only access your own profile"
        )
    
    user = user_service.get_user_by_id(db=db, user_id=user_id)
    return require_found(user, "User")


@router.patch("/{user_id}", response_model=UserRead, dependencies=[Depends(require_scopes(["users:update"]))])
async def update_user(
    user_id: UUID,
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user_id: UUID = Depends(get_current_user_id),
):
    """
    Update a user's profile information.
    """
    # Verify user is updating their own data
    if user_id != current_user_id:
        raise HTTPException(
            status_code=403,
            detail="You can only update your own profile"
        )
    
    user = user_service.update_user(db=db, user_id=user_id, user_data=user_data)
    return require_found(user, "User")


@router.delete("/{user_id}", status_code=204, dependencies=[Depends(require_scopes(["users:delete"]))])
async def delete_user(
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user_id: UUID = Depends(get_current_user_id),
):
    """
    Soft delete a user (sets deleted_at timestamp).
    """
    # Verify user is deleting their own account
    if user_id != current_user_id:
        raise HTTPException(
            status_code=403,
            detail="You can only delete your own account"
        )
    
    success = user_service.delete_user(db=db, user_id=user_id)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    return None


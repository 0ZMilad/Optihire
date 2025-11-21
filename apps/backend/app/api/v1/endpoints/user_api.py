from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from app.core.dependencies import get_current_user, get_current_user_id, require_scopes
from app.db.session import get_db
from app.schemas.user_schema import UserCreate, UserRead, UserUpdate
from app.services import user_service

router = APIRouter()


@router.post("/", response_model=UserRead, status_code=201, dependencies=[Depends(require_scopes(["users:create"]))])
def create_new_user(
    user: UserCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Create a new user. This corresponds to the user bootstrap process
    after their first authentication via Supabase Auth.
    Only the authenticated user can create their own profile.
    """
    # Verify the user is creating their own profile
    if str(user.id) != current_user["sub"]:
        raise HTTPException(
            status_code=403,
            detail="You can only create your own user profile"
        )
    
    return user_service.create_user(db=db, user_data=user)


@router.get("/profile", response_model=UserRead, dependencies=[Depends(require_scopes(["users:read"]))])
def get_current_user_profile(
    db: Session = Depends(get_db),
    current_user_id: UUID = Depends(get_current_user_id),
):
    """
    Get the currently authenticated user's profile.
    
    Returns the profile information of the authenticated user without requiring
    them to pass their user_id as a path parameter.
    """

    # STEP 1: Extract the current user's ID from JWT token
    # (This is already done by the get_current_user_id dependency)
    # current_user_id is now available as a function parameter
    
    # STEP 2: Query the database using the service layer
    # Call the existing service method to fetch the user by their ID
    user = user_service.get_user_by_id(db=db, user_id=current_user_id)
    
    # STEP 3: Error handling - check if user exists
    # If the service returns None, raise a 404 exception
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # STEP 4: Return the user profile
    # FastAPI automatically serializes to UserRead schema
    return user

@router.put("/profile", response_model=UserRead, dependencies=[Depends(require_scopes(["users:update"]))])
def update_current_user_profile(
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user_id: UUID = Depends(get_current_user_id),
):
    """
    Update the currently authenticated user's profile.
    
    Updates the profile information of the authenticated user without requiring
    them to pass their user_id as a path parameter.
    """

    # STEP 1: Extract the current user's ID from JWT token
    # (This is already done by the get_current_user_id dependency)
    # current_user_id is now available as a function parameter
    
    # STEP 2: Query the database using the service layer
    # Call the existing service method to fetch the user by their ID
    user = user_service.update_user(db=db, user_id=current_user_id, user_data=user_data)
    
    # STEP 3: Error handling - check if user exists
    # If the service returns None, raise a 404 exception
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # STEP 4: Return the user profile
    # FastAPI automatically serializes to UserRead schema
    return user

@router.get("/{user_id}", response_model=UserRead, dependencies=[Depends(require_scopes(["users:read"]))])
def get_user(
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
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.patch("/{user_id}", response_model=UserRead, dependencies=[Depends(require_scopes(["users:update"]))])
def update_user(
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
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.delete("/{user_id}", status_code=204, dependencies=[Depends(require_scopes(["users:delete"]))])
def delete_user(
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


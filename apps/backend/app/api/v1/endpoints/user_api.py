from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from app.core.dependencies import get_current_user, get_current_user_id, require_scopes
from app.core.logging_config import log_error
from app.core.utils import require_found
from app.db.session import get_db
from app.schemas.user_schema import UserCreate, UserRead, UserUpdate
from app.services import user_service
from app.services.storage_service import delete_user_files, get_supabase_client

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
    current_user: dict = Depends(get_current_user),
):
    """
    Update the currently authenticated user's profile.
    Updates profile information without requiring user_id as a path parameter.
    """
    user = user_service.update_user(db=db, user_id=current_user_id, user_data=user_data)
    if user:
        return user

    # Bootstrap profile on first save if no app user row exists yet.
    bootstrap_email = user_data.email or current_user.get("email")
    if not bootstrap_email:
        raise HTTPException(
            status_code=400,
            detail="Email is required to create a profile"
        )

    created_user = user_service.create_user(
        db=db,
        user_data=UserCreate(
            supabase_user_id=current_user_id,
            email=bootstrap_email,
            full_name=user_data.full_name,
            phone=user_data.phone,
            location=user_data.location,
            linkedin_url=user_data.linkedin_url,
            github_url=user_data.github_url,
            portfolio_url=user_data.portfolio_url,
            preferred_roles=user_data.preferred_roles or [],
            preferred_locations=user_data.preferred_locations or [],
            preferred_salary_min=user_data.preferred_salary_min,
            preferred_salary_max=user_data.preferred_salary_max,
            years_of_experience=user_data.years_of_experience,
        ),
    )
    return created_user


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


@router.delete("/account", status_code=204, dependencies=[Depends(require_scopes(["users:delete"]))])
async def delete_own_account(
    db: Session = Depends(get_db),
    current_user_id: UUID = Depends(get_current_user_id),
):
    """
    Permanently delete the authenticated user's account.

    Steps performed in order:
    1. Collect storage paths for all user files.
    2. Hard-delete every database row owned by the user (resumes, sections,
       analyses, suggestions, job descriptions, uploaded files, etc.).
    3. Delete files from Supabase Storage (best-effort).
    4. Delete the user from Supabase Auth via the Admin API (requires
       SUPABASE_SERVICE_ROLE_KEY; best-effort if key is missing).

    This is irreversible. The soft-delete endpoint (DELETE /{user_id})
    remains available for internal/administrative use.
    """
    user = user_service.get_user_by_id(db=db, user_id=current_user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    supabase_user_id = user.supabase_user_id

    # ── Step 1 & 2: purge all app DB data, get back storage paths ────────────
    storage_paths = user_service.purge_user_account(db=db, user_id=current_user_id)

    # ── Step 3: delete files from Supabase Storage (best-effort) ─────────────
    if storage_paths:
        try:
            delete_user_files(storage_paths)
        except Exception as exc:
            log_error(
                f"Storage cleanup failed for user {current_user_id}: {exc}"
            )

    # ── Step 4: delete user from Supabase Auth (requires service role key) ───
    try:
        supabase = get_supabase_client()
        supabase.auth.admin.delete_user(str(supabase_user_id))
    except Exception as exc:
        # Log and continue — app data is already purged. The orphaned Auth
        # entry cannot log in because there is no corresponding app profile.
        log_error(
            f"Supabase Auth deletion failed for user {supabase_user_id}: {exc}"
        )

    return None


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


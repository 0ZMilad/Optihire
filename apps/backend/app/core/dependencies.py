from typing import Optional
from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.jwt import get_jwt_validator

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """
    Dependency to extract and validate JWT token from request.
    Returns the decoded token payload containing user info.
    
    Usage in endpoints:
        @router.get("/protected")
        def protected_route(current_user: dict = Depends(get_current_user)):
            user_id = current_user["sub"]
            email = current_user.get("email")
            # ... your logic
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = credentials.credentials
    validator = get_jwt_validator()
    payload = validator.validate_token(token)
    
    return payload


async def get_current_user_id(
    current_user: dict = Depends(get_current_user),
) -> UUID:
    """
    Extract user ID from validated token.
    Convenience dependency for routes that only need the user ID.
    """
    try:
        return UUID(current_user["sub"])
    except (KeyError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user ID in token",
        )


async def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(
        HTTPBearer(auto_error=False)
    ),
) -> Optional[dict]:
    """
    Optional authentication - returns None if no token provided.
    Use for endpoints that work differently for authenticated users.
    """
    if not credentials:
        return None
    
    token = credentials.credentials
    validator = get_jwt_validator()
    
    try:
        payload = validator.validate_token(token)
        return payload
    except HTTPException:
        return None

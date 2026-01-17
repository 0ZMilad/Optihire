from typing import Optional
from uuid import UUID

from fastapi import Depends, HTTPException, status, Request


def require_scopes(required_scopes: list[str]):
    """Factory that creates a scope-checking dependency"""
    
    async def check_scopes(request: Request) -> None:
        user = getattr(request.state, "user", None)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={
                    "code": "NOT_AUTHENTICATED",
                    "message": "User not authenticated",
                    "details": {}
                }
            )
        
        token_scopes = set(user.get("scopes", []))
        required = set(required_scopes)
        
        if not required.issubset(token_scopes):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "code": "INSUFFICIENT_SCOPES",
                    "message": "Token does not have required scopes",
                    "details": {
                        "required": list(required),
                        "provided": list(token_scopes)
                    }
                }
            )
    
    return check_scopes


def require_self_access(resource_user_id_param: str = "user_id"):
    """
    Factory that creates a dependency to verify a user is only accessing their own resource.
    
    Usage:
        @router.get("/{user_id}", dependencies=[Depends(require_self_access("user_id"))])
        async def get_user(user_id: UUID, ...):
            ...
    """
    async def check_self_access(
        request: Request,
        current_user_id: UUID = Depends(get_current_user_id),
    ) -> None:
        # Get the resource user_id from path parameters
        resource_user_id = request.path_params.get(resource_user_id_param)
        
        if resource_user_id is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Missing path parameter: {resource_user_id_param}"
            )
        
        try:
            resource_uuid = UUID(resource_user_id)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid user ID format"
            )
        
        if resource_uuid != current_user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only access your own resources"
            )
    
    return check_self_access


async def get_current_user(
    request: Request,
) -> dict:
    """
    Dependency to extract user from request state (already validated by middleware).
    Returns the decoded token payload containing user info.
    
    Usage in endpoints:
        @router.get("/protected")
        def protected_route(current_user: dict = Depends(get_current_user)):
            user_id = current_user["sub"]
            email = current_user.get("email")
            # ... your logic
    """
    user = getattr(request.state, "user", None)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user


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
    request: Request,
) -> Optional[dict]:
    """
    Optional authentication - returns None if no token provided.
    Use for endpoints that work differently for authenticated users.
    """
    return getattr(request.state, "user", None)

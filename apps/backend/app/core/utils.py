from http import HTTPStatus
from typing import Dict, Optional, Union, List, TypeVar

from fastapi import HTTPException
from fastapi.responses import JSONResponse

T = TypeVar("T")


def require_found(resource: T | None, resource_name: str = "Resource") -> T:
    """
    Raises HTTPException 404 if resource is None.
    
    Usage:
        user = require_found(user_service.get_user_by_id(db, user_id), "User")
        # If user is None, raises 404
        # Otherwise, returns the user
    """
    if resource is None:
        raise HTTPException(
            status_code=404,
            detail=f"{resource_name} not found"
        )
    return resource


def create_error_response(status_code: Union[int, HTTPStatus], code: str, message: str, details: Optional[Dict] = None) -> JSONResponse:
     error_body = {
        "code": code,
        "message": message
    }
     
     if details is not None:
          error_body["details"] = details

     # Handle both int and HTTPStatus
     status_value = status_code.value if isinstance(status_code, HTTPStatus) else status_code
     return JSONResponse(content=error_body, status_code=status_value)


def map_role_to_scopes(role: str) -> List[str]:
    """
    Maps Supabase roles to application scopes.
    Centralizes scope assignment logic.
    """
    if role == "authenticated":
        # Authenticated users get full user management scopes
        return [
            "users:read",
            "users:create", 
            "users:update",
            "users:delete"
        ]
    elif role == "service_role":
        # Service role gets all scopes (admin)
        return [
            "users:read",
            "users:create",
            "users:update", 
            "users:delete",
            "admin:read",
            "admin:write"
        ]
    else:
        # Unknown role gets minimal scopes
        return ["users:read"]
      

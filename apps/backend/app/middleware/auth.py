from fastapi import Request, status
from starlette.middleware.base import BaseHTTPMiddleware
from uuid import uuid4

from app.core.utils import create_error_response, map_role_to_scopes
from app.core.jwt import get_jwt_validator

def get_request_id(request: Request) -> str:
    """
    Retrieve request ID from header or generate a new one.
    This ensures every request has a traceable ID.
    """
    # Check if client already sent an x-request-id header
    request_id = request.headers.get("x-request-id")
    
    # If not present, generate a new UUID
    if not request_id:
        request_id = str(uuid4())
    
    return request_id


class JWTMiddleware(BaseHTTPMiddleware):
    
    """
    Global JWT validation middleware.
    Validates all requests except public paths.
    """
    
    # Paths that don't require authentication
    PUBLIC_PATHS = {
        "/",
        "/health",
        "/docs",
        "/redoc",
        "/openapi.json",
    }

    async def dispatch(self, request: Request, call_next):
        # 1. EXTRACT REQUEST ID (for traceability)
        request_id = get_request_id(request)
        request.state.request_id = request_id
        
        # 2. CHECK PUBLIC PATHS (skip auth for routes that don't need it)
        if request.url.path in self.PUBLIC_PATHS:
            response = await call_next(request)
            response.headers["x-request-id"] = request_id
            return response
        
        # 3. EXTRACT & VALIDATE JWT TOKEN (protected routes only)
        auth_header = request.headers.get("Authorization")
        
        if not auth_header or not auth_header.startswith("Bearer "):
            error_response = create_error_response(
                status_code=status.HTTP_401_UNAUTHORIZED,
                code="MISSING_AUTH_HEADER",
                message="Missing or invalid authorization header",
                details={"header": "Authorization"}
            )
            error_response.headers["x-request-id"] = request_id
            return error_response
        
        token = auth_header.split(" ")[1]
        
        validator = get_jwt_validator()
        
        try:
            # Validate token
            payload = validator.validate_token(token)

            if "sub" not in payload:
                error_response = create_error_response(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    code="MISSING_SUB_CLAIM",
                    message="Token is missing 'sub' claim",
                    details={"claim": "sub"}
                )
                error_response.headers["x-request-id"] = request_id
                return error_response
            
            # Map Supabase role to scopes (for compatibility with existing endpoints)
            if "scopes" not in payload:
                role = payload.get("role", "")
                payload["scopes"] = map_role_to_scopes(role)
            
            # Validate scopes is a list (not str, which is also a Sequence)
            if not isinstance(payload.get("scopes"), list):
                error_response = create_error_response(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    code="INVALID_SCOPES_CLAIM",
                    message="Token has invalid 'scopes' claim",
                    details={"claim": "scopes"}
                )
                error_response.headers["x-request-id"] = request_id
                return error_response
            
            # Attach user info to request state
            request.state.user = payload
        except Exception as e:
            error_response = create_error_response(
                status_code=status.HTTP_401_UNAUTHORIZED,
                code="INVALID_TOKEN",
                message="Token validation failed",
                details={"error": str(e)}
            )
            error_response.headers["x-request-id"] = request_id
            return error_response
        
        # 4. PROCESS REQUEST & ENRICH RESPONSE
        response = await call_next(request)
        response.headers["x-request-id"] = request_id
        return response

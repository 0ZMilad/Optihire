from datetime import datetime, timezone
from functools import lru_cache
from typing import Optional

import jwt
from cachetools import TTLCache
from fastapi import HTTPException, status

from app.core.config import settings

# Cache for decoded tokens (5 minute TTL, max 1000 tokens)
token_cache = TTLCache(maxsize=1000, ttl=300)


class JWTValidator:
    """Handles Supabase JWT validation with caching"""
    
    def __init__(self):
        self.secret = settings.SUPABASE_JWT_SECRET
        self.algorithm = settings.JWT_ALGORITHM
        self.audience = settings.JWT_AUDIENCE
        self.issuer = settings.jwt_issuer
    
    def validate_token(self, token: str) -> dict:
        """
        Validate JWT token and return decoded payload.
        Implements caching to reduce validation overhead.
        """
        # Check cache first
        if token in token_cache:
            cached_payload = token_cache[token]
            # Verify not expired
            if cached_payload.get("exp", 0) > datetime.now(timezone.utc).timestamp():
                return cached_payload
            else:
                # Remove expired token from cache
                del token_cache[token]
        
        try:
            # Decode and validate token
            payload = jwt.decode(
                token,
                self.secret,
                algorithms=[self.algorithm],
                audience=self.audience,
                issuer=self.issuer,
                options={
                    "verify_signature": True,
                    "verify_exp": True,
                    "verify_iat": True,
                    "verify_aud": True,
                    "verify_iss": True,
                }
            )
            
            # Cache the validated token
            token_cache[token] = payload
            
            return payload
            
        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired",
                headers={"WWW-Authenticate": "Bearer"},
            )
        except jwt.InvalidAudienceError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token audience",
                headers={"WWW-Authenticate": "Bearer"},
            )
        except jwt.InvalidIssuerError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token issuer",
                headers={"WWW-Authenticate": "Bearer"},
            )
        except jwt.InvalidSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token signature",
                headers={"WWW-Authenticate": "Bearer"},
            )
        except jwt.InvalidTokenError as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid token: {str(e)}",
                headers={"WWW-Authenticate": "Bearer"},
            )


@lru_cache()
def get_jwt_validator() -> JWTValidator:
    """Singleton instance of JWT validator"""
    return JWTValidator()

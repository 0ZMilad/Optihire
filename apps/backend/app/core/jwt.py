from datetime import datetime, timezone
from functools import lru_cache
from typing import Optional

import jwt
from cachetools import TTLCache
from fastapi import HTTPException, status
import requests

from app.core.config import settings

# Cache for decoded tokens (5 minute TTL, max 1000 tokens)
token_cache = TTLCache(maxsize=1000, ttl=300)

# Cache for JWKS (JSON Web Key Set)
jwks_cache = {"keys": None, "fetched_at": None}


class JWTValidator:
    """Handles Supabase JWT validation with caching"""
    
    def __init__(self):
        self.audience = settings.JWT_AUDIENCE
        self.issuer = settings.jwt_issuer
        self.jwks_url = f"{settings.SUPABASE_URL}/auth/v1/.well-known/jwks.json"
    
    def get_signing_key(self, token: str):
        """Get the signing key from JWKS endpoint"""
        # Decode header to get kid
        unverified_header = jwt.get_unverified_header(token)
        kid = unverified_header.get("kid")
        
        # Fetch JWKS if not cached or expired
        if jwks_cache["keys"] is None or jwks_cache["fetched_at"] is None or \
           (datetime.now(timezone.utc).timestamp() - jwks_cache["fetched_at"]) > 3600:
            try:
                response = requests.get(self.jwks_url, timeout=5)
                response.raise_for_status()
                jwks_cache["keys"] = response.json()["keys"]
                jwks_cache["fetched_at"] = datetime.now(timezone.utc).timestamp()
            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Failed to fetch JWKS: {str(e)}"
                )
        
        # Find the key with matching kid
        for key in jwks_cache["keys"]:
            if key.get("kid") == kid:
                # Use the appropriate algorithm based on key type
                key_type = key.get("kty")
                if key_type == "EC":
                    return jwt.algorithms.ECAlgorithm.from_jwk(key)
                elif key_type == "RSA":
                    return jwt.algorithms.RSAAlgorithm.from_jwk(key)
                else:
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail=f"Unsupported key type: {key_type}"
                    )
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No matching key found in JWKS"
        )
    
    def validate_token(self, token: str) -> dict:
        """
        Validate JWT token and return decoded payload.
        Implements caching to reduce validation overhead.
        """
        # Check cache first (TTLCache automatically handles expiry)
        if token in token_cache:
            return token_cache[token]
        
        try:
            # Get algorithm from token header
            unverified_header = jwt.get_unverified_header(token)
            algorithm = unverified_header.get("alg")
            
            # Get signing key for ES256/RS256 tokens
            if algorithm in ["ES256", "RS256"]:
                key = self.get_signing_key(token)
            else:
                # HS256 not supported without explicit secret configuration
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail=f"Unsupported algorithm: {algorithm}",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            
            # Decode and validate token
            payload = jwt.decode(
                token,
                key,
                algorithms=[algorithm],
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

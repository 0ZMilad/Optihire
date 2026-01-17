import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError

from app.api.v1.endpoints import system_api, user_api, resumes
from app.core.config import settings
from app.core.logging_config import backend_logger, log_info, log_error
from app.middleware.auth import JWTMiddleware
from app.middleware.logging_middleware import LoggingMiddleware

# Suppress FastAPI/Uvicorn console logging
logging.getLogger("uvicorn").setLevel(logging.WARNING)
logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
logging.getLogger("fastapi").setLevel(logging.WARNING)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AI-powered ATS Resume Optimization Platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)


# =============================================================================
# GLOBAL EXCEPTION HANDLERS
# =============================================================================

@app.exception_handler(IntegrityError)
async def integrity_error_handler(request: Request, exc: IntegrityError) -> JSONResponse:
    """
    Handle database integrity errors (unique constraint violations, etc.)
    Returns a 409 Conflict response with details.
    """
    log_error(f"Database integrity error: {str(exc)}", logger_name="backend")
    return JSONResponse(
        status_code=409,
        content={
            "code": "INTEGRITY_ERROR",
            "message": "A database constraint was violated",
            "detail": "The resource already exists or conflicts with existing data"
        }
    )


@app.exception_handler(ValueError)
async def value_error_handler(request: Request, exc: ValueError) -> JSONResponse:
    """
    Handle ValueError exceptions (often from parsing/validation).
    Returns a 400 Bad Request response.
    """
    log_error(f"Value error: {str(exc)}", logger_name="backend")
    return JSONResponse(
        status_code=400,
        content={
            "code": "VALIDATION_ERROR",
            "message": str(exc)
        }
    )


# Initialize logging
log_info("Application starting up", logger_name="backend")

# Add logging middleware (should be early in the stack)
app.add_middleware(LoggingMiddleware)

# Add JWT authentication middleware (must be before CORS)
app.add_middleware(JWTMiddleware)

# CORS configuration (for your Next.js frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Local Next.js development
        "http://localhost:3001",  # Alternative port
        "https://syicfsqcndapnfpqqbee.supabase.co", # Supabase deployed frontend
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(
    user_api.router, prefix=f"{settings.API_V1_STR}/users", tags=["users"]
)
app.include_router(
    system_api.router, prefix=f"{settings.API_V1_STR}/system", tags=["system"]
)
app.include_router(
    resumes.router, prefix=f"{settings.API_V1_STR}/resumes", tags=["resumes"]
)


@app.get("/")
def read_root():
    return {
        "message": "Welcome to Optihire API",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc",
        "health": "/api/v1/system/health",
    }

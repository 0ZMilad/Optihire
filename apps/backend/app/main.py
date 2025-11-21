from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.endpoints import system_api, user_api
from app.core.config import settings
from app.middleware.auth import JWTMiddleware

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AI-powered ATS Resume Optimization Platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

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


@app.get("/")
def read_root():
    return {
        "message": "Welcome to Optihire API",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc",
    }


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "Optihire Backend"}

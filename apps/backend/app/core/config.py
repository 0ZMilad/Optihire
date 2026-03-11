from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Database (Direct PostgreSQL connection via Supabase)
    DATABASE_URL: str

    # Supabase configuration (for future features like Auth, Storage)
    SUPABASE_URL: str
    SUPABASE_KEY: str
    SUPABASE_SERVICE_ROLE_KEY: str | None = None
    # Storage bucket configuration
    SUPABASE_STORAGE_BUCKET: str = "resumes"
    MAX_UPLOAD_SIZE_MB: int = 5  
    
     # JWT Configuration for Supabase Auth
    JWT_AUDIENCE: str = "authenticated"  # Supabase default audience

    # AI Enhancement
    AI_ENHANCE_ENABLED: bool = False
    LLM_PROVIDER: str = "gemini/gemini-2.5-flash"
    LITELLM_API_KEY: str = ""
    LITELLM_TEMPERATURE: float = 0.3
    LITELLM_MAX_TOKENS: int = 4000
    MAX_AI_CALLS_PER_DAY: int = 10

    # Demo account restrictions
    DEMO_ACCOUNT_EMAIL: str = "demo@optihire.com"

    # Application settings
    PROJECT_NAME: str = "Optihire API"
    API_V1_STR: str = "/api/v1"
    DOCS_ENABLED: bool = False  # Enable only in local dev, never in production

    # CORS
    # Production Vercel URL (also settable via FRONTEND_URL env var on the host)
    FRONTEND_URL: str = ""
    ALLOWED_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "https://optihire-frontend.vercel.app",
        "https://optihire-frontend-git-main-0zmilads-projects.vercel.app",
    ]

    # Rate Limiting (targeted endpoints only)
    RATE_LIMIT_UPLOAD: str = "10/minute"
    RATE_LIMIT_AUDIT: str = "20/minute"

    # Database Pool
    DB_POOL_SIZE: int = 10
    DB_MAX_OVERFLOW: int = 20
    DB_POOL_RECYCLE: int = 300
    DB_POOL_TIMEOUT: int = 30

    @property
    def jwt_issuer(self) -> str:
        """Extract issuer from Supabase URL for JWT validation"""
        return f"{self.SUPABASE_URL}/auth/v1"

    model_config = {
        "env_file": ".env",
        "case_sensitive": True,
    }


settings = Settings()

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

    # Application settings
    PROJECT_NAME: str = "Optihire API"
    API_V1_STR: str = "/api/v1"

    @property
    def jwt_issuer(self) -> str:
        """Extract issuer from Supabase URL for JWT validation"""
        return f"{self.SUPABASE_URL}/auth/v1"

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

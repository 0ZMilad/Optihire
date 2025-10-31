from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Database (Direct PostgreSQL connection via Supabase)
    DATABASE_URL: str

    # Supabase configuration (for future features like Auth, Storage)
    SUPABASE_URL: str
    SUPABASE_KEY: str
    SUPABASE_SERVICE_ROLE_KEY: str | None = None
    
     # JWT Configuration for Supabase Auth
    SUPABASE_JWT_SECRET: str  # Add this - from Supabase dashboard
    JWT_ALGORITHM: str = "HS256"  # Supabase uses HS256 by default
    JWT_AUDIENCE: str = "authenticated"  # Supabase default audience

    # Application settings
    PROJECT_NAME: str = "OptiHire API"
    API_V1_STR: str = "/api/v1"

    @property
    def jwt_issuer(self) -> str:
        """Extract issuer from Supabase URL for JWT validation"""
        return self.SUPABASE_URL

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

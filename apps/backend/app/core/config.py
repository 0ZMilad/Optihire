from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Database (Direct PostgreSQL connection via Supabase)
    DATABASE_URL: str

    # Supabase configuration (for future features like Auth, Storage)
    SUPABASE_URL: str
    SUPABASE_KEY: str
    SUPABASE_SERVICE_ROLE_KEY: str | None = None

    # Application settings
    PROJECT_NAME: str = "OptiHire API"
    API_V1_STR: str = "/api/v1"

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

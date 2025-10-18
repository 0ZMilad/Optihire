from sqlmodel import Session, create_engine

from app.core.config import settings

# PostgreSQL Engine (for direct database operations with SQLModel)
engine = create_engine(
    str(settings.DATABASE_URL),
    pool_pre_ping=True,
    echo=False,  # Set to True to see generated SQL queries
    pool_size=10,
    max_overflow=20,
)


def get_db():
    """Dependency for database sessions"""
    with Session(engine) as session:
        yield session

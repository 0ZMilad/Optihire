from contextlib import contextmanager

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


def SessionLocal():
    """
    Create a new database session.
    Used for background tasks and non-request contexts.
    """
    return Session(engine)


@contextmanager
def get_session_context():
    """
    Context manager for database sessions in background tasks.
    Ensures proper cleanup even if exceptions occur.
    
    Usage:
        with get_session_context() as db:
            # do database operations
            pass
    """
    session = Session(engine)
    try:
        yield session
    finally:
        session.close()


def get_db():
    """Dependency for database sessions"""
    with Session(engine) as session:
        yield session


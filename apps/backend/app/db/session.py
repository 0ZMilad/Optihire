from contextlib import contextmanager

from sqlmodel import Session, create_engine

from app.core.config import settings

# PostgreSQL Engine (for direct database operations with SQLModel)
engine = create_engine(
    str(settings.DATABASE_URL),
    pool_pre_ping=True,
    echo=False,
    pool_size=settings.DB_POOL_SIZE,
    max_overflow=settings.DB_MAX_OVERFLOW,
    pool_recycle=settings.DB_POOL_RECYCLE,
    pool_timeout=settings.DB_POOL_TIMEOUT,
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


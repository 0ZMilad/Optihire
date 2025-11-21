from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlmodel import Session

from app.db.session import get_db

router = APIRouter()


@router.get("/health")
def check_system_health(db: Session = Depends(get_db)):
    """
    Check the health of the system by verifying database connectivity.
    Returns service status and database connection state.
    """
    try:
        # Simple query to check database connectivity
        db.exec(text("SELECT 1"))
        return {
            "status": "healthy",
            "service": "Optihire Backend",
            "database": "connected",
            "timestamp": datetime.utcnow().isoformat(),
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "service": "Optihire Backend",
            "database": f"disconnected: {str(e)}",
            "timestamp": datetime.utcnow().isoformat(),
        }

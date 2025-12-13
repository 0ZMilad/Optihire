"""
Logging API endpoints for system health, logs, and frontend log submission.
Handles both system monitoring and frontend log ingestion.
"""

import uuid
import json
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import text
from sqlmodel import Session

from app.db.session import get_db
from app.core.logging_config import (
    backend_logger,
    frontend_logger,
    request_logger,
    log_info,
    log_error,
)
from app.schemas.log_schema import FrontendLogPayload, LogResponse

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
        log_info("Health check passed", logger_name="backend")
        return {
            "status": "healthy",
            "service": "Optihire Backend",
            "database": "connected",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
    except Exception as e:
        log_error("Health check failed", error=e, logger_name="backend")
        return {
            "status": "unhealthy",
            "service": "Optihire Backend",
            "database": f"disconnected: {str(e)}",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }


@router.post("/log", response_model=LogResponse)
async def submit_frontend_log(
    log_data: FrontendLogPayload,
    request: Request,
) -> LogResponse:
    """
    Endpoint for frontend to submit logs.
    
    The frontend sends logs from the browser, which are then written to a log file.
    This allows client-side events and errors to be tracked server-side.

    Args:
        log_data: Frontend log payload containing level, message, context, etc.
        request: FastAPI request object (for IP and metadata)

    Returns:
        LogResponse with success status and log ID

    Example Request:
        POST /api/v1/system/log
        {
            "level": "ERROR",
            "message": "Login failed",
            "source": "login_page",
            "context": {"attempt": 1},
            "user_id": "user_123",
            "url": "http://localhost:3000/login"
        }
    """
    try:
        # Generate unique log ID for tracking
        log_id = str(uuid.uuid4())

        # Prepare log record
        log_record = {
            "log_id": log_id,
            "level": log_data.level,
            "message": log_data.message,
            "source": log_data.source,
            "timestamp": log_data.timestamp.isoformat(),
            "user_id": log_data.user_id,
            "session_id": log_data.session_id,
            "url": log_data.url,
            "client_ip": request.client.host if request.client else "unknown",
            "user_agent": log_data.user_agent,
            "context": log_data.context or {},
            "extra_data": log_data.extra_data or {},
        }

        # Convert to JSON for consistent formatting
        log_message = json.dumps(log_record)

        # Log based on level
        level = log_data.level.upper()
        if level == "DEBUG":
            frontend_logger.debug(log_message)
        elif level == "INFO":
            frontend_logger.info(log_message)
        elif level == "WARNING":
            frontend_logger.warning(log_message)
        elif level == "ERROR":
            frontend_logger.error(log_message)
        elif level == "CRITICAL":
            frontend_logger.critical(log_message)
        else:
            frontend_logger.info(log_message)

        # Also log in backend logger for critical issues
        if level in ["ERROR", "CRITICAL"]:
            log_error(
                f"Frontend Error from {log_data.source}",
                logger_name="backend",
                message=log_data.message,
                user_id=log_data.user_id,
                context=log_data.context,
            )

        return LogResponse(
            success=True,
            message="Log received and processed",
            log_id=log_id,
        )

    except Exception as e:
        log_error(
            "Failed to process frontend log",
            error=e,
            logger_name="backend",
        )
        raise HTTPException(
            status_code=500,
            detail="Failed to process log submission",
        )


@router.get("/logs/stats")
async def get_log_statistics():
    """
    Get statistics about current log files.
    Returns file sizes and line counts for monitoring.
    
    Returns:
        Dictionary with statistics for each log file
    """
    from pathlib import Path

    log_dir = Path(__file__).parent.parent.parent / "logs"
    stats = {}

    try:
        for log_file in log_dir.glob("*.log"):
            try:
                file_size = log_file.stat().st_size
                line_count = sum(1 for _ in open(log_file))
                stats[log_file.name] = {
                    "size_bytes": file_size,
                    "size_mb": round(file_size / (1024 * 1024), 2),
                    "line_count": line_count,
                    "last_modified": datetime.fromtimestamp(
                        log_file.stat().st_mtime
                    ).isoformat(),
                }
            except Exception as e:
                stats[log_file.name] = {"error": str(e)}

        return {
            "success": True,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "logs": stats,
        }

    except Exception as e:
        log_error(
            "Failed to get log statistics",
            error=e,
            logger_name="backend",
        )
        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve log statistics",
        )

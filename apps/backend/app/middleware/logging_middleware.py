"""
Request/Response Logging Middleware for FastAPI.
Automatically logs all incoming requests with method, path, status code, and processing time.
"""

import time
from typing import Callable
import json

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp

from app.core.logging_config import request_logger


class LoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware to log all HTTP requests and responses.
    Tracks method, path, query params, status code, and processing time.
    """

    def __init__(self, app: ASGIApp) -> None:
        super().__init__(app)

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """
        Process request and log details before and after.

        Args:
            request: Incoming HTTP request
            call_next: Next middleware/route handler

        Returns:
            HTTP response
        """
        # Record start time
        start_time = time.time()
        method = request.method
        path = request.url.path
        query_params = dict(request.query_params) if request.query_params else {}

        if path in ["/api/v1/system/health", "/docs", "/redoc", "/openapi.json"]:
            response = await call_next(request)
            return response

        is_polling_endpoint = "/parse-status/" in path

        try:
            response = await call_next(request)
            process_time = time.time() - start_time

            # Skip fast successful polls to reduce noise
            if is_polling_endpoint and response.status_code == 200 and process_time < 1.0:
                response.headers["X-Process-Time"] = str(process_time)
                return response

            response_log = {
                "method": method,
                "path": path,
                "status": response.status_code,
                "duration_ms": round(process_time * 1000, 2),
                "client_ip": request.client.host if request.client else "unknown",
            }
            
            if query_params:
                response_log["query_params"] = query_params

            if response.status_code >= 400:
                request_logger.warning(json.dumps(response_log))
            else:
                request_logger.info(json.dumps(response_log))

            response.headers["X-Process-Time"] = str(process_time)
            return response

        except Exception as error:
            process_time = time.time() - start_time
            error_log = {
                "method": method,
                "path": path,
                "error_type": type(error).__name__,
                "error_msg": str(error),
                "duration_ms": round(process_time * 1000, 2),
                "client_ip": request.client.host if request.client else "unknown",
            }
            if query_params:
                error_log["query_params"] = query_params
            
            request_logger.error(json.dumps(error_log))
            raise

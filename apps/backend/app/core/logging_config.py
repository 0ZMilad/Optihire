"""Centralized Logging Configuration for Optihire Backend."""

import logging
import logging.handlers
from pathlib import Path

LOG_DIR = Path(__file__).parent.parent.parent / "logs"
LOG_DIR.mkdir(exist_ok=True)

# Log file paths
BACKEND_LOG_FILE = LOG_DIR / "backend.log"
FRONTEND_LOG_FILE = LOG_DIR / "frontend.log"
REQUEST_LOG_FILE = LOG_DIR / "requests.log"


class LoggerSetup:
    """Setup and configure loggers for different parts of the application."""

    @staticmethod
    def setup_logger(
        name: str,
        log_file: Path,
        level: int = logging.INFO,
        max_bytes: int = 10485760,  # 10MB
        backup_count: int = 5,
    ) -> logging.Logger:
        """
        Create and configure a logger instance.

        Args:
            name: Logger name
            log_file: Path to log file
            level: Logging level (default: INFO)
            max_bytes: Max file size before rotation (10MB)
            backup_count: Number of backup files to keep

        Returns:
            Configured logger instance
        """
        logger = logging.getLogger(name)
        logger.setLevel(level)

        # Avoid duplicate handlers
        if logger.handlers:
            return logger

        # File handler with rotation
        file_handler = logging.handlers.RotatingFileHandler(
            log_file,
            maxBytes=max_bytes,
            backupCount=backup_count,
            encoding="utf-8",
        )
        file_handler.setLevel(level)

        # Formatter with detailed information
        formatter = logging.Formatter(
            fmt="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S",
        )

        file_handler.setFormatter(formatter)

        logger.addHandler(file_handler)

        return logger


# Initialize loggers
backend_logger = LoggerSetup.setup_logger(
    name="optihire.backend",
    log_file=BACKEND_LOG_FILE,
    level=logging.INFO,
)

frontend_logger = LoggerSetup.setup_logger(
    name="optihire.frontend",
    log_file=FRONTEND_LOG_FILE,
    level=logging.INFO,
)

request_logger = LoggerSetup.setup_logger(
    name="optihire.requests",
    log_file=REQUEST_LOG_FILE,
    level=logging.INFO,
)


# Convenience functions for logging
def log_info(message: str, logger_name: str = "backend", **kwargs):
    """Log an info message with optional context."""
    logger = {
        "backend": backend_logger,
        "frontend": frontend_logger,
        "requests": request_logger,
    }.get(logger_name, backend_logger)

    context = f" | {kwargs}" if kwargs else ""
    logger.info(f"{message}{context}")


def log_error(message: str, error: Exception | None = None, logger_name: str = "backend", **kwargs):
    """Log an error message with exception details."""
    logger = {
        "backend": backend_logger,
        "frontend": frontend_logger,
        "requests": request_logger,
    }.get(logger_name, backend_logger)

    error_msg = str(error) if error else ""
    context = f" | {kwargs}" if kwargs else ""
    logger.error(f"{message} {error_msg}{context}", exc_info=error is not None)


def log_warning(message: str, logger_name: str = "backend", **kwargs):
    """Log a warning message with optional context."""
    logger = {
        "backend": backend_logger,
        "frontend": frontend_logger,
        "requests": request_logger,
    }.get(logger_name, backend_logger)

    context = f" | {kwargs}" if kwargs else ""
    logger.warning(f"{message}{context}")


def log_debug(message: str, logger_name: str = "backend", **kwargs):
    """Log a debug message with optional context."""
    logger = {
        "backend": backend_logger,
        "frontend": frontend_logger,
        "requests": request_logger,
    }.get(logger_name, backend_logger)

    context = f" | {kwargs}" if kwargs else ""
    logger.debug(f"{message}{context}")

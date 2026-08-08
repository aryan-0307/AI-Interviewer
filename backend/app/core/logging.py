"""
Structured logging configuration.

Provides a consistent, coloured log format across the entire application.
Call `setup_logging()` once at startup.
"""

import logging
import sys
from typing import Optional

from app.config.settings import get_settings


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Formatter
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

LOG_FORMAT = (
    "%(asctime)s │ %(levelname)-8s │ %(name)-28s │ %(message)s"
)
DATE_FORMAT = "%Y-%m-%d %H:%M:%S"


def setup_logging(level: Optional[str] = None) -> None:
    """Configure root logger with a uniform format and level."""
    settings = get_settings()
    resolved_level = level or settings.LOG_LEVEL

    # Root logger
    root = logging.getLogger()
    root.setLevel(resolved_level)

    # Avoid duplicate handlers on repeated calls
    if root.handlers:
        return

    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(resolved_level)
    handler.setFormatter(logging.Formatter(LOG_FORMAT, datefmt=DATE_FORMAT))
    root.addHandler(handler)

    # Silence noisy third-party loggers
    for noisy in ("httpx", "httpcore", "urllib3", "grpc", "pinecone"):
        logging.getLogger(noisy).setLevel(logging.WARNING)

    logging.getLogger("app").info(
        "Logging initialised  level=%s  env=%s",
        resolved_level,
        settings.APP_ENV,
    )


def get_logger(name: str) -> logging.Logger:
    """Return a namespaced logger under the 'app' hierarchy."""
    return logging.getLogger(f"app.{name}")

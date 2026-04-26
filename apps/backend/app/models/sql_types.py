"""Dialect-compatible SQLAlchemy types for SQLModel models."""

from sqlalchemy import JSON, String
from sqlalchemy.dialects.postgresql import ARRAY, JSONB

# Preserve PostgreSQL-native storage in production while letting SQLite-based
# tests create equivalent tables and persist Python lists/dicts.
STRING_LIST_COMPAT = JSON().with_variant(ARRAY(String()), "postgresql")
JSONB_COMPAT = JSON().with_variant(JSONB(), "postgresql")

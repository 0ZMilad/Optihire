"""Add ai_enhancement JSONB column to analysis_results

Revision ID: d7a1b2c3e4f5
Revises: c5f9d3e1a2b4
Create Date: 2026-03-03 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB


# revision identifiers, used by Alembic.
revision: str = "d7a1b2c3e4f5"
down_revision: Union[str, None] = "c5f9d3e1a2b4"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add ai_enhancement JSONB column to analysis_results table."""
    op.add_column(
        "analysis_results",
        sa.Column("ai_enhancement", JSONB, nullable=True),
    )


def downgrade() -> None:
    """Remove ai_enhancement column from analysis_results table."""
    op.drop_column("analysis_results", "ai_enhancement")

"""Add raw_text to resumes

Revision ID: c5f9d3e1a2b4
Revises: b4e8a9c2d1f3
Create Date: 2025-12-11 17:15:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c5f9d3e1a2b4'
down_revision: Union[str, None] = 'b4e8a9c2d1f3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add raw_text column to resumes table."""
    op.add_column('resumes', 
        sa.Column('raw_text', sa.Text(), nullable=True)
    )


def downgrade() -> None:
    """Remove raw_text column from resumes table."""
    op.drop_column('resumes', 'raw_text')

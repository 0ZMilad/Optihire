"""Add processing_status and error_message to resumes

Revision ID: b4e8a9c2d1f3
Revises: 0318513b4e03
Create Date: 2025-12-11 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b4e8a9c2d1f3'
down_revision: Union[str, None] = '0318513b4e03'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add processing_status and error_message columns to resumes table."""
    # Add processing_status column with default value 'Pending'
    op.add_column('resumes', 
        sa.Column('processing_status', sa.String(length=20), nullable=False, server_default='Pending')
    )
    
    # Add error_message column (nullable)
    op.add_column('resumes', 
        sa.Column('error_message', sa.Text(), nullable=True)
    )


def downgrade() -> None:
    """Remove processing_status and error_message columns from resumes table."""
    op.drop_column('resumes', 'error_message')
    op.drop_column('resumes', 'processing_status')

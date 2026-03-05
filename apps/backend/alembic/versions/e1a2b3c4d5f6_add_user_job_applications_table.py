"""Add user_job_applications table

Revision ID: e1a2b3c4d5f6
Revises: d7a1b2c3e4f5
Create Date: 2026-05-15 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "e1a2b3c4d5f6"
down_revision: Union[str, None] = "d7a1b2c3e4f5"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create user_job_applications table."""
    op.create_table(
        "user_job_applications",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("resume_id", sa.UUID(), nullable=False),
        sa.Column("job_listing_id", sa.String(length=50), nullable=False),
        sa.Column(
            "application_status",
            sa.String(length=20),
            nullable=False,
            server_default="not_applied",
        ),
        sa.Column(
            "created_at",
            sa.DateTime(),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "user_id",
            "resume_id",
            "job_listing_id",
            name="uniq_uja_user_resume_job",
        ),
    )
    op.create_index("idx_uja_user", "user_job_applications", ["user_id"])
    op.create_index("idx_uja_resume", "user_job_applications", ["resume_id"])


def downgrade() -> None:
    """Drop user_job_applications table."""
    op.drop_index("idx_uja_resume", table_name="user_job_applications")
    op.drop_index("idx_uja_user", table_name="user_job_applications")
    op.drop_table("user_job_applications")

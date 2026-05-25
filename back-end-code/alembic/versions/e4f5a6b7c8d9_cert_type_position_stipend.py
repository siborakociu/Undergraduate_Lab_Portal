"""add cert_type to labs; stipend + max_students to positions

Revision ID: e4f5a6b7c8d9
Revises: d3e4f5a6b7c8
Create Date: 2026-05-21 19:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'e4f5a6b7c8d9'
down_revision: Union[str, None] = 'd3e4f5a6b7c8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('labs', sa.Column('cert_type', sa.String(length=80), nullable=True))
    op.add_column('positions', sa.Column('stipend_per_student', sa.Numeric(12, 2), nullable=True))
    op.add_column('positions', sa.Column('max_students', sa.Integer(), nullable=True))


def downgrade() -> None:
    op.drop_column('positions', 'max_students')
    op.drop_column('positions', 'stipend_per_student')
    op.drop_column('labs', 'cert_type')

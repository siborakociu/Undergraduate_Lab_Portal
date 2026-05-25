"""add funding_requests.lab_id

Revision ID: c2a3b4d5e6f7
Revises: b1f2c3d4e5a6
Create Date: 2026-05-21 17:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'c2a3b4d5e6f7'
down_revision: Union[str, None] = 'b1f2c3d4e5a6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('funding_requests', sa.Column('lab_id', sa.UUID(), nullable=True))
    op.create_foreign_key(
        'fk_funding_requests_lab_id', 'funding_requests', 'labs',
        ['lab_id'], ['id'],
    )


def downgrade() -> None:
    op.drop_constraint('fk_funding_requests_lab_id', 'funding_requests', type_='foreignkey')
    op.drop_column('funding_requests', 'lab_id')

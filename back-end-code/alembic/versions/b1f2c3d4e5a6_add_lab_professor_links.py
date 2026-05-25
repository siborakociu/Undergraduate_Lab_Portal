"""add lab.professor_id and position.lab_id

Revision ID: b1f2c3d4e5a6
Revises: a90f623786c2
Create Date: 2026-05-21 16:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'b1f2c3d4e5a6'
down_revision: Union[str, None] = 'a90f623786c2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('labs', sa.Column('professor_id', sa.UUID(), nullable=True))
    op.create_foreign_key(
        'fk_labs_professor_id', 'labs', 'professors',
        ['professor_id'], ['id'],
    )
    op.add_column('positions', sa.Column('lab_id', sa.UUID(), nullable=True))
    op.create_foreign_key(
        'fk_positions_lab_id', 'positions', 'labs',
        ['lab_id'], ['id'],
    )


def downgrade() -> None:
    op.drop_constraint('fk_positions_lab_id', 'positions', type_='foreignkey')
    op.drop_column('positions', 'lab_id')
    op.drop_constraint('fk_labs_professor_id', 'labs', type_='foreignkey')
    op.drop_column('labs', 'professor_id')

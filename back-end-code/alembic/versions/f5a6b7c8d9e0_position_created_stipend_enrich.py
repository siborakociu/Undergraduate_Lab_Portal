"""positions.created_at + enrich stipends with position/lab/purpose

Revision ID: f5a6b7c8d9e0
Revises: e4f5a6b7c8d9
Create Date: 2026-05-21 20:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'f5a6b7c8d9e0'
down_revision: Union[str, None] = 'e4f5a6b7c8d9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        'positions',
        sa.Column('created_at', sa.DateTime(), nullable=True, server_default=sa.func.now()),
    )
    op.alter_column('stipends', 'student_id', nullable=True)
    op.add_column('stipends', sa.Column('position_id', sa.UUID(), nullable=True))
    op.add_column('stipends', sa.Column('lab_id', sa.UUID(), nullable=True))
    op.add_column('stipends', sa.Column('purpose', sa.Text(), nullable=True))
    op.add_column('stipends', sa.Column('submitted_at', sa.DateTime(), nullable=True, server_default=sa.func.now()))
    op.create_foreign_key('fk_stipends_position_id', 'stipends', 'positions', ['position_id'], ['id'])
    op.create_foreign_key('fk_stipends_lab_id', 'stipends', 'labs', ['lab_id'], ['id'])


def downgrade() -> None:
    op.drop_constraint('fk_stipends_lab_id', 'stipends', type_='foreignkey')
    op.drop_constraint('fk_stipends_position_id', 'stipends', type_='foreignkey')
    op.drop_column('stipends', 'submitted_at')
    op.drop_column('stipends', 'purpose')
    op.drop_column('stipends', 'lab_id')
    op.drop_column('stipends', 'position_id')
    op.alter_column('stipends', 'student_id', nullable=False)
    op.drop_column('positions', 'created_at')

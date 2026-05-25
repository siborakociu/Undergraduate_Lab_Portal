"""programs description/gpa + program_applications table

Revision ID: d3e4f5a6b7c8
Revises: c2a3b4d5e6f7
Create Date: 2026-05-21 18:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = 'd3e4f5a6b7c8'
down_revision: Union[str, None] = 'c2a3b4d5e6f7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('international_programs', sa.Column('description', sa.Text(), nullable=True))
    op.add_column('international_programs', sa.Column('required_gpa', sa.Numeric(3, 2), nullable=True))

    status_enum = postgresql.ENUM(
        'SUBMITTED', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED', 'WITHDRAWN',
        name='applicationstatus',
        create_type=False,
    )

    op.create_table(
        'program_applications',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('student_id', sa.UUID(), nullable=False),
        sa.Column('program_id', sa.UUID(), nullable=False),
        sa.Column('status', status_enum, nullable=True),
        sa.Column('submitted_at', sa.DateTime(), nullable=False),
        sa.Column('decision_at', sa.DateTime(), nullable=True),
        sa.Column('decision_notes', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['student_id'], ['student_profiles.id']),
        sa.ForeignKeyConstraint(['program_id'], ['international_programs.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('student_id', 'program_id', name='uq_program_app_student_program'),
    )


def downgrade() -> None:
    op.drop_table('program_applications')
    op.drop_column('international_programs', 'required_gpa')
    op.drop_column('international_programs', 'description')

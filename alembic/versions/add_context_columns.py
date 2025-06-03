"""Add context columns to transitiontable

Revision ID: add_context_columns
Revises: fb19bfbf2e7e
Create Date: 2025-06-03 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'add_context_columns'
down_revision: Union[str, None] = 'fb19bfbf2e7e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add new columns to transitiontable
    op.add_column('transitiontable', sa.Column('pitch_result', sa.String(), nullable=True))
    op.add_column('transitiontable', sa.Column('play_result', sa.String(), nullable=True))
    op.add_column('transitiontable', sa.Column('location', sa.String(), nullable=True))


def downgrade() -> None:
    # Remove the columns
    op.drop_column('transitiontable', 'location')
    op.drop_column('transitiontable', 'play_result')
    op.drop_column('transitiontable', 'pitch_result') 
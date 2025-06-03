"""Add hitter handedness to transitiontable

Revision ID: add_hitter_handedness
Revises: add_context_columns
Create Date: 2025-06-03 11:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'add_hitter_handedness'
down_revision: Union[str, None] = 'add_context_columns'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add hitter_handedness column to transitiontable
    op.add_column('transitiontable', sa.Column('hitter_handedness', sa.String(), nullable=False, server_default='R'))


def downgrade() -> None:
    # Remove the column
    op.drop_column('transitiontable', 'hitter_handedness') 
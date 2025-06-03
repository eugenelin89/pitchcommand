"""Add hitter handedness to pitch table

Revision ID: add_hitter_handedness_to_pitch
Revises: add_hitter_handedness
Create Date: 2025-06-03 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'add_hitter_handedness_to_pitch'
down_revision: Union[str, None] = 'add_hitter_handedness'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add hitter_handedness column to pitch table
    op.add_column('pitch', sa.Column('hitter_handedness', sa.String(), nullable=False, server_default='R'))


def downgrade() -> None:
    # Remove the column
    op.drop_column('pitch', 'hitter_handedness') 
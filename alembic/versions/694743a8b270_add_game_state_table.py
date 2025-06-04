"""add_game_state_table

Revision ID: 694743a8b270
Revises: 8c645130133f
Create Date: 2024-03-19 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '694743a8b270'
down_revision: Union[str, None] = '8c645130133f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create game_state table
    op.create_table(
        'game_state',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('game_id', sa.String(), nullable=False),
        sa.Column('inning_id', sa.String(), nullable=False),
        sa.Column('outs', sa.Integer(), nullable=False, default=0),
        sa.Column('count', sa.String(), nullable=False, default='0-0'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['game_id'], ['game.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['inning_id'], ['inning.id'], ondelete='CASCADE')
    )
    
    # Create indexes
    op.create_index(op.f('ix_game_state_game_id'), 'game_state', ['game_id'], unique=True)
    op.create_index(op.f('ix_game_state_inning_id'), 'game_state', ['inning_id'], unique=False)


def downgrade() -> None:
    # Drop indexes
    op.drop_index(op.f('ix_game_state_inning_id'), table_name='game_state')
    op.drop_index(op.f('ix_game_state_game_id'), table_name='game_state')
    
    # Drop table
    op.drop_table('game_state')

"""fix_game_state_column_types

Revision ID: a724b53d6687
Revises: 694743a8b270
Create Date: 2025-06-04 21:55:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a724b53d6687'
down_revision: Union[str, None] = '694743a8b270'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Drop existing indexes and foreign key constraints
    op.drop_index('ix_game_state_inning_id', table_name='game_state')
    op.drop_index('ix_game_state_game_id', table_name='game_state')
    
    # Create a new table with correct column types
    op.create_table(
        'game_state_new',
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
    op.create_index(op.f('ix_game_state_game_id'), 'game_state_new', ['game_id'], unique=True)
    op.create_index(op.f('ix_game_state_inning_id'), 'game_state_new', ['inning_id'], unique=False)
    
    # Drop the old table and rename the new one
    op.drop_table('game_state')
    op.rename_table('game_state_new', 'game_state')


def downgrade() -> None:
    # Drop existing indexes and foreign key constraints
    op.drop_index('ix_game_state_inning_id', table_name='game_state')
    op.drop_index('ix_game_state_game_id', table_name='game_state')
    
    # Create a new table with original column types
    op.create_table(
        'game_state_old',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('game_id', sa.Integer(), nullable=False),
        sa.Column('inning_id', sa.Integer(), nullable=False),
        sa.Column('outs', sa.Integer(), nullable=False, default=0),
        sa.Column('count', sa.String(), nullable=False, default='0-0'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['game_id'], ['game.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['inning_id'], ['inning.id'], ondelete='CASCADE')
    )
    
    # Create indexes
    op.create_index(op.f('ix_game_state_game_id'), 'game_state_old', ['game_id'], unique=True)
    op.create_index(op.f('ix_game_state_inning_id'), 'game_state_old', ['inning_id'], unique=False)
    
    # Drop the new table and rename the old one
    op.drop_table('game_state')
    op.rename_table('game_state_old', 'game_state')

"""Add date and description to game model

Revision ID: eda9e660b7e9
Revises: 010b8f8b9b7a
Create Date: 2024-03-19 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'eda9e660b7e9'
down_revision: Union[str, None] = '010b8f8b9b7a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create new table with updated schema
    op.create_table(
        'game_new',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('home_team', sa.String(), nullable=False),
        sa.Column('away_team', sa.String(), nullable=False),
        sa.Column('date', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.PrimaryKeyConstraint('id')
    )

    # Copy data from old table to new table
    op.execute('''
        INSERT INTO game_new (id, home_team, away_team, date, description, created_at)
        SELECT id, home_team, away_team, COALESCE(date, CURRENT_TIMESTAMP), NULL, created_at
        FROM game
    ''')

    # Drop old table
    op.drop_table('game')

    # Rename new table to original name
    op.rename_table('game_new', 'game')

    # Create indexes
    op.create_index(op.f('ix_game_id'), 'game', ['id'], unique=False)


def downgrade() -> None:
    # Create old table
    op.create_table(
        'game_old',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('home_team', sa.String(), nullable=True),
        sa.Column('away_team', sa.String(), nullable=True),
        sa.Column('date', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )

    # Copy data back
    op.execute('''
        INSERT INTO game_old (id, home_team, away_team, date, created_at)
        SELECT id, home_team, away_team, date, created_at
        FROM game
    ''')

    # Drop new table
    op.drop_table('game')

    # Rename old table back
    op.rename_table('game_old', 'game')

    # Create indexes
    op.create_index(op.f('ix_game_id'), 'game', ['id'], unique=False)

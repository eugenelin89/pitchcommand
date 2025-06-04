"""initial schema

Revision ID: initial_schema
Revises: 
Create Date: 2024-03-19 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create pitcher table
    op.create_table('pitcher',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('name', sa.String(), nullable=True),
        sa.Column('team', sa.String(), nullable=True),
        sa.Column('number', sa.Integer(), nullable=True),
        sa.Column('hand', sa.String(), nullable=True),
        sa.Column('age', sa.Integer(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_pitcher_id'), 'pitcher', ['id'], unique=False)
    op.create_index(op.f('ix_pitcher_name'), 'pitcher', ['name'], unique=False)

    # Create game table
    op.create_table('game',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('home_team', sa.String(), nullable=False),
        sa.Column('away_team', sa.String(), nullable=False),
        sa.Column('date', sa.DateTime(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_game_id'), 'game', ['id'], unique=False)

    # Create inning table
    op.create_table('inning',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('game_id', sa.String(), nullable=True),
        sa.Column('inning_number', sa.Integer(), nullable=True),
        sa.Column('half', sa.Enum('top', 'bottom', name='inninghalf'), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['game_id'], ['game.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_inning_id'), 'inning', ['id'], unique=False)

    # Create pitch table
    op.create_table('pitch',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('pitcher_id', sa.String(), nullable=True),
        sa.Column('game_id', sa.String(), nullable=True),
        sa.Column('inning_id', sa.String(), nullable=True),
        sa.Column('sequence_number', sa.Integer(), nullable=True),
        sa.Column('count', sa.String(), nullable=True),
        sa.Column('outs', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('pitch_type', sa.Enum('FB', 'CB', name='pitchtype'), nullable=True),
        sa.Column('location', sa.String(), nullable=True),
        sa.Column('pitch_result', sa.Enum('swinging_strike', 'called_strike', 'foul', 'ball', 'in_play', name='pitchresult'), nullable=True),
        sa.Column('play_result', sa.Enum('groundout', 'flyout', 'single', 'double', 'triple', 'homerun', 'error', 'sacrifice', name='playresult'), nullable=True),
        sa.Column('hitter_handedness', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['game_id'], ['game.id'], ),
        sa.ForeignKeyConstraint(['inning_id'], ['inning.id'], ),
        sa.ForeignKeyConstraint(['pitcher_id'], ['pitcher.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_pitch_id'), 'pitch', ['id'], unique=False)

    # Create transition_table
    op.create_table('transition_table',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('pitcher_id', sa.String(), nullable=True),
        sa.Column('count', sa.String(), nullable=True),
        sa.Column('last_pitch', sa.String(), nullable=True),
        sa.Column('next_pitch', sa.String(), nullable=True),
        sa.Column('pitch_result', sa.String(), nullable=True),
        sa.Column('play_result', sa.String(), nullable=True),
        sa.Column('location', sa.String(), nullable=True),
        sa.Column('hitter_handedness', sa.String(), nullable=True),
        sa.Column('transition_count', sa.Integer(), nullable=True),
        sa.Column('probability', sa.Float(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['pitcher_id'], ['pitcher.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_transition_table_id'), 'transition_table', ['id'], unique=False)

    # Create prediction_history
    op.create_table('prediction_history',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('pitcher_id', sa.String(), nullable=True),
        sa.Column('predicted_pitch', sa.String(), nullable=True),
        sa.Column('actual_pitch', sa.String(), nullable=True),
        sa.Column('was_correct', sa.Boolean(), nullable=True),
        sa.Column('count', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['pitcher_id'], ['pitcher.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_prediction_history_id'), 'prediction_history', ['id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_prediction_history_id'), table_name='prediction_history')
    op.drop_table('prediction_history')
    op.drop_index(op.f('ix_transition_table_id'), table_name='transition_table')
    op.drop_table('transition_table')
    op.drop_index(op.f('ix_pitch_id'), table_name='pitch')
    op.drop_table('pitch')
    op.drop_index(op.f('ix_inning_id'), table_name='inning')
    op.drop_table('inning')
    op.drop_index(op.f('ix_game_id'), table_name='game')
    op.drop_table('game')
    op.drop_index(op.f('ix_pitcher_name'), table_name='pitcher')
    op.drop_index(op.f('ix_pitcher_id'), table_name='pitcher')
    op.drop_table('pitcher') 
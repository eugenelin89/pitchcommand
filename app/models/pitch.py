from datetime import datetime
from sqlalchemy import Column, DateTime, ForeignKey, String, Enum, Integer
from sqlalchemy.orm import relationship
import enum

from app.db.base_class import Base

class PitchType(str, enum.Enum):
    FB = "FB"  # Fastball
    CB = "CB"  # Curveball

class PitchResult(str, enum.Enum):
    SWINGING_STRIKE = "swinging_strike"
    CALLED_STRIKE = "called_strike"
    FOUL = "foul"
    BALL = "ball"
    IN_PLAY = "in_play"

class PlayResult(str, enum.Enum):
    GROUNDOUT = "groundout"
    FLYOUT = "flyout"
    SINGLE = "single"
    DOUBLE = "double"
    TRIPLE = "triple"
    HOMERUN = "homerun"
    ERROR = "error"
    SACRIFICE = "sacrifice"

class Pitch(Base):
    __tablename__ = "pitch"
    
    id = Column(String, primary_key=True, index=True)
    pitcher_id = Column(String, ForeignKey("pitcher.id"))
    game_id = Column(String, ForeignKey("game.id"))
    inning_id = Column(String, ForeignKey("inning.id"))
    sequence_number = Column(Integer)  # Sequence number within the game
    count = Column(String)
    pitch_type = Column(Enum(PitchType))
    location = Column(String, nullable=True)
    pitch_result = Column(Enum(PitchResult))
    play_result = Column(Enum(PlayResult), nullable=True)
    hitter_handedness = Column(String)  # 'L' for lefty, 'R' for righty
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships - many-to-one should use select
    pitcher = relationship("Pitcher", back_populates="pitches", lazy="select")
    game = relationship("Game", back_populates="pitches", lazy="select")
    inning = relationship("Inning", back_populates="pitches", lazy="select")

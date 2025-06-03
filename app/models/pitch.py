from datetime import datetime
from sqlalchemy import Column, DateTime, ForeignKey, String, Enum
from sqlalchemy.orm import relationship
import enum

from app.db.base import Base

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
    id = Column(String, primary_key=True, index=True)
    pitcher_id = Column(String, ForeignKey("pitcher.id"))
    count = Column(String)
    pitch_type = Column(Enum(PitchType))
    location = Column(String, nullable=True)
    pitch_result = Column(Enum(PitchResult))
    play_result = Column(Enum(PlayResult), nullable=True)
    hitter_handedness = Column(String)  # 'L' for lefty, 'R' for righty
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship
    pitcher = relationship("Pitcher", back_populates="pitches")

from datetime import datetime
from sqlalchemy import Column, DateTime, ForeignKey, String, Float, JSON, Integer, Boolean
from sqlalchemy.orm import relationship

from app.db.base_class import Base

class TransitionTable(Base):
    __tablename__ = "transition_table"
    
    id = Column(String, primary_key=True, index=True)
    pitcher_id = Column(String, ForeignKey("pitcher.id"))
    count = Column(String)  # 'global' or specific count like '0-0'
    last_pitch = Column(String)
    next_pitch = Column(String)
    pitch_result = Column(String, nullable=True)  # e.g., 'swinging_strike', 'ball', etc.
    play_result = Column(String, nullable=True)   # e.g., 'flyout', 'single', etc.
    location = Column(String, nullable=True)      # e.g., 'high_in', 'low_away', etc.
    hitter_handedness = Column(String)            # 'L' for lefty, 'R' for righty
    transition_count = Column(Integer, default=0)
    probability = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship - many-to-one should use select
    pitcher = relationship("Pitcher", back_populates="transition_tables", lazy="select")

class PredictionHistory(Base):
    __tablename__ = "prediction_history"
    
    id = Column(String, primary_key=True, index=True)
    pitcher_id = Column(String, ForeignKey("pitcher.id"))
    predicted_pitch = Column(String)
    actual_pitch = Column(String)
    was_correct = Column(Boolean)
    count = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship - many-to-one should use select
    pitcher = relationship("Pitcher", back_populates="prediction_history", lazy="select") 
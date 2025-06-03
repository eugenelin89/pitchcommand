from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from app.db.base import Base


class Pitcher(Base):
    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    team = Column(String)
    number = Column(Integer)
    hand = Column(String)  # L or R
    age = Column(Integer)

    # Relationships
    pitches = relationship("Pitch", back_populates="pitcher")
    transition_tables = relationship("TransitionTable", back_populates="pitcher")
    prediction_history = relationship("PredictionHistory", back_populates="pitcher")

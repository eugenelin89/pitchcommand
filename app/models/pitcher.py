from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class Pitcher(Base):
    __tablename__ = "pitcher"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    team = Column(String)
    number = Column(Integer)
    hand = Column(String)  # L or R
    age = Column(Integer)

    # Relationships - collections should use dynamic
    pitches = relationship("Pitch", back_populates="pitcher", lazy="dynamic")
    transition_tables = relationship("TransitionTable", back_populates="pitcher", lazy="dynamic")
    prediction_history = relationship("PredictionHistory", back_populates="pitcher", lazy="dynamic")

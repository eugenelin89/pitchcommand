from datetime import datetime
from sqlalchemy import Column, DateTime, ForeignKey, String, Integer
from sqlalchemy.orm import relationship

from app.db.base_class import Base

class GameState(Base):
    __tablename__ = "game_state"
    
    id = Column(String, primary_key=True, index=True)
    game_id = Column(String, ForeignKey("game.id"), unique=True)
    inning_id = Column(String, ForeignKey("inning.id"))
    outs = Column(Integer, default=0)
    count = Column(String, default="0-0")  # e.g., "1-2"
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    game = relationship("Game", back_populates="game_state")
    inning = relationship("Inning", back_populates="game_state", lazy="select") 
from datetime import datetime
from sqlalchemy import Column, DateTime, String, ForeignKey, Integer, Enum
from sqlalchemy.orm import relationship
import enum

from app.db.base_class import Base

class InningHalf(str, enum.Enum):
    TOP = "top"
    BOTTOM = "bottom"

class Inning(Base):
    __tablename__ = "inning"
    
    id = Column(String, primary_key=True, index=True)
    game_id = Column(String, ForeignKey("game.id"))
    inning_number = Column(Integer)  # 1-9 for regular innings, 10+ for extra innings
    half = Column(Enum(InningHalf))  # top or bottom
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships - many-to-one should use select, collections should use dynamic
    game = relationship("Game", back_populates="innings", lazy="select")
    pitches = relationship("Pitch", back_populates="inning", lazy="dynamic", cascade="all, delete-orphan")
    game_state = relationship("GameState", back_populates="inning", uselist=False)

    def __repr__(self):
        return f"<Inning(id={self.id}, game_id={self.game_id}, inning_number={self.inning_number}, half={self.half})>" 
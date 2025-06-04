from datetime import datetime
from sqlalchemy import Column, DateTime, String, ForeignKey, Text
from sqlalchemy.orm import relationship

from app.db.base_class import Base

class Game(Base):
    __tablename__ = "game"
    
    id = Column(String, primary_key=True, index=True)
    home_team = Column(String, nullable=False)
    away_team = Column(String, nullable=False)
    date = Column(DateTime, nullable=False, default=datetime.utcnow)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships - collections should use dynamic
    innings = relationship("Inning", back_populates="game", lazy="dynamic", cascade="all, delete-orphan")
    pitches = relationship("Pitch", back_populates="game", lazy="dynamic", cascade="all, delete-orphan") 
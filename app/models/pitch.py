from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, String
from sqlalchemy.orm import relationship

from app.db.base import Base


class Pitch(Base):
    id = Column(String, primary_key=True, index=True)
    pitcher_id = Column(String, ForeignKey("pitcher.id"))
    count = Column(String)
    pitch_type = Column(String)
    location = Column(String, nullable=True)
    result = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship
    pitcher = relationship("Pitcher", back_populates="pitches")

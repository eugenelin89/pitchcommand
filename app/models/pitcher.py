from sqlalchemy import Column, Integer, String
from app.db.base import Base

class Pitcher(Base):
    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    team = Column(String)
    number = Column(Integer)
    hand = Column(String)  # L or R
    age = Column(Integer)

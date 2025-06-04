from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel

from app.schemas.pitch import Pitch

class GameBase(BaseModel):
    home_team: str
    away_team: str
    date: datetime
    description: Optional[str] = None

class GameCreate(GameBase):
    pass

class Game(GameBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True

class GameWithPitches(Game):
    pitches: List[Pitch] = [] 
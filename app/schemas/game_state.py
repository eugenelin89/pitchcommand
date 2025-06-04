from typing import Optional
from pydantic import BaseModel
from datetime import datetime

from .inning import Inning

class GameStateBase(BaseModel):
    game_id: str
    inning_id: str
    outs: int = 0
    count: str = "0-0"

class GameStateCreate(GameStateBase):
    pass

class GameStateUpdate(BaseModel):
    inning_id: Optional[str] = None
    outs: Optional[int] = None
    count: Optional[str] = None

class GameState(GameStateBase):
    id: str
    created_at: datetime
    updated_at: datetime
    inning: Inning

    class Config:
        from_attributes = True 
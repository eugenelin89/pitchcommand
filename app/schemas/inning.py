from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field

from app.schemas.pitch import Pitch, InningHalf

class InningBase(BaseModel):
    game_id: str
    inning_number: int = Field(..., ge=1)  # 1-9 for regular innings, 10+ for extra innings
    half: InningHalf

class InningCreate(InningBase):
    pass

class Inning(InningBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True

class InningWithPitches(Inning):
    pitches: List[Pitch] = [] 
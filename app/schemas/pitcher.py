from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class PitcherBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    team: str = Field(..., min_length=1, max_length=100)
    number: int = Field(..., ge=0, le=99)
    hand: str = Field(..., pattern="^[RL]$")
    age: int = Field(..., ge=0, le=100)


class PitcherCreate(PitcherBase):
    pass


class Pitcher(PitcherBase):
    id: str
    model_config = ConfigDict(from_attributes=True)

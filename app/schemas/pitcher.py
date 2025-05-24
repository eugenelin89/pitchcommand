from typing import Optional

from pydantic import BaseModel


class PitcherBase(BaseModel):
    name: str
    team: str
    number: int
    hand: str
    age: int


class PitcherCreate(PitcherBase):
    pass


class Pitcher(PitcherBase):
    id: str

    class Config:
        orm_mode = True

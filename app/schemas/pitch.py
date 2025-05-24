from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class PitchBase(BaseModel):
    pitcher_id: str
    count: str
    pitch_type: str
    location: Optional[str] = None
    result: str


class PitchCreate(PitchBase):
    pass


class Pitch(PitchBase):
    id: str
    created_at: datetime

    class Config:
        orm_mode = True


class PredictionRequest(BaseModel):
    pitcher_id: str
    last_n_pitches: list[str]
    count: str


class Prediction(BaseModel):
    pitch_type: str
    confidence: float


class PredictionResponse(BaseModel):
    predictions: list[Prediction]

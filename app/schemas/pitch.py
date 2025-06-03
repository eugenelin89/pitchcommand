from datetime import datetime
from typing import Optional, List
from enum import Enum

from pydantic import BaseModel, Field


class PitchType(str, Enum):
    FB = "FB"  # Fastball
    CB = "CB"  # Curveball


class PitchResult(str, Enum):
    SWINGING_STRIKE = "swinging_strike"
    CALLED_STRIKE = "called_strike"
    FOUL = "foul"
    BALL = "ball"
    IN_PLAY = "in_play"


class PlayResult(str, Enum):
    GROUNDOUT = "groundout"
    FLYOUT = "flyout"
    SINGLE = "single"
    DOUBLE = "double"
    TRIPLE = "triple"
    HOMERUN = "homerun"
    ERROR = "error"
    SACRIFICE = "sacrifice"


class PitchBase(BaseModel):
    pitcher_id: str
    count: str = Field(..., pattern=r"^[0-3]-[0-2]$")  # Validates count format (e.g., 1-2)
    pitch_type: PitchType
    location: Optional[str] = None
    pitch_result: PitchResult
    play_result: Optional[PlayResult] = None
    hitter_handedness: str = Field(..., pattern=r"^[LR]$")  # L for lefty, R for righty


class PitchCreate(PitchBase):
    pass


class Pitch(PitchBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True


class PredictionRequest(BaseModel):
    pitcher_id: str
    last_n_pitches: List[PitchType]
    count: str = Field(..., pattern=r"^[0-3]-[0-2]$")
    last_pitch_result: Optional[PitchResult] = None
    last_play_result: Optional[PlayResult] = None
    last_location: Optional[str] = None
    hitter_handedness: str = Field(..., pattern=r"^[LR]$")  # L for lefty, R for righty


class Prediction(BaseModel):
    pitch_type: PitchType
    confidence: float = Field(..., ge=0.0, le=1.0)


class PredictionResponse(BaseModel):
    predictions: List[Prediction]


class SessionSummary(BaseModel):
    pitch_distribution: dict[PitchType, int]
    prediction_accuracy: float = Field(..., ge=0.0, le=1.0)

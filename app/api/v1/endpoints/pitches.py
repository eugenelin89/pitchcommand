import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.pitch import Pitch as PitchModel
from app.schemas.pitch import Pitch, PitchCreate, SessionSummary
from app.services.prediction import PredictionService

router = APIRouter()
prediction_service = PredictionService()


@router.post("/", response_model=Pitch)
async def create_pitch(*, db: Session = Depends(get_db), pitch_in: PitchCreate):
    pitch = PitchModel(id=str(uuid.uuid4()), **pitch_in.dict())
    db.add(pitch)
    db.commit()
    db.refresh(pitch)

    # Update prediction model
    await prediction_service.update_model(
        pitcher_id=pitch.pitcher_id,
        count=pitch.count,
        last_pitch=pitch.pitch_type.value,  # Convert enum to string
        next_pitch=pitch.pitch_type.value,  # Convert enum to string
        pitch_result=pitch.pitch_result,
        play_result=pitch.play_result,
    )

    return pitch


@router.get("/pitcher/{pitcher_id}", response_model=List[Pitch])
def get_pitcher_pitches(
    *, db: Session = Depends(get_db), pitcher_id: str, skip: int = 0, limit: int = 100
):
    pitches = (
        db.query(PitchModel)
        .filter(PitchModel.pitcher_id == pitcher_id)
        .offset(skip)
        .limit(limit)
        .all()
    )
    return pitches


@router.get("/pitcher/{pitcher_id}/summary", response_model=SessionSummary)
async def get_pitcher_summary(pitcher_id: str):
    return prediction_service.get_session_summary(pitcher_id)

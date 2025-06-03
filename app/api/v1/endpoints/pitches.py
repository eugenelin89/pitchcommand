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
async def create_pitch(
    pitch: PitchCreate,
    db: Session = Depends(get_db)
):
    # Create the pitch
    db_pitch = PitchModel(
        id=str(uuid.uuid4()),
        pitcher_id=pitch.pitcher_id,
        count=pitch.count,
        pitch_type=pitch.pitch_type,
        location=pitch.location,
        pitch_result=pitch.pitch_result,
        play_result=pitch.play_result,
        hitter_handedness=pitch.hitter_handedness
    )
    db.add(db_pitch)
    db.commit()
    db.refresh(db_pitch)
    
    # Get the last pitch for this pitcher
    last_pitch = db.query(PitchModel).filter(
        PitchModel.pitcher_id == pitch.pitcher_id
    ).order_by(PitchModel.created_at.desc()).offset(1).first()
    
    # Update the prediction model
    if last_pitch:
        await prediction_service.update_model(
            pitcher_id=pitch.pitcher_id,
            count=pitch.count,
            last_pitch=last_pitch.pitch_type,
            next_pitch=pitch.pitch_type,
            pitch_result=pitch.pitch_result,
            play_result=pitch.play_result,
            location=pitch.location,
            hitter_handedness=pitch.hitter_handedness
        )
    
    return db_pitch


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

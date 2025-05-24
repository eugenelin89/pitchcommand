import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.pitcher import Pitcher as PitcherModel
from app.schemas.pitcher import Pitcher, PitcherCreate

router = APIRouter()


@router.get("/", response_model=List[Pitcher])
def get_pitchers(db: Session = Depends(get_db), skip: int = 0, limit: int = 100):
    pitchers = db.query(PitcherModel).offset(skip).limit(limit).all()
    return pitchers


@router.post("/", response_model=Pitcher)
def create_pitcher(*, db: Session = Depends(get_db), pitcher_in: PitcherCreate):
    pitcher = PitcherModel(id=str(uuid.uuid4()), **pitcher_in.dict())
    db.add(pitcher)
    db.commit()
    db.refresh(pitcher)
    return pitcher


@router.get("/{pitcher_id}", response_model=Pitcher)
def get_pitcher(*, db: Session = Depends(get_db), pitcher_id: str):
    pitcher = db.query(PitcherModel).filter(PitcherModel.id == pitcher_id).first()
    if not pitcher:
        raise HTTPException(status_code=404, detail="Pitcher not found")
    return pitcher

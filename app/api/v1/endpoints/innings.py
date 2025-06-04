import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.inning import Inning as InningModel
from app.models.game import Game as GameModel
from app.schemas.inning import Inning, InningCreate, InningWithPitches

router = APIRouter()

@router.post("/", response_model=Inning)
def create_inning(
    inning: InningCreate,
    db: Session = Depends(get_db)
):
    # Verify game exists
    game = db.query(GameModel).filter(GameModel.id == inning.game_id).first()
    if game is None:
        raise HTTPException(status_code=404, detail="Game not found")
    
    # Check if inning already exists
    existing_inning = db.query(InningModel).filter(
        InningModel.game_id == inning.game_id,
        InningModel.inning_number == inning.inning_number,
        InningModel.half == inning.half
    ).first()
    
    if existing_inning:
        raise HTTPException(
            status_code=400,
            detail=f"Inning {inning.inning_number} {inning.half} already exists for this game"
        )
    
    db_inning = InningModel(
        id=str(uuid.uuid4()),
        game_id=inning.game_id,
        inning_number=inning.inning_number,
        half=inning.half
    )
    db.add(db_inning)
    db.commit()
    db.refresh(db_inning)
    return db_inning

@router.get("/game/{game_id}", response_model=List[Inning])
def get_game_innings(
    game_id: str,
    db: Session = Depends(get_db)
):
    # Verify game exists
    game = db.query(GameModel).filter(GameModel.id == game_id).first()
    if game is None:
        raise HTTPException(status_code=404, detail="Game not found")
    
    innings = db.query(InningModel).filter(
        InningModel.game_id == game_id
    ).order_by(
        InningModel.inning_number,
        InningModel.half
    ).all()
    return innings

@router.get("/{inning_id}", response_model=InningWithPitches)
def get_inning(
    inning_id: str,
    db: Session = Depends(get_db)
):
    inning = db.query(InningModel).filter(InningModel.id == inning_id).first()
    if inning is None:
        raise HTTPException(status_code=404, detail="Inning not found")
    return inning 
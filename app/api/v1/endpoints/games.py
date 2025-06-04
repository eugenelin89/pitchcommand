import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.game import Game as GameModel
from app.models.inning import Inning as InningModel
from app.schemas.game import Game, GameCreate, GameWithPitches
from app.schemas.inning import Inning

router = APIRouter()

@router.post("/", response_model=Game)
def create_game(
    game: GameCreate,
    db: Session = Depends(get_db)
):
    # Create the game
    db_game = GameModel(
        id=str(uuid.uuid4()),
        home_team=game.home_team,
        away_team=game.away_team,
        date=game.date,
        description=game.description
    )
    db.add(db_game)
    db.commit()
    db.refresh(db_game)

    # Create the first inning (top of 1st)
    first_inning = InningModel(
        id=str(uuid.uuid4()),
        game_id=db_game.id,
        inning_number=1,
        half='top'
    )
    db.add(first_inning)
    db.commit()
    db.refresh(db_game)
    return db_game

@router.get("/", response_model=List[Game])
def get_games(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    games = db.query(GameModel).offset(skip).limit(limit).all()
    return games

@router.get("/{game_id}", response_model=GameWithPitches)
def get_game(
    game_id: str,
    db: Session = Depends(get_db)
):
    game = db.query(GameModel).filter(GameModel.id == game_id).first()
    if game is None:
        raise HTTPException(status_code=404, detail="Game not found")
    return game

@router.get("/{game_id}/innings", response_model=List[Inning])
def get_game_innings(
    game_id: str,
    db: Session = Depends(get_db)
):
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

@router.post("/{game_id}/next-inning", response_model=Game)
def next_inning(
    game_id: str,
    db: Session = Depends(get_db)
):
    game = db.query(GameModel).filter(GameModel.id == game_id).first()
    if game is None:
        raise HTTPException(status_code=404, detail="Game not found")

    # Get the last inning
    last_inning = db.query(InningModel).filter(
        InningModel.game_id == game_id
    ).order_by(
        InningModel.inning_number.desc(),
        InningModel.half.desc()
    ).first()

    if not last_inning:
        # If no innings exist, create top of 1st
        new_inning = InningModel(
            id=str(uuid.uuid4()),
            game_id=game_id,
            inning_number=1,
            half='top'
        )
    else:
        # Determine next inning
        if last_inning.half == 'top':
            new_inning = InningModel(
                id=str(uuid.uuid4()),
                game_id=game_id,
                inning_number=last_inning.inning_number,
                half='bottom'
            )
        else:
            new_inning = InningModel(
                id=str(uuid.uuid4()),
                game_id=game_id,
                inning_number=last_inning.inning_number + 1,
                half='top'
            )

    db.add(new_inning)
    db.commit()
    db.refresh(game)
    return game

@router.post("/{game_id}/prev-inning", response_model=Game)
def prev_inning(
    game_id: str,
    db: Session = Depends(get_db)
):
    game = db.query(GameModel).filter(GameModel.id == game_id).first()
    if game is None:
        raise HTTPException(status_code=404, detail="Game not found")

    # Get the last inning
    last_inning = db.query(InningModel).filter(
        InningModel.game_id == game_id
    ).order_by(
        InningModel.inning_number.desc(),
        InningModel.half.desc()
    ).first()

    if last_inning:
        # Delete the last inning
        db.delete(last_inning)
        db.commit()
        db.refresh(game)

    return game 
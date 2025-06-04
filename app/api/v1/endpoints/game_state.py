import uuid
from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud, schemas
from app.api import deps
from app.models.game_state import GameState

router = APIRouter()

@router.get("/{game_id}", response_model=schemas.GameState)
def get_game_state(
    game_id: str,
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    Get game state by game ID.
    """
    game_state = crud.game_state.get_by_game_id(db, game_id=game_id)
    if not game_state:
        raise HTTPException(status_code=404, detail="Game state not found")
    return game_state

@router.post("/", response_model=schemas.GameState)
def create_game_state(
    *,
    db: Session = Depends(deps.get_db),
    game_state_in: schemas.GameStateCreate,
) -> Any:
    """
    Create new game state.
    """
    # Check if game state already exists for this game
    existing_state = crud.game_state.get_by_game_id(db, game_id=game_state_in.game_id)
    if existing_state:
        raise HTTPException(status_code=400, detail="Game state already exists for this game")
    
    # Create new game state with generated UUID
    db_game_state = GameState(
        id=str(uuid.uuid4()),
        game_id=game_state_in.game_id,
        inning_id=game_state_in.inning_id,
        outs=game_state_in.outs,
        count=game_state_in.count
    )
    db.add(db_game_state)
    db.commit()
    db.refresh(db_game_state)
    return db_game_state

@router.put("/{game_id}", response_model=schemas.GameState)
def update_game_state(
    *,
    db: Session = Depends(deps.get_db),
    game_id: str,
    game_state_in: schemas.GameStateUpdate,
) -> Any:
    """
    Update game state.
    """
    game_state = crud.game_state.get_by_game_id(db, game_id=game_id)
    if not game_state:
        raise HTTPException(status_code=404, detail="Game state not found")
    
    game_state = crud.game_state.update(db, db_obj=game_state, obj_in=game_state_in)
    return game_state 
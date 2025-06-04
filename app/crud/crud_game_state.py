from typing import Optional
from sqlalchemy.orm import Session

from app.crud.base import CRUDBase
from app.models.game_state import GameState
from app.schemas.game_state import GameStateCreate, GameStateUpdate

class CRUDGameState(CRUDBase[GameState, GameStateCreate, GameStateUpdate]):
    def get_by_game_id(self, db: Session, *, game_id: str) -> Optional[GameState]:
        return db.query(GameState).filter(GameState.game_id == game_id).first()

game_state = CRUDGameState(GameState) 
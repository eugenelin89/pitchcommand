from fastapi import APIRouter

from app.api.v1.endpoints import pitchers, pitches, predictions, games, innings, game_state

api_router = APIRouter()

api_router.include_router(pitchers.router, prefix="/pitchers", tags=["pitchers"])
api_router.include_router(pitches.router, prefix="/pitches", tags=["pitches"])
api_router.include_router(predictions.router, prefix="/predict", tags=["predictions"])
api_router.include_router(games.router, prefix="/games", tags=["games"])
api_router.include_router(innings.router, prefix="/innings", tags=["innings"])
api_router.include_router(game_state.router, prefix="/game-state", tags=["game-state"])

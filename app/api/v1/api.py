from fastapi import APIRouter

from app.api.v1.endpoints import pitchers, pitches, games, innings

api_router = APIRouter()
api_router.include_router(pitchers.router, prefix="/pitchers", tags=["pitchers"])
api_router.include_router(pitches.router, prefix="/pitches", tags=["pitches"])
api_router.include_router(games.router, prefix="/games", tags=["games"])
api_router.include_router(innings.router, prefix="/innings", tags=["innings"]) 
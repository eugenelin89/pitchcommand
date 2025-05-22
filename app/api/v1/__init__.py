from fastapi import APIRouter
from app.api.v1.endpoints import pitchers, pitches, predictions

api_router = APIRouter()

api_router.include_router(pitchers.router, prefix="/pitchers", tags=["pitchers"])
api_router.include_router(pitches.router, prefix="/pitches", tags=["pitches"])
api_router.include_router(predictions.router, prefix="/predict", tags=["predictions"])

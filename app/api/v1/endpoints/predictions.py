from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.pitch import PredictionRequest, PredictionResponse
from app.services.prediction import PredictionService

router = APIRouter()
prediction_service = PredictionService()


@router.post("/", response_model=PredictionResponse)
async def predict_pitch(*, request: PredictionRequest, db: Session = Depends(get_db)):
    # Validate pitcher exists
    from app.models.pitcher import Pitcher

    pitcher = db.query(Pitcher).filter(Pitcher.id == request.pitcher_id).first()
    if not pitcher:
        raise HTTPException(status_code=404, detail="Pitcher not found")

    # Get prediction
    return await prediction_service.predict(request)

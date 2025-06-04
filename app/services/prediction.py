from typing import Dict, List, Optional
import numpy as np
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func
from uuid import uuid4

from app.core.config import settings
from app.schemas.pitch import (
    Prediction,
    PredictionRequest,
    PredictionResponse,
    PitchType,
    PitchResult,
    PlayResult,
    SessionSummary,
)
from app.models.prediction import TransitionTable, PredictionHistory
from app.db.session import get_db
from app.models.pitcher import Pitcher
from app.models.pitch import Pitch


class PredictionService:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(PredictionService, cls).__new__(cls)
            cls._instance.pitch_types = [pt.value for pt in PitchType]
        return cls._instance

    def __init__(self):
        # Initialize only if not already initialized
        if not hasattr(self, 'pitch_types'):
            self.pitch_types = [pt.value for pt in PitchType]

    def _get_or_create_transition_table(
        self,
        db: Session,
        pitcher_id: str,
        count: str,
        last_pitch: str,
        next_pitch: str,
        pitch_result: Optional[str] = None,
        play_result: Optional[str] = None,
        location: Optional[str] = None,
        hitter_handedness: str = 'R'
    ) -> TransitionTable:
        # Try to find existing transition
        transition = db.query(TransitionTable).filter(
            TransitionTable.pitcher_id == pitcher_id,
            TransitionTable.count == count,
            TransitionTable.last_pitch == last_pitch,
            TransitionTable.next_pitch == next_pitch,
            TransitionTable.pitch_result == pitch_result,
            TransitionTable.play_result == play_result,
            TransitionTable.location == location,
            TransitionTable.hitter_handedness == hitter_handedness
        ).first()

        if not transition:
            # Create new transition
            transition = TransitionTable(
                id=str(uuid4()),
                pitcher_id=pitcher_id,
                count=count,
                last_pitch=last_pitch,
                next_pitch=next_pitch,
                pitch_result=pitch_result,
                play_result=play_result,
                location=location,
                hitter_handedness=hitter_handedness,
                transition_count=0,
                probability=1.0 / len(self.pitch_types)
            )
            db.add(transition)
            db.commit()
            db.refresh(transition)

        return transition

    def _update_transition_table(
        self,
        db: Session,
        pitcher_id: str,
        count: str,
        last_pitch: str,
        next_pitch: str,
        pitch_result: Optional[str] = None,
        play_result: Optional[str] = None,
        location: Optional[str] = None,
        hitter_handedness: str = 'R'
    ) -> None:
        """Update transition table with new pitch data."""
        # Get or create transition table entry
        transition = self._get_or_create_transition_table(
            db, pitcher_id, count, last_pitch, next_pitch,
            pitch_result, play_result, location, hitter_handedness
        )
        
        # Update transition count
        transition.transition_count += 1
        
        # Calculate total transitions from last_pitch with same context
        total_transitions = db.query(TransitionTable).filter(
            TransitionTable.pitcher_id == pitcher_id,
            TransitionTable.count == count,
            TransitionTable.last_pitch == last_pitch,
            TransitionTable.pitch_result == pitch_result,
            TransitionTable.play_result == play_result,
            TransitionTable.location == location,
            TransitionTable.hitter_handedness == hitter_handedness
        ).with_entities(func.sum(TransitionTable.transition_count)).scalar() or 0
        
        # Update probabilities for all transitions from last_pitch with same context
        transitions = db.query(TransitionTable).filter(
            TransitionTable.pitcher_id == pitcher_id,
            TransitionTable.count == count,
            TransitionTable.last_pitch == last_pitch,
            TransitionTable.pitch_result == pitch_result,
            TransitionTable.play_result == play_result,
            TransitionTable.location == location,
            TransitionTable.hitter_handedness == hitter_handedness
        ).all()
        
        # Handle division by zero case
        if total_transitions == 0:
            uniform_prob = 1.0 / len(self.pitch_types)
            for t in transitions:
                t.probability = uniform_prob
        else:
            for t in transitions:
                t.probability = t.transition_count / total_transitions
        
        # Update timestamp
        transition.updated_at = datetime.utcnow()
        
        db.commit()

    def _handle_edge_cases(self, request: PredictionRequest) -> Optional[List[Prediction]]:
        # Only handle the case of no pitch history
        if not request.last_n_pitches:
            return [
                Prediction(pitch_type=PitchType(pt), confidence=1.0 / len(self.pitch_types))
                for pt in self.pitch_types
            ]
        return None

    async def predict(self, request: PredictionRequest) -> PredictionResponse:
        # Check for edge cases
        edge_case_predictions = self._handle_edge_cases(request)
        if edge_case_predictions:
            return PredictionResponse(predictions=edge_case_predictions)

        db = next(get_db())
        last_pitch = request.last_n_pitches[-1]
        # Extract just the pitch type value from the enum string (e.g., 'PitchType.FB' -> 'FB')
        last_pitch = str(last_pitch).split('.')[-1]

        # Get probabilities from both tables
        global_probs = {}
        count_probs = {}
        context_probs = {}
        
        # Get global probabilities
        global_transitions = db.query(TransitionTable).filter(
            TransitionTable.pitcher_id == request.pitcher_id,
            TransitionTable.count == 'global',
            TransitionTable.last_pitch == last_pitch,
            TransitionTable.hitter_handedness == request.hitter_handedness
        ).all()
        
        for transition in global_transitions:
            global_probs[transition.next_pitch] = transition.probability

        # Get count-specific probabilities
        count_transitions = db.query(TransitionTable).filter(
            TransitionTable.pitcher_id == request.pitcher_id,
            TransitionTable.count == request.count,
            TransitionTable.last_pitch == last_pitch,
            TransitionTable.hitter_handedness == request.hitter_handedness
        ).all()
        
        for transition in count_transitions:
            count_probs[transition.next_pitch] = transition.probability

        # Get context-specific probabilities (pitch result, play result, location)
        context_transitions = db.query(TransitionTable).filter(
            TransitionTable.pitcher_id == request.pitcher_id,
            TransitionTable.last_pitch == last_pitch,
            TransitionTable.pitch_result == request.last_pitch_result,
            TransitionTable.play_result == request.last_play_result,
            TransitionTable.location == request.last_location,
            TransitionTable.hitter_handedness == request.hitter_handedness
        ).all()
        
        for transition in context_transitions:
            context_probs[transition.next_pitch] = transition.probability

        # Get location probabilities for each pitch type
        location_probs = {}
        for pitch_type in self.pitch_types:
            # Get historical locations for this pitch type with context
            locations = db.query(Pitch).filter(
                Pitch.pitcher_id == request.pitcher_id,
                Pitch.pitch_type == pitch_type,
                Pitch.count == request.count,
                Pitch.hitter_handedness == request.hitter_handedness
            ).with_entities(Pitch.location, func.count(Pitch.location)).group_by(Pitch.location).all()
            
            if not locations:
                # If no count-specific data, fall back to all locations for this pitch type
                locations = db.query(Pitch).filter(
                    Pitch.pitcher_id == request.pitcher_id,
                    Pitch.pitch_type == pitch_type,
                    Pitch.hitter_handedness == request.hitter_handedness
                ).with_entities(Pitch.location, func.count(Pitch.location)).group_by(Pitch.location).all()
            
            if locations:
                total = sum(count for _, count in locations)
                location_probs[pitch_type] = {
                    loc: count/total for loc, count in locations if loc is not None
                }
            else:
                # Default to middle-middle if no location data
                location_probs[pitch_type] = {'middle_middle': 1.0}

        # Combine probabilities with weights
        final_probs = {}
        for pitch_type in self.pitch_types:
            # Weight the different probability sources
            prob = (
                0.4 * global_probs.get(pitch_type, 0) +
                0.3 * count_probs.get(pitch_type, 0) +
                0.3 * context_probs.get(pitch_type, 0)
            )
            if prob > 0:
                final_probs[pitch_type] = prob

        # Normalize probabilities
        total_prob = sum(final_probs.values())
        if total_prob > 0:
            final_probs = {k: v/total_prob for k, v in final_probs.items()}

        # Create predictions with locations
        predictions = []
        for pitch_type, prob in sorted(final_probs.items(), key=lambda x: x[1], reverse=True):
            # Get the most likely location for this pitch type
            if pitch_type in location_probs:
                locations = location_probs[pitch_type]
                most_likely_loc = max(locations.items(), key=lambda x: x[1])
                predictions.append(Prediction(
                    pitch_type=PitchType(pitch_type),
                    confidence=prob,
                    location=most_likely_loc[0],
                    location_confidence=most_likely_loc[1]
                ))
            else:
                predictions.append(Prediction(
                    pitch_type=PitchType(pitch_type),
                    confidence=prob,
                    location='middle_middle',
                    location_confidence=1.0
                ))

        # Store prediction in history
        prediction_history = PredictionHistory(
            id=str(uuid4()),
            pitcher_id=request.pitcher_id,
            predicted_pitch=predictions[0].pitch_type.value,
            count=request.count
        )
        db.add(prediction_history)
        db.commit()

        return PredictionResponse(predictions=predictions)

    async def update_model(
        self,
        pitcher_id: str,
        count: str,
        last_pitch: str,
        next_pitch: str,
        pitch_result: Optional[PitchResult] = None,
        play_result: Optional[PlayResult] = None,
        location: Optional[str] = None,
        hitter_handedness: str = 'R'
    ):
        db = next(get_db())
        
        # Reset count to 0-0 after any out or when the at-bat ends
        if play_result in [
            PlayResult.GROUNDOUT,
            PlayResult.FLYOUT,
            PlayResult.HOMERUN,
            PlayResult.SINGLE,
            PlayResult.DOUBLE,
            PlayResult.TRIPLE,
            PlayResult.ERROR,
            PlayResult.SACRIFICE
        ]:
            count = "0-0"
            
        self._update_transition_table(
            db, 
            pitcher_id, 
            count, 
            last_pitch, 
            next_pitch, 
            pitch_result, 
            play_result, 
            location, 
            hitter_handedness
        )

        # Update accuracy tracking
        last_prediction = db.query(PredictionHistory).filter(
            PredictionHistory.pitcher_id == pitcher_id
        ).order_by(PredictionHistory.created_at.desc()).first()

        if last_prediction:
            last_prediction.actual_pitch = next_pitch
            last_prediction.was_correct = last_prediction.predicted_pitch == next_pitch
            db.commit()

    def get_session_summary(self, pitcher_id: str) -> SessionSummary:
        db = next(get_db())
        
        # Calculate pitch distribution
        pitch_counts = {pt: 0 for pt in PitchType}
        transitions = db.query(TransitionTable).filter(
            TransitionTable.pitcher_id == pitcher_id
        ).all()
        
        for transition in transitions:
            # Only count transitions with valid pitch types
            try:
                pitch_type = PitchType(transition.next_pitch)
                pitch_counts[pitch_type] += transition.transition_count
            except ValueError:
                # Skip invalid pitch types
                continue

        # Calculate prediction accuracy
        predictions = db.query(PredictionHistory).filter(
            PredictionHistory.pitcher_id == pitcher_id,
            PredictionHistory.was_correct.isnot(None)  # Only count predictions that have been evaluated
        ).all()
        
        accuracy = 1.0  # Default to 100% if no predictions
        if predictions:
            correct_predictions = sum(1 for p in predictions if p.was_correct)
            accuracy = correct_predictions / len(predictions)

        return SessionSummary(
            pitch_distribution=pitch_counts,
            prediction_accuracy=accuracy
        )

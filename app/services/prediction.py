from typing import Dict, List, Optional
import numpy as np
from datetime import datetime

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


class PredictionService:
    def __init__(self):
        self.transition_tables: Dict[str, Dict[str, Dict[str, float]]] = {}
        self.accuracy_history: Dict[str, List[bool]] = {}
        self.pitch_types = [pt.value for pt in PitchType]
        self.prediction_history: Dict[str, List[Prediction]] = {}

    def _get_or_create_transition_table(
        self, pitcher_id: str, count: str
    ) -> Dict[str, Dict[str, float]]:
        if pitcher_id not in self.transition_tables:
            self.transition_tables[pitcher_id] = {}
            self.accuracy_history[pitcher_id] = []
            self.prediction_history[pitcher_id] = []

        if count not in self.transition_tables[pitcher_id]:
            # Initialize with uniform probabilities
            self.transition_tables[pitcher_id][count] = {
                pitch: {
                    next_pitch: 1.0 / len(self.pitch_types)
                    for next_pitch in self.pitch_types
                }
                for pitch in self.pitch_types
            }

        return self.transition_tables[pitcher_id][count]

    def _update_transition_table(
        self, pitcher_id: str, count: str, last_pitch: str, next_pitch: str
    ):
        table = self._get_or_create_transition_table(pitcher_id, count)

        # Laplace smoothing
        alpha = 1.0
        total = sum(table[last_pitch].values()) + alpha * len(self.pitch_types)

        # Update probabilities
        for pitch in self.pitch_types:
            if pitch == next_pitch:
                table[last_pitch][pitch] = (table[last_pitch][pitch] + alpha) / total
            else:
                table[last_pitch][pitch] = table[last_pitch][pitch] / total

    def _handle_edge_cases(self, request: PredictionRequest) -> Optional[List[Prediction]]:
        # Handle first few pitches
        if not request.last_n_pitches:
            return [
                Prediction(pitch_type=PitchType(pt), confidence=1.0 / len(self.pitch_types))
                for pt in self.pitch_types
            ]

        # Handle unseen count + pitch combination
        if request.count not in self.transition_tables.get(request.pitcher_id, {}):
            # Use nearest known count or fallback to unconditioned pitch frequency
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

        table = self._get_or_create_transition_table(request.pitcher_id, request.count)
        last_pitch = request.last_n_pitches[-1]
        probabilities = table[last_pitch]

        # Sort by probability and get top 3
        sorted_predictions = sorted(
            probabilities.items(), key=lambda x: x[1], reverse=True
        )[:3]

        predictions = [
            Prediction(pitch_type=PitchType(pitch), confidence=prob)
            for pitch, prob in sorted_predictions
        ]

        # Store prediction history
        self.prediction_history[request.pitcher_id].append(predictions[0])

        return PredictionResponse(predictions=predictions)

    async def update_model(
        self,
        pitcher_id: str,
        count: str,
        last_pitch: str,
        next_pitch: str,
        pitch_result: Optional[PitchResult] = None,
        play_result: Optional[PlayResult] = None,
    ):
        self._update_transition_table(pitcher_id, count, last_pitch, next_pitch)

        # Update accuracy tracking
        if self.prediction_history.get(pitcher_id):
            last_prediction = self.prediction_history[pitcher_id][-1]
            was_correct = last_prediction.pitch_type == PitchType(next_pitch)
            self.accuracy_history[pitcher_id].append(was_correct)

    def get_session_summary(self, pitcher_id: str) -> SessionSummary:
        if pitcher_id not in self.transition_tables:
            return SessionSummary(
                pitch_distribution={pt: 0 for pt in PitchType},
                prediction_accuracy=0.0
            )

        # Calculate pitch distribution
        pitch_counts = {pt: 0 for pt in PitchType}
        for count_table in self.transition_tables[pitcher_id].values():
            for last_pitch, next_pitches in count_table.items():
                for next_pitch, prob in next_pitches.items():
                    pitch_counts[PitchType(next_pitch)] += 1

        # Calculate prediction accuracy
        accuracy = 0.0
        if self.accuracy_history.get(pitcher_id):
            accuracy = sum(self.accuracy_history[pitcher_id]) / len(self.accuracy_history[pitcher_id])

        return SessionSummary(
            pitch_distribution=pitch_counts,
            prediction_accuracy=accuracy
        )

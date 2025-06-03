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
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(PredictionService, cls).__new__(cls)
            cls._instance.transition_tables = {}
            cls._instance.accuracy_history = {}
            cls._instance.pitch_types = [pt.value for pt in PitchType]
            cls._instance.prediction_history = {}
        return cls._instance

    def __init__(self):
        # Initialize only if not already initialized
        if not hasattr(self, 'transition_tables'):
            self.transition_tables = {}
            self.accuracy_history = {}
            self.pitch_types = [pt.value for pt in PitchType]
            self.prediction_history = {}

    def _get_or_create_transition_table(
        self, pitcher_id: str, count: str
    ) -> Dict[str, Dict[str, float]]:
        if pitcher_id not in self.transition_tables:
            self.transition_tables[pitcher_id] = {}
            self.accuracy_history[pitcher_id] = []
            self.prediction_history[pitcher_id] = []

        # Initialize the global transition table if it doesn't exist
        if 'global' not in self.transition_tables[pitcher_id]:
            self.transition_tables[pitcher_id]['global'] = {
                'transitions': {
                    pitch: {next_pitch: 0 for next_pitch in self.pitch_types}
                    for pitch in self.pitch_types
                },
                'probabilities': {
                    pitch: {next_pitch: 1.0 / len(self.pitch_types) for next_pitch in self.pitch_types}
                    for pitch in self.pitch_types
                }
            }

        # Initialize the count-specific table if it doesn't exist
        if count not in self.transition_tables[pitcher_id]:
            self.transition_tables[pitcher_id][count] = {
                'transitions': {
                    pitch: {next_pitch: 0 for next_pitch in self.pitch_types}
                    for pitch in self.pitch_types
                },
                'probabilities': {
                    pitch: {next_pitch: 1.0 / len(self.pitch_types) for next_pitch in self.pitch_types}
                    for pitch in self.pitch_types
                }
            }

        print(f"\nDebug - Current transition tables for {pitcher_id}:")
        print(f"Global table: {self.transition_tables[pitcher_id]['global']['probabilities']}")
        print(f"Count-specific table ({count}): {self.transition_tables[pitcher_id][count]['probabilities']}")

        return self.transition_tables[pitcher_id]

    def _update_transition_table(
        self, pitcher_id: str, count: str, last_pitch: str, next_pitch: str
    ):
        if not last_pitch:  # Handle first pitch case
            return

        # Ensure last_pitch and next_pitch are strings
        last_pitch = str(last_pitch)
        next_pitch = str(next_pitch)

        tables = self._get_or_create_transition_table(pitcher_id, count)
        
        # Update both global and count-specific tables
        for table_key in ['global', count]:
            table = tables[table_key]
            
            # Update the transition count
            table['transitions'][last_pitch][next_pitch] += 1
            
            # Calculate total transitions from last_pitch
            total_transitions = sum(table['transitions'][last_pitch].values())
            
            print(f"\nUpdating {table_key} probabilities for {pitcher_id}")
            print(f"Last pitch: {last_pitch}, Next pitch: {next_pitch}")
            print(f"Transition counts: {table['transitions'][last_pitch]}")
            print(f"Total transitions: {total_transitions}")
            
            # Update probabilities for all pitches
            for pitch in self.pitch_types:
                count = table['transitions'][last_pitch][pitch]
                table['probabilities'][last_pitch][pitch] = count / total_transitions if total_transitions > 0 else 1.0 / len(self.pitch_types)
            
            print(f"Updated probabilities: {table['probabilities'][last_pitch]}\n")

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

        tables = self._get_or_create_transition_table(request.pitcher_id, request.count)
        last_pitch = request.last_n_pitches[-1]
        # Extract just the pitch type value from the enum string (e.g., 'PitchType.FB' -> 'FB')
        last_pitch = str(last_pitch).split('.')[-1]

        print(f"\nDebug - Transition tables for {request.pitcher_id}:")
        print(f"Global table: {tables['global']['probabilities']}")
        print(f"Count-specific table ({request.count}): {tables[request.count]['probabilities']}")

        # Get probabilities from the transition tables
        global_probs = tables['global']['probabilities'][last_pitch]
        count_probs = tables[request.count]['probabilities'][last_pitch]

        # Combine probabilities with more weight on count-specific
        combined_probs = {}
        for pitch in self.pitch_types:
            combined_probs[pitch] = 0.7 * count_probs[pitch] + 0.3 * global_probs[pitch]

        print(f"\nMaking prediction for {request.pitcher_id} at count {request.count}")
        print(f"Last pitch: {last_pitch}")
        print(f"Global probabilities: {global_probs}")
        print(f"Count-specific probabilities: {count_probs}")
        print(f"Combined probabilities: {combined_probs}\n")

        # Create predictions for all pitch types
        predictions = [
            Prediction(pitch_type=PitchType(pitch), confidence=combined_probs[pitch])
            for pitch in self.pitch_types
        ]
        predictions.sort(key=lambda x: x.confidence, reverse=True)
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
        # If the play result is a home run, reset the count to 0-0
        if play_result == PlayResult.HOMERUN:
            count = "0-0"
            
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
            for last_pitch, next_pitches in count_table['transitions'].items():
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

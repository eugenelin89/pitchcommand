from typing import List, Dict
import numpy as np
from app.schemas.pitch import PredictionRequest, PredictionResponse, Prediction
from app.core.config import settings

class PredictionService:
    def __init__(self):
        self.transition_tables: Dict[str, Dict[str, Dict[str, float]]] = {}
        self.pitch_types = ["FB", "SL", "CH", "CB", "CT"]
    
    def _get_or_create_transition_table(self, pitcher_id: str, count: str) -> Dict[str, Dict[str, float]]:
        if pitcher_id not in self.transition_tables:
            self.transition_tables[pitcher_id] = {}
        
        if count not in self.transition_tables[pitcher_id]:
            # Initialize with uniform probabilities
            self.transition_tables[pitcher_id][count] = {
                pitch: {next_pitch: 1.0/len(self.pitch_types) for next_pitch in self.pitch_types}
                for pitch in self.pitch_types
            }
        
        return self.transition_tables[pitcher_id][count]
    
    def _update_transition_table(self, pitcher_id: str, count: str, last_pitch: str, next_pitch: str):
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
    
    async def predict(self, request: PredictionRequest) -> PredictionResponse:
        table = self._get_or_create_transition_table(request.pitcher_id, request.count)
        
        if not request.last_n_pitches:
            # If no history, return uniform distribution
            predictions = [
                Prediction(pitch_type=pitch, confidence=1.0/len(self.pitch_types))
                for pitch in self.pitch_types
            ]
        else:
            # Use the last pitch to predict the next one
            last_pitch = request.last_n_pitches[-1]
            probabilities = table[last_pitch]
            
            # Sort by probability and get top 3
            sorted_predictions = sorted(
                probabilities.items(),
                key=lambda x: x[1],
                reverse=True
            )[:3]
            
            predictions = [
                Prediction(pitch_type=pitch, confidence=prob)
                for pitch, prob in sorted_predictions
            ]
        
        return PredictionResponse(predictions=predictions)
    
    async def update_model(self, pitcher_id: str, count: str, last_pitch: str, next_pitch: str):
        self._update_transition_table(pitcher_id, count, last_pitch, next_pitch)

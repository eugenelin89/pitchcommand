# PitchCommand – Data Schema Document (MVP)

---

## 🎯 Purpose
This document defines the core data models used in the PitchCommand MVP, including their fields, types, and relationships. These schemas will guide database design, API validation (via Pydantic), and frontend data structures.

---

## 🧱 Core Models

### 1. `Pitcher`
Represents an individual pitcher.
```json
{
  "id": "pitcher_001",        // Unique identifier (UUID or auto-generated)
  "name": "John Doe",
  "team": "Burnaby Eagles",
  "number": 12,
  "age": 15,
  "hand": "R"                  // 'L' or 'R'
}
```

### 2. `PitchLog`
Represents a single pitch thrown during a session.
```json
{
  "pitcher_id": "pitcher_001", // Foreign key to Pitcher
  "count": "1-2",               // Current pitch count
  "pitch_type": "SL",           // e.g., FB, SL, CH
  "location": "low_away",       // Optional – zone string
  "result": "strike",           // strike, ball, hit, foul
  "timestamp": "2024-05-20T19:44:00Z"
}
```

### 3. `Prediction`
Represents the model's output prediction for next pitch.
```json
{
  "pitch_type": "CH",
  "confidence": 0.42             // Float between 0 and 1
}
```

### 4. `PredictionRequest`
Input schema to get a prediction.
```json
{
  "pitcher_id": "pitcher_001",
  "last_n_pitches": ["FB", "FB", "SL"],
  "count": "0-1"
}
```

### 5. `PredictionResponse`
Output schema with predicted pitches.
```json
{
  "predictions": [
    { "pitch_type": "CH", "confidence": 0.42 },
    { "pitch_type": "SL", "confidence": 0.33 },
    { "pitch_type": "FB", "confidence": 0.25 }
  ]
}
```

### 6. `SessionSummary` *(Optional for MVP)*
Aggregated stats for a session.
```json
{
  "pitch_distribution": {
    "FB": 40,
    "SL": 20,
    "CH": 10
  },
  "prediction_accuracy": 0.72
}
```

---

## 🔧 Notes
- All schemas will be implemented using `pydantic.BaseModel` in FastAPI
- Fields like `timestamp` will be auto-assigned by the backend unless supplied
- All enums (e.g., pitch_type, result) will be validated

---

## 📦 Storage Considerations
- `Pitcher` and `PitchLog` records can be stored in Firebase, Firestore, or PostgreSQL
- `Prediction` and `PredictionRequest` can remain in memory or transient in API layer
- Use UUIDs or backend-generated IDs for unique pitcher identification
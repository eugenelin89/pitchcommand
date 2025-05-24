# PitchCommand – API Specification Document (MVP)

---

## 🎯 Overview

This document defines the REST API endpoints for the PitchCommand MVP, built with FastAPI. It outlines the structure and behavior of the backend routes, which serve the frontend client and prediction engine.

---

## 🌐 Base URL

`https://api.pitchcommand.dev/` _(example only)_

---

## 📋 Endpoints

### 1. `GET /pitchers`

**Purpose:** Retrieve a list of saved pitcher profiles
**Request:** None
**Response:**

```json
[
  {
    "id": "pitcher_001",
    "name": "John Doe",
    "team": "Burnaby Eagles",
    "number": 12,
    "hand": "R",
    "age": 15
  }
]
```

**FastAPI Model:**

```python
class Pitcher(BaseModel):
    id: str
    name: str
    team: str
    number: int
    hand: Literal["L", "R"]
    age: int
```

---

### 2. `POST /pitchers`

**Purpose:** Create a new pitcher profile
**Request:**

```json
{
  "name": "John Doe",
  "team": "Burnaby Eagles",
  "number": 12,
  "hand": "R",
  "age": 15
}
```

**Response:**

```json
{ "id": "pitcher_001" }
```

**FastAPI Model:**

```python
class PitcherCreate(BaseModel):
    name: str
    team: str
    number: int
    hand: Literal["L", "R"]
    age: int
```

---

### 3. `POST /log`

**Purpose:** Log a pitch and update the model
**Request:**

```json
{
  "pitcher_id": "pitcher_001",
  "count": "1-2",
  "pitch_type": "SL",
  "location": "low_away",
  "result": "strike"
}
```

**Response:**

```json
{ "status": "ok" }
```

**FastAPI Model:**

```python
class PitchLog(BaseModel):
    pitcher_id: str
    count: str
    pitch_type: Literal["FB", "SL", "CH", "CB", "CT"]
    location: Optional[str]
    result: Literal["strike", "ball", "foul", "hit"]
```

---

### 4. `POST /predict`

**Purpose:** Get prediction for the next pitch
**Request:**

```json
{
  "pitcher_id": "pitcher_001",
  "last_n_pitches": ["FB", "FB", "SL"],
  "count": "0-1"
}
```

**Response:**

```json
{
  "predictions": [
    { "pitch_type": "CH", "confidence": 0.42 },
    { "pitch_type": "SL", "confidence": 0.33 },
    { "pitch_type": "FB", "confidence": 0.25 }
  ]
}
```

**FastAPI Model:**

```python
class PredictionRequest(BaseModel):
    pitcher_id: str
    last_n_pitches: List[str]
    count: str

class Prediction(BaseModel):
    pitch_type: str
    confidence: float

class PredictionResponse(BaseModel):
    predictions: List[Prediction]
```

---

### 5. `GET /summary/{pitcher_id}` _(Optional)_

**Purpose:** Get summary stats for pitcher's session
**Response:**

```json
{
  "pitch_distribution": { "FB": 40, "SL": 20, "CH": 10 },
  "prediction_accuracy": 0.72
}
```

**FastAPI Model:**

```python
class SummaryResponse(BaseModel):
    pitch_distribution: Dict[str, int]
    prediction_accuracy: float
```

---

## ⚠️ Error Handling

All endpoints return error responses in this format:

```json
{
  "error": "Invalid pitcher_id.",
  "detail": "The pitcher ID provided does not exist in the database."
}
```

**HTTP Status Codes:**

- `200 OK`: Successful request
- `400 Bad Request`: Invalid input or schema
- `404 Not Found`: Pitcher ID not found
- `422 Unprocessable Entity`: Validation error (FastAPI specific)
- `500 Internal Server Error`: Unexpected failure

---

## 🔐 Authentication (Post-MVP)

Currently no authentication required
Future: add token or API key to header

```http
Authorization: Bearer <token>
```

---

## 🚀 FastAPI Implementation Notes

- Using Pydantic for request/response validation
- OpenAPI (Swagger) documentation available at `/docs`
- ReDoc documentation available at `/redoc`
- Async endpoints for better performance
- CORS middleware enabled for frontend access
- Rate limiting implemented for prediction endpoints

---

## 📊 Performance Requirements

- All responses should return in <200ms for prediction-related calls
- Input validation enforced using Pydantic models
- Schema definitions shared between frontend and backend
- Async database operations for better scalability

# PitchCommand – API Specification Document (MVP)

---

## 🎯 Overview
This document defines the REST API endpoints for the PitchCommand MVP. It outlines the structure and behavior of the backend routes, which serve the frontend client and prediction engine.

---

## 🌐 Base URL
`https://api.pitchcommand.dev/` *(example only)*

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

---

### 5. `GET /summary/{pitcher_id}` *(Optional)*
**Purpose:** Get summary stats for pitcher’s session  
**Response:**
```json
{
  "pitch_distribution": { "FB": 40, "SL": 20, "CH": 10 },
  "prediction_accuracy": 0.72
}
```

---

## ⚠️ Error Handling
All endpoints return error responses in this format:
```json
{
  "error": "Invalid pitcher_id."
}
```

**HTTP Status Codes:**
- `200 OK`: Successful request
- `400 Bad Request`: Invalid input or schema
- `404 Not Found`: Pitcher ID not found
- `500 Internal Server Error`: Unexpected failure

---

## 🔐 Authentication (Post-MVP)
Currently no authentication required  
Future: add token or API key to header

```http
Authorization: Bearer <token>
```

---

## Notes
- All responses should return in <200ms for prediction-related calls
- Input validation enforced using Pydantic (FastAPI)
- Schema definitions may live in shared JSON or Python `BaseModel`s
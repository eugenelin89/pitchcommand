# PitchCommand – Technical Architecture Document (MVP)

---

## 🎯 Purpose
This document describes the high-level system architecture for the PitchCommand MVP, including the major components, technologies, data flow, and deployment considerations.

---

## 🏗️ System Overview
PitchCommand is a web-based application for tracking baseball pitch sequences, predicting next pitches using a real-time adaptive model, and storing pitcher-specific data. It consists of:

- **Frontend (Client App)** – UI for pitch logging, viewing predictions, switching pitchers
- **Backend (API Server)** – Handles API requests, routes data, and interfaces with the model
- **Model Engine** – Predicts next pitch and updates model state
- **Data Store** – Stores pitch logs, pitcher profiles, and model state per pitcher

---

## 🧱 Component Breakdown

### 1. Frontend (React + Tailwind)
- Technology: React + shadcn/ui + Vite
- Responsibilities:
  - Render UI components (pitch logging, prediction view, summaries)
  - Call API endpoints to get predictions and submit pitch data
  - Manage local session state for multi-pitcher switching
  - Responsive design for mobile/tablet use

### 2. Backend (FastAPI)
- Technology: Python (FastAPI preferred for async)
- Responsibilities:
  - Handle requests from the frontend
  - Route data to and from the prediction model
  - Persist and retrieve pitcher and session data
  - Return predictions in real time

### 3. Prediction Model (Python Module)
- Technology: Python (pure module or part of backend)
- Responsibilities:
  - Maintain per-pitcher model state (transition probabilities)
  - Generate next-pitch predictions
  - Update model after each actual pitch is logged

### 4. Data Storage
- Technology: Firebase (or lightweight PostgreSQL if needed)
- Stores:
  - Pitcher profiles
  - Pitch logs (by session, by pitcher)
  - Model state per pitcher (optional: serialize as JSON or pickle)

---

## 🔁 Data Flow
```
[Frontend]
  ↳ GET /pitchers → Load available profiles
  ↳ POST /log → Save pitch + update model
  ↳ POST /predict → Get next-pitch prediction

[Backend API]
  ↳ Routes request → Calls model → Updates storage → Returns result

[Model Engine]
  ↳ Loads or updates per-pitcher model → Returns predictions

[Data Store]
  ↳ Reads/writes pitcher data and session logs
```

---

## ☁️ Deployment (MVP)
- Frontend: Vercel or Netlify
- Backend: Render, Railway, or Replit
- Data: Firebase Realtime DB or Firestore

---

## 🔐 Authentication (Post-MVP)
- No user auth for MVP
- Optional: add scoped API keys for team or league separation later

---

## 📦 File Structure (Example)
```
pitchcommand-app/
├── client/           # React frontend
├── server/           # FastAPI backend
│   ├── model.py      # Prediction model logic
│   ├── routes.py     # API routes
│   └── storage.py    # Interface with DB or Firebase
└── shared/
    └── schema/       # JSON schemas for pitcher, pitch log, etc.
```

---

## 🛠️ Development Tools
- VSCode
- GitHub + Codespaces (optional)
- Postman or HTTPie for API testing
- Vite + Tailwind UI templates

---

## 🧩 Future Architecture Considerations
- Refactor model into a standalone microservice
- Add Redis for faster session data access
- Support WebSocket streaming for live game sync
- Authentication via Firebase Auth or Auth0

---

## Notes
- Prioritize low-latency response from model prediction (sub-250ms ideal)
- Keep the MVP architecture simple and portable

# PitchCommand – Documentation Plan and Priorities

---

## ✅ Core Documents (Complete)

### 1. Product Requirements Document (PRD) ✅
Describes the app’s purpose, users, goals, and scope.

### 2. Feature Specification Sheet ✅
Breaks down MVP features with inputs, outputs, and dev notes.

---

## 🥇 High Priority – Next to Build

### 3. Model Logic Document
Describes how the pitch prediction engine works.
- Model type (e.g., Markov Chain, Bayesian)
- Input features (count, pitch history, pitcher ID, etc.)
- Prediction and update logic
- Edge case handling

### 4. UX/UI Flow Document
Defines user interactions and app screens.
- Screen sketches or descriptions
- Main flows: pitcher select, log pitch, view prediction, feedback
- Navigation patterns and edge cases

---

## 🧠 Medium Priority – Follow-Up for Build

### 5. Technical Architecture Document
Describes how components connect:
- Frontend → Backend → Model → Storage
- Tech stack per layer
- Deployment/environment notes

### 6. API Specification
Defines REST endpoints for frontend-backend interaction.
- `POST /predict`, `POST /update`, `GET /pitchers`
- Input/output formats
- Error handling and response timing

### 7. Data Schema
JSON or database model for storing:
- Pitch logs
- Pitcher profiles
- Session history

---

## 📈 Optional – Post-MVP

### 8. System Setup & Deployment Guide
Setup instructions for dev/prod environments.

### 9. Test Plan
Covers unit, integration, and model validation tests.

### 10. Post-MVP Roadmap
Future features like:
- Web3 token rewards
- LSTM/attention-based model
- Scout dashboard
- Video integration

---

## 📌 Recommended Build Order
1. Model Logic Document
2. UX/UI Flow Document
3. Technical Architecture
4. API Spec
5. Data Schema

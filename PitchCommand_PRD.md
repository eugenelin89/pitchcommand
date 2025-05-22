# Product Requirements Document (PRD)

**Product Name:** PitchCommand  
**Prepared By:** [Your Name]  
**Date:** [Insert Date]

---

## 1. Overview

PitchCommand is a real-time, adaptive pitch sequencing analysis app that helps baseball pitchers, coaches, and scouts understand and optimize pitch patterns. The app predicts the next pitch based on previous inputs and refines its model continuously as the user logs more data. Its goal is to build intelligent, personalized profiles for pitchers that evolve with each game and bullpen session.

---

## 2. Objective

To provide an easy-to-use tool that:

- Predicts a pitcher's next pitch in real-time
- Learns and updates prediction logic after every input
- Visualizes sequencing tendencies
- Enables long-term development tracking and scouting

---

## 3. Target Users

- **Youth and Amateur Pitchers**: Improve pitch variety and avoid predictability
- **Coaches**: Help pitchers build strategic sequences
- **Scouts**: Analyze cognitive pitching patterns and tendencies
- **Analysts**: Track and compare pitcher decision-making over time

---

## 4. Features (MVP Scope)

### 4.1 Pitch Logging

- Manual input form for pitch type, count, location, and result
- Session-based logging (per pitcher)
- Ability to track multiple pitchers in a single game session
- Real-time validation using FastAPI's Pydantic models

### 4.2 Pitcher Profile Management

- Store basic pitcher metadata: name, team, number, age, throwing hand (L/R), etc.
- Ability to switch between pitchers in real-time during a game
- All pitch logs are saved under the correct pitcher profile
- RESTful API endpoints for CRUD operations

### 4.3 Real-Time Prediction Engine

- Predicts next pitch based on last 3–5 pitches and game context
- Displays top 1–3 pitch predictions with confidence scores
- Async API endpoints for low-latency predictions
- Rate limiting to prevent abuse

### 4.4 Continuous Model Updating

- Every pitch logged is used to update the prediction model
- Personalizes the model per pitcher
- Background task processing for model updates
- In-memory caching for frequently accessed data

### 4.5 Feedback and Accuracy Tracking

- After actual pitch is logged, show prediction correctness
- Calculate running accuracy rate and trend
- Real-time statistics via WebSocket updates
- Historical data analysis endpoints

### 4.6 Visualization

- Display sequence tree or chart of recent pitch paths
- Optional: heatmap or bar chart of pitch distribution
- Client-side rendering with React
- Real-time updates via WebSocket

---

## 5. Out of Scope (For MVP)

- Wearable or video integration
- User authentication
- Web3 / token rewards system
- Multi-player/team data management beyond pitcher profiles

---

## 6. Success Metrics

- Users log >50 pitches in 2+ sessions
- > 80% of users report improved sequencing awareness
- Prediction accuracy improves with usage
- Minimum 50% week-over-week retention for test users
- App successfully tracks 2+ pitchers in a single session without data errors
- API response times under 200ms for prediction endpoints

---

## 7. Platform & Tech Stack

- **Frontend**: React + Tailwind (shadcn/ui)
- **Backend**: FastAPI (Python)
  - Pydantic for data validation
  - SQLAlchemy for database operations
  - WebSocket support for real-time updates
  - OpenAPI documentation
- **Data**: SQLite for MVP (PostgreSQL for production)
- **Model**: Markov Chain or Bayesian model for sequencing
- **Deployment**: Docker containers with Nginx reverse proxy

---

## 8. Timeline (Est. Development)

- Week 1: FastAPI Backend Setup + Model Implementation
- Week 2: API Endpoints + Database Integration
- Week 3: Frontend Development + API Integration
- Week 4: Testing + Performance Optimization

---

## 9. Future Expansion (Post-MVP)

- Web3 data ownership and token incentives
- Scout dashboard and player report card export
- AI-based suggestions for optimal sequencing
- Video annotation and biomechanical overlays
- Multiplayer support and cloud storage
- Kubernetes deployment for scaling

---

## 10. Risks

- Overfitting model on small pitch samples
- Accuracy plateaus without good sequence diversity
- Users may need training to log pitches accurately
- Complexity increases when tracking multiple pitchers in a fast-paced game
- API performance under high concurrent load
- Data consistency in distributed environment

---

## 11. Stakeholders

- [Your Name] – Founder / Developer
- [Advisor/Coach Name] – Baseball Strategy Advisor
- [Optional Collaborators] – UX, Data Science, Frontend Dev

---

## 12. Technical Requirements

- Python 3.9+ for FastAPI backend
- Node.js 16+ for React frontend
- SQLite/PostgreSQL database
- Docker for containerization
- Nginx for reverse proxy
- HTTPS for all API endpoints
- CORS configuration for frontend access
- Rate limiting for prediction endpoints
- Monitoring and logging infrastructure

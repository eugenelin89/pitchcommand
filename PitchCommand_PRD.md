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

### 4.2 Pitcher Profile Management
- Store basic pitcher metadata: name, team, number, age, throwing hand (L/R), etc.
- Ability to switch between pitchers in real-time during a game
- All pitch logs are saved under the correct pitcher profile

### 4.3 Real-Time Prediction Engine
- Predicts next pitch based on last 3–5 pitches and game context
- Displays top 1–3 pitch predictions with confidence scores

### 4.4 Continuous Model Updating
- Every pitch logged is used to update the prediction model
- Personalizes the model per pitcher

### 4.5 Feedback and Accuracy Tracking
- After actual pitch is logged, show prediction correctness
- Calculate running accuracy rate and trend

### 4.6 Visualization
- Display sequence tree or chart of recent pitch paths
- Optional: heatmap or bar chart of pitch distribution

---

## 5. Out of Scope (For MVP)
- Wearable or video integration
- User authentication
- Web3 / token rewards system
- Multi-player/team data management beyond pitcher profiles

---

## 6. Success Metrics
- Users log >50 pitches in 2+ sessions
- >80% of users report improved sequencing awareness
- Prediction accuracy improves with usage
- Minimum 50% week-over-week retention for test users
- App successfully tracks 2+ pitchers in a single session without data errors

---

## 7. Platform & Tech Stack (Planned)
- **Frontend**: React + Tailwind (shadcn/ui)
- **Backend**: Flask or FastAPI (Python-based model API)
- **Data**: Local state or Firebase for session storage
- **Model**: Markov Chain or Bayesian model for sequencing

---

## 8. Timeline (Est. Development)
- Week 1: Model + Prediction Engine
- Week 2: UI/UX + Logging + Feedback Loop
- Week 3: Multi-pitcher tracking + Visualization + Integration
- Week 4: Internal testing and refinement

---

## 9. Future Expansion (Post-MVP)
- Web3 data ownership and token incentives
- Scout dashboard and player report card export
- AI-based suggestions for optimal sequencing
- Video annotation and biomechanical overlays
- Multiplayer support and cloud storage

---

## 10. Risks
- Overfitting model on small pitch samples
- Accuracy plateaus without good sequence diversity
- Users may need training to log pitches accurately
- Complexity increases when tracking multiple pitchers in a fast-paced game

---

## 11. Stakeholders
- [Your Name] – Founder / Developer
- [Advisor/Coach Name] – Baseball Strategy Advisor
- [Optional Collaborators] – UX, Data Science, Frontend Dev
# Feature Specification Sheet – PitchCommand (MVP)

---

## Overview
This document details the functional breakdown of each MVP feature described in the PitchCommand PRD. Each entry includes the feature name, a description, inputs, outputs, and key notes for development.

---

## 1. Pitch Logging
| Field | Description |
|-------|-------------|
| Feature | Manual pitch entry by user |
| Inputs | Count (e.g., 0-1), pitch type (FB, CH, SL, etc.), location (dropdown or zone chart), result (strike, ball, hit) |
| Outputs | Pitch record object added to pitcher’s current session |
| Notes | Designed for rapid input; must support mobile use and quick entry during live games |

---

## 2. Pitcher Profile Management
| Field | Description |
|-------|-------------|
| Feature | Manage pitcher data and switch between pitchers mid-session |
| Inputs | Name, team, jersey number, age, throwing hand (L/R) |
| Outputs | Pitcher profile object; selected profile sets context for pitch logs |
| Notes | Users must be able to switch between pitchers without interrupting the flow of data entry |

---

## 3. Real-Time Prediction Engine
| Field | Description |
|-------|-------------|
| Feature | Predict the next pitch based on recent sequence |
| Inputs | Last 3–5 pitch records from the active session, game context (e.g., count) |
| Outputs | List of top 1–3 predicted pitches with confidence values |
| Notes | Use lightweight model (Markov Chain or Naive Bayes) for fast response during gameplay |

---

## 4. Continuous Model Updating
| Field | Description |
|-------|-------------|
| Feature | Update the pitch prediction model with each new input |
| Inputs | Actual pitch thrown |
| Outputs | Updated transition probabilities or prediction weights for pitcher |
| Notes | MVP uses per-pitcher model stored in memory or local database |

---

## 5. Feedback and Accuracy Tracking
| Field | Description |
|-------|-------------|
| Feature | Show whether model predicted correctly and track cumulative stats |
| Inputs | Predicted pitch vs. actual pitch |
| Outputs | Correct/incorrect flag; update to prediction accuracy history |
| Notes | Highlight model performance to the user; useful for trust and diagnostics |

---

## 6. Visualization
| Field | Description |
|-------|-------------|
| Feature | Display visual insights into pitch sequencing and distribution |
| Inputs | All logged pitch data for current session and pitcher |
| Outputs | Charts (bar chart of pitch types, pitch sequence tree, optional heatmap) |
| Notes | Prioritize readability and mobile-friendly design |

---

## 7. Multi-Pitcher Game Session Support
| Field | Description |
|-------|-------------|
| Feature | Allow user to log and analyze pitches from multiple pitchers in a game session |
| Inputs | Pitcher selection dropdown; pitcher metadata; pitch logs per pitcher |
| Outputs | Segmented session data per pitcher |
| Notes | All views and model logic must be context-sensitive to the selected pitcher |

---

## Appendix: Data Schema Example (JSON)
```json
{
  "pitcher_id": "pitcher_001",
  "name": "John Doe",
  "team": "Burnaby Eagles",
  "hand": "R",
  "pitches": [
    {
      "count": "0-0",
      "pitch_type": "FB",
      "location": "high_in",
      "result": "strike"
    }
  ]
}
```

---

## Dependencies
- Prediction engine Python module
- UI components for quick pitch input and visual display
- State/context manager for switching pitchers
- Chart library (e.g., Recharts, Chart.js)
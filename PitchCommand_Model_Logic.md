# PitchCommand – Model Logic Document

---

## 🎯 Goal

To build a lightweight, real-time pitch prediction engine that adapts to individual pitchers as pitch data is logged during a game or session. The model predicts the next pitch type based on past sequences and updates continuously to reflect new tendencies.

---

## 📥 Input Features

| Feature        | Description                                                  |
| -------------- | ------------------------------------------------------------ |
| Count          | Current pitch count (e.g., 1-2, 0-0)                         |
| Pitch History  | Last 3–5 pitch types thrown                                  |
| Pitch Location | Optional – pitch zone (e.g., low in, high away)              |
| Pitch Result   | Optional – outcome (strike, ball, hit, etc.)                 |
| Pitcher ID     | Identifies the active pitcher for per-pitcher model updating |

---

## 🧠 Model Type (MVP)

- **Model**: Markov Chain or Simple Bayesian Predictor
- **Why**: Fast to implement, requires minimal training data, interpretable, updates in real-time
- **Unit of Learning**: Transition probabilities between pitch types based on pitch context (e.g., count and last pitch type)

---

## ⚙️ Prediction Logic

- Given current count and last N pitches:

  1. Retrieve historical transitions for the same count context
  2. Calculate probability distribution for possible next pitches
  3. Return top 1–3 predictions with confidence scores

- **Example Transition Table (Count = 1-1):**

| Last Pitch | FB  | SL  | CH  |
| ---------- | --- | --- | --- |
| FB         | 0.4 | 0.3 | 0.3 |
| SL         | 0.2 | 0.5 | 0.3 |

---

## 🔁 Learning & Model Update

- After actual pitch is logged:

  1. Update transition table with new example
  2. Recompute distribution if necessary (for smoothing)
  3. Update model state per pitcher (in-memory or file/db)

- Use Laplace smoothing (add-one) to avoid zero-probability bias early on

---

## 🧠 Personalization

- Models are maintained **per pitcher**
- Each pitcher ID has its own transition table and prediction state
- Model accuracy and sequencing tendencies evolve over time

---

## 📈 Accuracy Tracking

- Track:
  - Whether top prediction matched actual pitch
  - Rank of actual pitch in predicted list
- Log overall model accuracy per session and per pitcher
- Visualize performance trends over time

---

## ⚠️ Edge Case Handling

| Case                 | Handling Strategy                                                    |
| -------------------- | -------------------------------------------------------------------- |
| First few pitches    | Use global average probabilities or default priors                   |
| Unseen count + pitch | Use nearest known count or fallback to unconditioned pitch frequency |
| Incomplete history   | Allow prediction with fewer than 3 prior pitches                     |

---

## 🔧 Future Model Upgrades (Post-MVP)

- Weighted time decay for recent vs. older pitches
- Include pitch location and batter handedness
- Trainable RNN or BiLSTM + attention for deeper sequence modeling
- Model confidence calibration based on sequence entropy

---

## Dependencies

- Prediction Engine Module (Python)
- Pitch Log Parser
- Pitcher Profile Store (local or Firebase)
- Model state serialization (per pitcher)

---

## Notes

- Must prioritize low latency for real-time use
- Tradeoff between accuracy and explainability is OK at MVP stage
- Should be testable in isolation with mock pitch logs

-

# PitchCommand – Model Logic Document

---

## 🎯 Goal

To build a lightweight, real-time pitch prediction engine that adapts to individual pitchers as pitch data is logged during a game or session. The model predicts the next pitch type based on past sequences and updates continuously to reflect new tendencies.

---

## 📥 Input Features

| Feature        | Description                                                  | FastAPI Type  |
| -------------- | ------------------------------------------------------------ | ------------- |
| Count          | Current pitch count (e.g., 1-2, 0-0)                         | str           |
| Pitch History  | Last 3–5 pitch types thrown                                  | List[str]     |
| Pitch Location | Optional – pitch zone (e.g., low in, high away)              | Optional[str] |
| Pitch Result   | Optional – outcome (strike, ball, hit, etc.)                 | Optional[str] |
| Pitcher ID     | Identifies the active pitcher for per-pitcher model updating | str           |

---

## 🧠 Model Type (MVP)

- **Model**: Markov Chain or Simple Bayesian Predictor
- **Why**: Fast to implement, requires minimal training data, interpretable, updates in real-time
- **Unit of Learning**: Transition probabilities between pitch types based on pitch context (e.g., count and last pitch type)
- **Implementation**: Python class with FastAPI dependency injection

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
  4. Trigger background task for model persistence

- Use Laplace smoothing (add-one) to avoid zero-probability bias early on
- Implement as FastAPI background task for non-blocking updates

---

## 🧠 Personalization

- Models are maintained **per pitcher**
- Each pitcher ID has its own transition table and prediction state
- Model accuracy and sequencing tendencies evolve over time
- Models stored in SQLite/PostgreSQL with Redis caching layer

---

## 📈 Accuracy Tracking

- Track:
  - Whether top prediction matched actual pitch
  - Rank of actual pitch in predicted list
- Log overall model accuracy per session and per pitcher
- Visualize performance trends over time
- Expose metrics via FastAPI endpoints for monitoring

---

## ⚠️ Edge Case Handling

| Case                 | Handling Strategy                                                    | FastAPI Implementation                    |
| -------------------- | -------------------------------------------------------------------- | ----------------------------------------- |
| First few pitches    | Use global average probabilities or default priors                   | Default values in Pydantic models         |
| Unseen count + pitch | Use nearest known count or fallback to unconditioned pitch frequency | Custom validation in FastAPI dependencies |
| Incomplete history   | Allow prediction with fewer than 3 prior pitches                     | Optional fields in request models         |

---

## 🔧 Future Model Upgrades (Post-MVP)

- Weighted time decay for recent vs. older pitches
- Include pitch location and batter handedness
- Trainable RNN or BiLSTM + attention for deeper sequence modeling
- Model confidence calibration based on sequence entropy
- GPU acceleration for complex models
- Distributed training support

---

## 🚀 FastAPI Integration

### Model Service

```python
class PredictionService:
    def __init__(self, db: Session):
        self.db = db
        self.cache = RedisCache()

    async def predict(self, request: PredictionRequest) -> PredictionResponse:
        # Implementation
        pass

    async def update_model(self, pitch_log: PitchLog) -> None:
        # Implementation
        pass
```

### API Endpoints

```python
@router.post("/predict")
async def predict_pitch(
    request: PredictionRequest,
    prediction_service: PredictionService = Depends(get_prediction_service)
) -> PredictionResponse:
    return await prediction_service.predict(request)
```

---

## Dependencies

- FastAPI for API endpoints
- SQLAlchemy for database operations
- Redis for caching
- Pydantic for data validation
- Background tasks for model updates
- Monitoring and logging tools

---

## Notes

- Must prioritize low latency for real-time use
- Tradeoff between accuracy and explainability is OK at MVP stage
- Should be testable in isolation with mock pitch logs
- Use FastAPI's dependency injection for clean architecture
- Implement proper error handling and logging
- Consider rate limiting for prediction endpoints

-

## 🧪 Future Effectiveness Modeling (Optional)

To assess pitch quality and command, future versions of the model can incorporate `pitch_result` and `play_result` into training and feedback loops.

### Potential Use Cases:
- Calculate whiff %, groundball %, or flyball % by pitch type and sequence.
- Weight transition probabilities by success (e.g., strikeout or weak contact).
- Visualize effectiveness heatmaps for each pitcher.

### Implementation Notes:
- Store granular result data in `PitchLog`.
- Update model evaluation routines to track outcomes in context.
- May require separate effectiveness models or reinforcement-style learning.
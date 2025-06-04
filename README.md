
# PitchCommand API

A real-time pitch prediction and analysis API built with FastAPI.

## Features

- Real-time pitch prediction using Markov Chain model
- Pitcher profile management
- Pitch logging and analysis
- RESTful API endpoints
- OpenAPI documentation

## Tech Stack

- FastAPI
- SQLAlchemy
- SQLite (MVP) / PostgreSQL (Production)
- Redis (for caching)
- Pydantic

## Setup

1. Create a virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Create a `.env` file:

```bash
PROJECT_NAME=PitchCommand
BACKEND_CORS_ORIGINS=["http://localhost:3000"]
SQLITE_URL=sqlite:///./pitchcommand.db
REDIS_HOST=localhost
REDIS_PORT=6379
```

4. Initialize the database:

```bash
# Create database tables
python -c "from app.db.base import Base; from app.db.session import engine; Base.metadata.create_all(bind=engine)"
```

5. Run the development server:

```bash
uvicorn app.main:app --reload
```

## API Documentation

Once the server is running, you can access:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API Endpoints

### Pitchers

- `GET /api/v1/pitchers/` - List all pitchers
- `POST /api/v1/pitchers/` - Create a new pitcher
- `GET /api/v1/pitchers/{pitcher_id}` - Get pitcher details

### Pitches

- `POST /api/v1/pitches/` - Log a new pitch
- `GET /api/v1/pitches/pitcher/{pitcher_id}` - Get pitcher's pitch history

### Predictions

- `POST /api/v1/predict/` - Get next pitch prediction

## Development

### Project Structure

```
app/
├── api/
│   └── v1/
│       ├── endpoints/
│       │   ├── pitchers.py
│       │   ├── pitches.py
│       │   └── predictions.py
│       └── __init__.py
├── core/
│   ├── config.py
│   └── security.py
├── db/
│   ├── base.py
│   └── session.py
├── models/
│   ├── pitcher.py
│   └── pitch.py
├── schemas/
│   ├── pitcher.py
│   └── pitch.py
├── services/
│   └── prediction.py
└── main.py
```

### Running Tests

```bash
pytest
```

## License
This project is licensed under the GNU Affero General Public License v3.0.  
See the [LICENSE](./LICENSE) file for details.

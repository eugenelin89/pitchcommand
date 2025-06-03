from app.db.base import Base
from app.db.session import engine
from app.models.pitcher import Pitcher
from app.models.pitch import Pitch
from app.models.prediction import TransitionTable, PredictionHistory

def init_db():
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")

if __name__ == "__main__":
    init_db() 
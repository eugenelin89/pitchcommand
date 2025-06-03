import logging
from pathlib import Path
import subprocess
import sys

from alembic.config import Config
from alembic import command

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def run_alembic_migrations():
    """Run all pending database migrations."""
    try:
        # Get the project root directory
        project_root = Path(__file__).parent.parent
        
        # Create Alembic config
        alembic_cfg = Config(str(project_root / "alembic.ini"))
        
        # Run migrations
        logger.info("Running database migrations...")
        command.upgrade(alembic_cfg, "head")
        logger.info("Database migrations completed successfully!")
        
    except Exception as e:
        logger.error(f"Error running migrations: {str(e)}")
        sys.exit(1)

def verify_database():
    """Verify that the database is properly set up."""
    try:
        # Import your models and database session
        from app.db.session import SessionLocal
        from app.models.pitcher import Pitcher
        from app.models.pitch import Pitch
        from app.models.prediction import TransitionTable, PredictionHistory
        
        # Create a database session
        db = SessionLocal()
        
        # Try to query each table to verify they exist
        logger.info("Verifying database tables...")
        db.query(Pitcher).first()
        db.query(Pitch).first()
        db.query(TransitionTable).first()
        db.query(PredictionHistory).first()
        
        logger.info("Database verification completed successfully!")
        
    except Exception as e:
        logger.error(f"Error verifying database: {str(e)}")
        sys.exit(1)
    finally:
        db.close()

def init_database():
    """Initialize the database with migrations and verification."""
    logger.info("Starting database initialization...")
    
    # Run migrations
    run_alembic_migrations()
    
    # Verify database
    verify_database()
    
    logger.info("Database initialization completed successfully!")

if __name__ == "__main__":
    init_database() 
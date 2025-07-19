import os
import logging
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Configure logging
logger = logging.getLogger(__name__)

# Read from environment variable with fallback for local dev
SQLALCHEMY_DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres@geo_db:5432/postgres"
)

try:
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        pool_pre_ping=True,
        pool_recycle=300,
        echo=False  
    )
    logger.info("✅ Database engine created successfully")
except Exception as e:
    logger.error(f"❌ Failed to create database engine: {str(e)}")
    raise

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()

def get_db():
    """
    Dependency for FastAPI routes.
    """
    db = SessionLocal()
    try:
        logger.debug("📦 Database session started")
        yield db
    except Exception as e:
        logger.error(f"❌ Error during DB session: {str(e)}")
        db.rollback()
        raise
    finally:
        logger.debug("🔚 Database session closed")
        db.close()

def init_db():
    """
    Initialize the DB by creating all tables.
    """
    try:
        from app import models  
        Base.metadata.create_all(bind=engine)
        logger.info("✅ Database tables created")
    except Exception as e:
        logger.error(f"❌ Failed to initialize database: {str(e)}")
        raise

def check_db_connection():
    """
    Validate DB connection on startup.
    """
    try:
        with engine.connect() as connection:
            connection.execute("SELECT 1")
        logger.info("✅ Database connection is alive")
        return True
    except Exception as e:
        logger.error(f"❌ DB connection failed: {str(e)}")
        return False

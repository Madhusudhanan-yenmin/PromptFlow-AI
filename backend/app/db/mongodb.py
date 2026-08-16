import logging
from typing import Optional
from pymongo import MongoClient
from pymongo.database import Database
from app.core.config import settings

logger = logging.getLogger("promptflow.db")

class MongoDB:
    client: Optional[MongoClient] = None
    db: Optional[Database] = None

db_instance = MongoDB()

def connect_to_mongo():
    """Establish connection to MongoDB."""
    try:
        db_instance.client = MongoClient(settings.MONGODB_URL, serverSelectionTimeoutMS=5000)
        db_instance.db = db_instance.client[settings.DATABASE_NAME]
        # Quick server ping to check connectivity
        db_instance.client.admin.command('ping')
        logger.info(f"Successfully connected to MongoDB database '{settings.DATABASE_NAME}' at {settings.MONGODB_URL}")
    except Exception as e:
        logger.warning(f"Could not connect to MongoDB at {settings.MONGODB_URL}: {e}")
        # Allow server to startup even if DB is offline initially (will retry on requests)

def close_mongo_connection():
    """Close MongoDB connection gracefully."""
    if db_instance.client:
        db_instance.client.close()
        logger.info("MongoDB connection closed.")

def get_database() -> Optional[Database]:
    """Retrieve database instance."""
    if db_instance.db is None:
        connect_to_mongo()
    return db_instance.db

def get_collection(collection_name: str):
    """Retrieve specific collection from MongoDB."""
    db = get_database()
    if db is not None:
        return db[collection_name]
    return None

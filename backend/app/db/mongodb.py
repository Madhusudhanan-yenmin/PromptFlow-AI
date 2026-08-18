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

_connection_attempted = False

def connect_to_mongo(force: bool = False):
    """Establish connection to MongoDB cleanly without hanging on offline state."""
    global _connection_attempted
    if _connection_attempted and not force:
        return
    _connection_attempted = True

    try:
        client = MongoClient(settings.MONGODB_URL, serverSelectionTimeoutMS=2000)
        # Quick server ping to check connectivity
        client.admin.command('ping')
        db_instance.client = client
        db_instance.db = client[settings.DATABASE_NAME]
        logger.info(f"Successfully connected to MongoDB database '{settings.DATABASE_NAME}' at {settings.MONGODB_URL}")
    except Exception as e:
        logger.warning(f"Could not connect to MongoDB at {settings.MONGODB_URL}: {e}. Operating in in-memory mode.")
        if db_instance.client:
            try:
                db_instance.client.close()
            except Exception:
                pass
        db_instance.client = None
        db_instance.db = None

def close_mongo_connection():
    """Close MongoDB connection gracefully."""
    if db_instance.client:
        try:
            db_instance.client.close()
        except Exception:
            pass
        logger.info("MongoDB connection closed.")

def get_database() -> Optional[Database]:
    """Retrieve database instance."""
    if db_instance.db is None and not _connection_attempted:
        connect_to_mongo()
    return db_instance.db

def get_collection(collection_name: str):
    """Retrieve specific collection from MongoDB."""
    db = get_database()
    if db is not None:
        return db[collection_name]
    return None

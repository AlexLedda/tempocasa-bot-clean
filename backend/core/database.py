"""
Database Module
Gestisce la connessione MongoDB e fornisce utility per operazioni comuni
"""
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from typing import Optional
import logging

logger = logging.getLogger(__name__)


class Database:
    """MongoDB database manager"""
    
    def __init__(self):
        self.client: Optional[AsyncIOMotorClient] = None
        self.db: Optional[AsyncIOMotorDatabase] = None
    
    def connect(self, mongo_url: str, db_name: str):
        """Connect to MongoDB"""
        try:
            self.client = AsyncIOMotorClient(mongo_url)
            self.db = self.client[db_name]
            logger.info(f"Connected to MongoDB database: {db_name}")
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            raise
    
    def disconnect(self):
        """Disconnect from MongoDB"""
        if self.client:
            self.client.close()
            logger.info("Disconnected from MongoDB")
    
    def get_database(self) -> AsyncIOMotorDatabase:
        """Get database instance"""
        if not self.db:
            raise RuntimeError("Database not connected. Call connect() first.")
        return self.db


# Singleton instance
database = Database()


def get_db() -> AsyncIOMotorDatabase:
    """Dependency for FastAPI routes"""
    return database.get_database()

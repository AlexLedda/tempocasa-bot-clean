"""
Database Indexes Setup
Crea indici MongoDB per ottimizzare le query
"""
import asyncio
import logging
from motor.motor_asyncio import AsyncIOMotorDatabase

logger = logging.getLogger(__name__)


async def create_indexes(db: AsyncIOMotorDatabase):
    """
    Crea tutti gli indici necessari per le collections MongoDB
    
    Args:
        db: Database MongoDB instance
    """
    logger.info("Creating MongoDB indexes...")
    
    try:
        # Users collection
        await db.users.create_index("username", unique=True)
        await db.users.create_index("email")
        await db.users.create_index("id", unique=True)
        logger.info("✓ Users indexes created")
        
        # Properties collection
        await db.properties.create_index("id", unique=True)
        await db.properties.create_index("agent_id")
        await db.properties.create_index("status")
        await db.properties.create_index("property_type")
        await db.properties.create_index("location")
        await db.properties.create_index("price")
        await db.properties.create_index([("created_at", -1)])  # Descending
        logger.info("✓ Properties indexes created")
        
        # Clients collection
        await db.clients.create_index("phone", unique=True)
        await db.clients.create_index("id", unique=True)
        await db.clients.create_index("profile_completed")
        await db.clients.create_index([("created_at", -1)])
        logger.info("✓ Clients indexes created")
        
        # Messages collection
        await db.messages.create_index("id", unique=True)
        await db.messages.create_index("client_phone")
        await db.messages.create_index([("timestamp", -1)])
        await db.messages.create_index([("client_phone", 1), ("timestamp", -1)])  # Compound
        logger.info("✓ Messages indexes created")
        
        # Appointments collection
        await db.appointments.create_index("id", unique=True)
        await db.appointments.create_index("client_phone")
        await db.appointments.create_index("property_id")
        await db.appointments.create_index("status")
        await db.appointments.create_index([("appointment_date", 1)])
        logger.info("✓ Appointments indexes created")
        
        # Valuations collection
        await db.valuations.create_index("id", unique=True)
        await db.valuations.create_index("client_phone")
        await db.valuations.create_index("status")
        await db.valuations.create_index("is_evaluated")
        await db.valuations.create_index([("created_at", -1)])
        logger.info("✓ Valuations indexes created")
        
        logger.info("All indexes created successfully!")
        
    except Exception as e:
        logger.error(f"Error creating indexes: {e}")
        raise


if __name__ == "__main__":
    # Standalone execution for initial setup
    import os
    from dotenv import load_dotenv
    from motor.motor_asyncio import AsyncIOMotorClient
    
    load_dotenv()
    
    mongo_url = os.environ["MONGO_URL"]
    db_name = os.environ["DB_NAME"]
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    asyncio.run(create_indexes(db))
    client.close()

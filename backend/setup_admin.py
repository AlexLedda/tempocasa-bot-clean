"""
Script semplice per creare admin
"""
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path
from auth import get_password_hash
import secrets

# Load environment
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

async def setup_admin():
    """Crea utente admin"""
    # Connect to MongoDB
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    # Admin credentials
    admin_email = "admin@tempocasa.it"
    admin_password = "Admin123!"  # Change dopo primo login
    admin_name = "Admin Tempocasa"
    
    # Check if admin exists
    existing = await db.users.find_one({"email": admin_email})
    if existing:
        print(f"✅ Admin già esistente: {admin_email}")
        client.close()
        return
    
    # Create admin
    from datetime import datetime, timezone
    admin_dict = {
        "id": secrets.token_urlsafe(16),
        "email": admin_email,
        "full_name": admin_name,
        "role": "admin",
        "is_active": True,
        "hashed_password": get_password_hash(admin_password),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "last_login": None
    }
    
    await db.users.insert_one(admin_dict)
    
    print("\n✅ Utente admin creato!")
    print(f"📧 Email: {admin_email}")
    print(f"🔑 Password: {admin_password}")
    print(f"⚠️  CAMBIA LA PASSWORD DOPO IL PRIMO LOGIN!")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(setup_admin())

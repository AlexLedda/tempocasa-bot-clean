"""
Script per creare admin con username
"""
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path
from auth import get_password_hash
import secrets
from datetime import datetime, timezone

# Load environment
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

async def setup_admin():
    """Crea utente admin con username"""
    # Connect to MongoDB
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    # Elimina tutti gli utenti admin esistenti
    await db.users.delete_many({"role": "admin"})
    print("✅ Vecchi admin eliminati")
    
    # Nuove credenziali
    admin_username = "admin"
    admin_password = "Corneto1."
    admin_name = "Admin"
    
    # Create admin
    admin_dict = {
        "id": secrets.token_urlsafe(16),
        "username": admin_username,
        "email": None,  # Opzionale
        "full_name": admin_name,
        "role": "admin",
        "is_active": True,
        "hashed_password": get_password_hash(admin_password),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "last_login": None
    }
    
    await db.users.insert_one(admin_dict)
    
    print("\n✅ Utente admin creato!")
    print(f"👤 Username: {admin_username}")
    print(f"🔑 Password: {admin_password}")
    print(f"✨ Role: admin")
    print(f"\n🚀 Usa questi dati per il login!")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(setup_admin())

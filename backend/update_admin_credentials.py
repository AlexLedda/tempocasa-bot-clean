"""
Script per aggiornare credenziali admin
"""
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path
from auth import get_password_hash
from datetime import datetime, timezone

# Load environment
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

async def update_admin():
    """Aggiorna credenziali admin"""
    # Connect to MongoDB
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    # Nuove credenziali
    new_email = "admin@tempocasa.it"  # Manteniamo formato email valido
    new_password = "Corneto1."
    
    # Elimina vecchio admin se esiste
    await db.users.delete_many({"role": "admin"})
    print("✅ Vecchi admin eliminati")
    
    # Crea nuovo admin con password aggiornata
    import secrets
    admin_dict = {
        "id": secrets.token_urlsafe(16),
        "email": new_email,
        "full_name": "Admin",
        "role": "admin",
        "is_active": True,
        "hashed_password": get_password_hash(new_password),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "last_login": None
    }
    
    await db.users.insert_one(admin_dict)
    
    print("\n✅ Credenziali admin aggiornate!")
    print(f"📧 Email: {new_email}")
    print(f"🔑 Password: {new_password}")
    print(f"\n⚠️  Usa 'admin@tempocasa.it' come email per login")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(update_admin())

"""
Script per creare admin su MongoDB Atlas
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from auth import get_password_hash
import secrets
from datetime import datetime, timezone

# MongoDB Atlas URL
ATLAS_URL = "mongodb+srv://leddaalessandro336_db_user:Corneto1.@cluster0.eczvwlq.mongodb.net/?appName=Cluster0"
DB_NAME = "real_estate_bot"

async def create_admin_on_atlas():
    """Crea utente admin direttamente su Atlas"""
    print("\n🔧 Connessione a MongoDB Atlas...")
    
    try:
        # Connect to Atlas
        client = AsyncIOMotorClient(ATLAS_URL)
        db = client[DB_NAME]
        
        # Test connection
        await db.command('ping')
        print("✅ Connesso a MongoDB Atlas!")
        
        # Check existing admin
        existing = await db.users.find_one({"username": "admin"})
        if existing:
            print("\n⚠️  Utente 'admin' già esistente! Aggiorno...")
            # Delete existing
            await db.users.delete_one({"username": "admin"})
            print("✅ Vecchio admin eliminato")
        
        # Create new admin
        print("\n👤 Creazione nuovo admin...")
        
        admin_dict = {
            "id": secrets.token_urlsafe(16),
            "username": "admin",
            "email": None,
            "full_name": "Admin",
            "role": "admin",
            "is_active": True,
            "hashed_password": get_password_hash("Corneto1."),
            "created_at": datetime.now(timezone.utc).isoformat(),
            "last_login": None
        }
        
        await db.users.insert_one(admin_dict)
        
        print("\n" + "=" * 50)
        print("✅ UTENTE ADMIN CREATO SU MONGODB ATLAS!")
        print("=" * 50)
        print("👤 Username: admin")
        print("🔑 Password: Corneto1.")
        print("=" * 50)
        print("\n🚀 Ora puoi fare login su Render!")
        
        # Verify
        verify = await db.users.find_one({"username": "admin"})
        if verify:
            print("\n✅ Verifica: Admin trovato nel database!")
            print(f"   - ID: {verify['id']}")
            print(f"   - Username: {verify['username']}")
            print(f"   - Role: {verify['role']}")
            print(f"   - Active: {verify['is_active']}")
        
        client.close()
        
    except Exception as e:
        print(f"\n❌ Errore: {str(e)}")
        print("\n💡 Possibile problema con caratteri speciali nella password.")
        print("   Provo con password URL-encoded...")
        
        # Retry with encoded password
        try:
            ATLAS_URL_ENCODED = "mongodb+srv://leddaalessandro336_db_user:Corneto1%2E@cluster0.eczvwlq.mongodb.net/?appName=Cluster0"
            client = AsyncIOMotorClient(ATLAS_URL_ENCODED)
            db = client[DB_NAME]
            
            await db.command('ping')
            print("✅ Connesso con URL encoded!")
            
            # Delete existing
            await db.users.delete_many({"username": "admin"})
            
            # Create admin
            admin_dict = {
                "id": secrets.token_urlsafe(16),
                "username": "admin",
                "email": None,
                "full_name": "Admin",
                "role": "admin",
                "is_active": True,
                "hashed_password": get_password_hash("Corneto1."),
                "created_at": datetime.now(timezone.utc).isoformat(),
                "last_login": None
            }
            
            await db.users.insert_one(admin_dict)
            
            print("\n" + "=" * 50)
            print("✅ UTENTE ADMIN CREATO SU MONGODB ATLAS!")
            print("=" * 50)
            print("👤 Username: admin")
            print("🔑 Password: Corneto1.")
            print("=" * 50)
            
            client.close()
            
        except Exception as e2:
            print(f"\n❌ Errore anche con encoding: {str(e2)}")

if __name__ == "__main__":
    print("=" * 50)
    print("📝 CREAZIONE ADMIN SU MONGODB ATLAS")
    print("=" * 50)
    print()
    
    asyncio.run(create_admin_on_atlas())

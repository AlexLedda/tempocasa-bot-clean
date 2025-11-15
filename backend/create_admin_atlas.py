"""
Script per creare admin direttamente su MongoDB Atlas
Da eseguire localmente per inserire utente su database produzione
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from auth import get_password_hash
import secrets
from datetime import datetime, timezone

# MONGODB ATLAS URL
# Inserisci qui l'URL di MongoDB Atlas
ATLAS_URL = input("Inserisci MongoDB Atlas URL: ").strip()
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
            print("\n⚠️  Utente 'admin' già esistente!")
            overwrite = input("Vuoi sovrascrivere? (y/N): ").strip().lower()
            if overwrite != 'y':
                print("❌ Operazione annullata")
                client.close()
                return
            
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
        
        print("\n✅ Utente admin creato su MongoDB Atlas!")
        print("=" * 50)
        print("👤 Username: admin")
        print("🔑 Password: Corneto1.")
        print("=" * 50)
        print("\n🚀 Ora puoi fare login su Render!")
        
        client.close()
        
    except Exception as e:
        print(f"\n❌ Errore: {str(e)}")
        print("\n💡 Assicurati che:")
        print("   1. L'URL MongoDB Atlas sia corretto")
        print("   2. Il tuo IP sia whitelistato su Atlas (0.0.0.0/0)")
        print("   3. La password non contenga caratteri speciali non encoded")

if __name__ == "__main__":
    print("=" * 50)
    print("📝 CREAZIONE ADMIN SU MONGODB ATLAS")
    print("=" * 50)
    print()
    
    asyncio.run(create_admin_on_atlas())

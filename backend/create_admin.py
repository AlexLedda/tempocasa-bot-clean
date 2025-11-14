"""
Script per creare il primo utente admin
Eseguire con: python create_admin.py
"""
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path
from auth import User, get_password_hash
from datetime import datetime, timezone

# Load environment
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

async def create_admin_user():
    """Crea utente admin se non esiste"""
    # Connect to MongoDB
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    # Admin credentials
    admin_email = input("Email admin (default: admin@tempocasa.it): ").strip() or "admin@tempocasa.it"
    admin_password = input("Password admin (min 8 caratteri): ").strip()
    
    if len(admin_password) < 8:
        print("❌ Password troppo corta. Minimo 8 caratteri.")
        return
    
    admin_name = input("Nome completo (default: Admin): ").strip() or "Admin"
    
    # Check if admin already exists
    existing = await db.users.find_one({"email": admin_email})
    if existing:
        print(f"❌ Utente con email {admin_email} già esistente!")
        
        overwrite = input("Vuoi sovrascrivere? (y/N): ").strip().lower()
        if overwrite != 'y':
            print("❌ Operazione annullata")
            return
        
        # Delete existing
        await db.users.delete_one({"email": admin_email})
        print(f"✅ Utente esistente eliminato")
    
    # Create admin user
    admin = User(
        email=admin_email,
        full_name=admin_name,
        role="admin",
        is_active=True,
        hashed_password=get_password_hash(admin_password)
    )
    
    # Save to database
    user_dict = admin.model_dump()
    user_dict['created_at'] = user_dict['created_at'].isoformat()
    if user_dict.get('last_login'):
        user_dict['last_login'] = user_dict['last_login'].isoformat()
    
    await db.users.insert_one(user_dict)
    
    print("\n✅ Utente admin creato con successo!")
    print(f"📧 Email: {admin_email}")
    print(f"👤 Nome: {admin_name}")
    print(f"🔑 Role: admin")
    print(f"\n🚀 Puoi ora fare login con queste credenziali!")
    
    # Close connection
    client.close()

if __name__ == "__main__":
    print("=" * 50)
    print("📝 CREAZIONE UTENTE ADMIN")
    print("=" * 50)
    print()
    
    asyncio.run(create_admin_user())

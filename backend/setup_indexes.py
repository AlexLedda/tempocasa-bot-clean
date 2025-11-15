"""
Setup MongoDB Indexes per Ottimizzazione Performance
Esegui questo script per creare indici ottimizzati
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')


async def create_indexes():
    """
    Crea indici MongoDB per migliorare performance delle query
    """
    # Connetti a MongoDB
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    print("🚀 Creazione indici MongoDB...")
    
    try:
        # Indici per Properties
        print("\n📍 Indici Properties...")
        await db.properties.create_index([("location", 1)])
        await db.properties.create_index([("property_type", 1)])
        await db.properties.create_index([("price", 1)])
        await db.properties.create_index([("status", 1)])
        await db.properties.create_index([("reference", 1)], unique=True, sparse=True)
        # Indice composto per ricerche comuni
        await db.properties.create_index([
            ("property_type", 1),
            ("location", 1),
            ("price", 1)
        ])
        print("   ✅ Indici Properties creati")
        
        # Indici per Clients
        print("\n👥 Indici Clients...")
        await db.clients.create_index([("phone", 1)], unique=True)
        await db.clients.create_index([("email", 1)], sparse=True)
        await db.clients.create_index([("created_at", -1)])
        await db.clients.create_index([("name", 1)])
        print("   ✅ Indici Clients creati")
        
        # Indici per Appointments
        print("\n📅 Indici Appointments...")
        await db.appointments.create_index([("client_phone", 1)])
        await db.appointments.create_index([("property_id", 1)])
        await db.appointments.create_index([("appointment_date", 1)])
        await db.appointments.create_index([("status", 1)])
        await db.appointments.create_index([("created_at", -1)])
        # Indice composto per query comuni
        await db.appointments.create_index([
            ("client_phone", 1),
            ("appointment_date", -1)
        ])
        print("   ✅ Indici Appointments creati")
        
        # Indici per Valuations
        print("\n📋 Indici Valuations...")
        await db.valuations.create_index([("client_phone", 1)])
        await db.valuations.create_index([("property_location", 1)])
        await db.valuations.create_index([("status", 1)])
        await db.valuations.create_index([("created_at", -1)])
        await db.valuations.create_index([("is_evaluated", 1)])
        print("   ✅ Indici Valuations creati")
        
        # Indici per Users
        print("\n👤 Indici Users...")
        await db.users.create_index([("username", 1)], unique=True)
        await db.users.create_index([("email", 1)], unique=True, sparse=True)
        print("   ✅ Indici Users creati")
        
        # Indici per Bot Conversations (nuovo)
        print("\n🤖 Indici Bot Conversations...")
        await db.bot_conversations.create_index([("phone_number", 1)])
        await db.bot_conversations.create_index([("timestamp", -1)])
        await db.bot_conversations.create_index([("intent", 1)])
        await db.bot_conversations.create_index([("useful", 1)])
        # Indice text per ricerca full-text
        await db.bot_conversations.create_index([("user_message", "text")])
        print("   ✅ Indici Bot Conversations creati")
        
        # Indici per Settings
        print("\n⚙️ Indici Settings...")
        await db.settings.create_index([("key", 1)], unique=True)
        print("   ✅ Indici Settings creati")
        
        print("\n✅ Tutti gli indici sono stati creati con successo!")
        
        # Mostra statistiche indici
        print("\n📊 Riepilogo Indici:")
        collections = ['properties', 'clients', 'appointments', 'valuations', 'users', 'bot_conversations', 'settings']
        
        for coll_name in collections:
            indexes = await db[coll_name].index_information()
            print(f"   {coll_name}: {len(indexes)} indici")
        
    except Exception as e:
        print(f"\n❌ Errore durante la creazione degli indici: {str(e)}")
        raise
    finally:
        client.close()


if __name__ == "__main__":
    print("=" * 60)
    print("  MongoDB Index Setup - Ottimizzazione Performance")
    print("=" * 60)
    
    asyncio.run(create_indexes())
    
    print("\n" + "=" * 60)
    print("  Setup completato!")
    print("=" * 60)

#!/usr/bin/env python3
"""
Script to update admin user password with bcrypt hash
"""
from pymongo import MongoClient
from datetime import datetime

# MongoDB connection
MONGO_URL = "mongodb+srv://leddaalessandro336_db_user:Corneto123@cluster0.eczvwlq.mongodb.net/vision3d_production"
DB_NAME = "vision3d_production"

# Pre-generated bcrypt hash for password "Corneto1."
HASHED_PASSWORD = "$2b$12$RYV5Hg.PCU1zkpbll3k7pOyPddntqs02yGW0lP8Z.WnWyJ47iZJnK"

def update_admin_user():
    """Update admin user with bcrypt hashed password"""
    try:
        # Connect to MongoDB
        client = MongoClient(MONGO_URL)
        db = client[DB_NAME]
        
        # User data
        username = "leddaalessandro336"
        email = "leddaalessandro336@gmail.com"
        full_name = "Alessandro Ledda"
        
        # Update or create user
        users_collection = db['users']
        
        result = users_collection.update_one(
            {"username": username},
            {
                "$set": {
                    "email": email,
                    "full_name": full_name,
                    "hashed_password": HASHED_PASSWORD,
                    "role": "admin",
                    "is_active": True,
                    "phone": None,
                    "avatar": None
                },
                "$setOnInsert": {
                    "created_at": datetime.utcnow(),
                    "last_login": None
                }
            },
            upsert=True
        )
        
        if result.matched_count > 0:
            print("✅ User updated!")
        else:
            print("✅ User created!")
        
        print(f"\n📧 Email: {email}")
        print(f"👤 Username: {username}")
        print(f"🔑 Password: Corneto1.")
        print(f"🎭 Role: admin")
        print(f"\n🌐 Login at: https://tempocasa-frontend-fnpu.onrender.com/login")
        print(f"\n💡 IMPORTANT: Use USERNAME '{username}' (not email) to login!")
        
        client.close()
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    update_admin_user()

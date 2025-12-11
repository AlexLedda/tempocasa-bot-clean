#!/usr/bin/env python3
"""
Script to retrieve existing users from MongoDB
"""
import os
from pymongo import MongoClient

# MongoDB connection
MONGO_URL = "mongodb+srv://leddaalessandro336_db_user:Corneto123@cluster0.eczvwlq.mongodb.net/vision3d_production"
DB_NAME = "vision3d_production"

def get_users():
    """Retrieve all users from database"""
    try:
        # Connect to MongoDB
        client = MongoClient(MONGO_URL)
        db = client[DB_NAME]
        
        # Get users collection
        users_collection = db['users']
        
        # Find all users
        users = list(users_collection.find({}, {
            'password': 0  # Exclude password hash for security
        }))
        
        print(f"\n✅ Found {len(users)} users in database:\n")
        
        for i, user in enumerate(users, 1):
            print(f"User {i}:")
            print(f"  ID: {user.get('_id')}")
            print(f"  Email: {user.get('email', 'N/A')}")
            print(f"  Username: {user.get('username', 'N/A')}")
            print(f"  Name: {user.get('name', 'N/A')}")
            print(f"  Role: {user.get('role', 'N/A')}")
            print(f"  Created: {user.get('created_at', 'N/A')}")
            print()
        
        client.close()
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    get_users()

"""
Simple Redis test without dependencies
"""
import asyncio


async def test_redis():
    print("🧪 Testing Redis Connection...")
    print("-" * 50)
    
    try:
        from redis import asyncio as aioredis
        
        # Connect
        print("\n1. Connecting to redis://localhost:6379...")
        redis = await aioredis.from_url(
            "redis://localhost:6379",
            encoding="utf-8",
            decode_responses=True
        )
        
        # Ping
        response = await redis.ping()
        print(f"   ✅ PING: {response}")
        
        # Set
        await redis.set("test_key", "Hello Redis!", ex=60)
        print("   ✅ SET test_key = 'Hello Redis!'")
        
        # Get
        value = await redis.get("test_key")
        print(f"   ✅ GET test_key = '{value}'")
        
        # Delete
        await redis.delete("test_key")
        print("   ✅ DELETE test_key")
        
        # Close
        await redis.close()
        print("   ✅ Connection closed")
        
        print("\n" + "=" * 50)
        print("🎉 Redis is working perfectly!")
        print("=" * 50)
        
    except ImportError:
        print("❌ Redis library not installed")
        print("   Run: pip3 install redis==5.0.1")
    except Exception as e:
        print(f"❌ Error: {e}")


if __name__ == "__main__":
    asyncio.run(test_redis())

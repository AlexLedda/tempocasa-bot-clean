"""
Quick test script per verificare Redis cache
"""
import asyncio
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from core.cache import cache, cache_result


async def test_redis():
    print("🧪 Testing Redis Cache...")
    print("-" * 50)
    
    # 1. Connect
    print("\n1. Connecting to Redis...")
    await cache.connect("redis://localhost:6379")
    
    if cache.enabled:
        print("   ✅ Redis connected!")
    else:
        print("   ❌ Redis connection failed")
        return
    
    # 2. Test basic operations
    print("\n2. Testing basic operations...")
    
    # Set
    await cache.set("test_key", {"name": "Mario", "age": 30}, expire=60)
    print("   ✅ SET test_key")
    
    # Get
    value = await cache.get("test_key")
    print(f"   ✅ GET test_key: {value}")
    
    # Exists
    exists = await cache.exists("test_key")
    print(f"   ✅ EXISTS test_key: {exists}")
    
    # Delete
    await cache.delete("test_key")
    print("   ✅ DELETE test_key")
    
    # Verify deleted
    value = await cache.get("test_key")
    print(f"   ✅ GET test_key (after delete): {value}")
    
    # 3. Test decorator
    print("\n3. Testing @cache_result decorator...")
    
    @cache_result(expire=60, key_prefix="test")
    async def expensive_function(x, y):
        print(f"   💰 Executing expensive function({x}, {y})")
        await asyncio.sleep(0.1)  # Simulate slow operation
        return x + y
    
    # First call - cache miss
    print("   First call (cache miss):")
    result1 = await expensive_function(5, 3)
    print(f"   Result: {result1}")
    
    # Second call - cache hit
    print("   Second call (cache hit):")
    result2 = await expensive_function(5, 3)
    print(f"   Result: {result2}")
    
    # 4. Test pattern delete
    print("\n4. Testing pattern delete...")
    await cache.set("user:1", {"name": "User1"})
    await cache.set("user:2", {"name": "User2"})
    await cache.set("user:3", {"name": "User3"})
    print("   ✅ Created 3 user keys")
    
    count = await cache.clear_pattern("user:*")
    print(f"   ✅ Deleted {count} keys matching 'user:*'")
    
    # 5. Disconnect
    print("\n5. Disconnecting...")
    await cache.disconnect()
    print("   ✅ Disconnected")
    
    print("\n" + "=" * 50)
    print("🎉 All tests passed!")
    print("=" * 50)


if __name__ == "__main__":
    asyncio.run(test_redis())

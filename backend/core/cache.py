"""
Redis Cache Module
Implementa caching con Redis per migliorare performance
"""
import json
import logging
from typing import Optional, Any, Callable
from functools import wraps
import hashlib

logger = logging.getLogger(__name__)

# Flag per indicare se Redis è disponibile
REDIS_AVAILABLE = False

try:
    from redis import asyncio as aioredis
    REDIS_AVAILABLE = True
except ImportError:
    logger.warning("Redis not installed. Caching disabled. Install with: pip install redis")


class RedisCache:
    """
    Redis cache manager con fallback graceful se Redis non disponibile
    """
    
    def __init__(self):
        self.redis = None
        self.enabled = False
    
    async def connect(self, url: str = "redis://localhost:6379"):
        """Connetti a Redis"""
        if not REDIS_AVAILABLE:
            logger.warning("Redis library not available. Caching disabled.")
            return
        
        try:
            self.redis = await aioredis.from_url(
                url,
                encoding="utf-8",
                decode_responses=True
            )
            # Test connection
            await self.redis.ping()
            self.enabled = True
            logger.info(f"✓ Redis connected: {url}")
        except Exception as e:
            logger.warning(f"Redis connection failed: {e}. Caching disabled.")
            self.enabled = False
    
    async def disconnect(self):
        """Disconnetti da Redis"""
        if self.redis:
            await self.redis.close()
            logger.info("Redis disconnected")
    
    async def get(self, key: str) -> Optional[Any]:
        """Ottieni valore da cache"""
        if not self.enabled:
            return None
        
        try:
            value = await self.redis.get(key)
            if value:
                return json.loads(value)
            return None
        except Exception as e:
            logger.error(f"Redis GET error: {e}")
            return None
    
    async def set(
        self, 
        key: str, 
        value: Any, 
        expire: int = 300
    ) -> bool:
        """Salva valore in cache con TTL"""
        if not self.enabled:
            return False
        
        try:
            serialized = json.dumps(value, default=str)
            await self.redis.set(key, serialized, ex=expire)
            return True
        except Exception as e:
            logger.error(f"Redis SET error: {e}")
            return False
    
    async def delete(self, key: str) -> bool:
        """Elimina chiave da cache"""
        if not self.enabled:
            return False
        
        try:
            await self.redis.delete(key)
            return True
        except Exception as e:
            logger.error(f"Redis DELETE error: {e}")
            return False
    
    async def clear_pattern(self, pattern: str) -> int:
        """Elimina tutte le chiavi che matchano pattern"""
        if not self.enabled:
            return 0
        
        try:
            keys = await self.redis.keys(pattern)
            if keys:
                return await self.redis.delete(*keys)
            return 0
        except Exception as e:
            logger.error(f"Redis CLEAR error: {e}")
            return 0
    
    async def exists(self, key: str) -> bool:
        """Controlla se chiave esiste"""
        if not self.enabled:
            return False
        
        try:
            return await self.redis.exists(key) > 0
        except Exception as e:
            logger.error(f"Redis EXISTS error: {e}")
            return False


# Singleton instance
cache = RedisCache()


def cache_key(*args, **kwargs) -> str:
    """
    Genera cache key da argomenti funzione
    """
    # Combina args e kwargs in stringa
    key_parts = [str(arg) for arg in args]
    key_parts.extend([f"{k}={v}" for k, v in sorted(kwargs.items())])
    key_string = ":".join(key_parts)
    
    # Hash per chiavi lunghe
    if len(key_string) > 100:
        return hashlib.md5(key_string.encode()).hexdigest()
    
    return key_string


def cache_result(
    expire: int = 300,
    key_prefix: str = "",
    skip_if: Callable = None
):
    """
    Decorator per cachare risultati funzioni async
    
    Args:
        expire: TTL in secondi (default: 5 minuti)
        key_prefix: Prefisso per cache key
        skip_if: Funzione che ritorna True se skip caching
    
    Example:
        @cache_result(expire=600, key_prefix="properties")
        async def get_properties(status: str):
            return await db.properties.find({"status": status}).to_list(100)
    """
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Skip se caching disabilitato
            if not cache.enabled:
                return await func(*args, **kwargs)
            
            # Skip se condizione specificata
            if skip_if and skip_if(*args, **kwargs):
                return await func(*args, **kwargs)
            
            # Genera cache key
            func_name = func.__name__
            args_key = cache_key(*args, **kwargs)
            full_key = f"{key_prefix}:{func_name}:{args_key}" if key_prefix else f"{func_name}:{args_key}"
            
            # Try cache
            cached = await cache.get(full_key)
            if cached is not None:
                logger.debug(f"Cache HIT: {full_key}")
                return cached
            
            # Cache miss - esegui funzione
            logger.debug(f"Cache MISS: {full_key}")
            result = await func(*args, **kwargs)
            
            # Salva in cache
            await cache.set(full_key, result, expire)
            
            return result
        
        return wrapper
    return decorator


async def invalidate_cache(pattern: str):
    """
    Invalida cache per pattern
    
    Example:
        await invalidate_cache("properties:*")
    """
    if cache.enabled:
        count = await cache.clear_pattern(pattern)
        logger.info(f"Invalidated {count} cache keys matching: {pattern}")
        return count
    return 0

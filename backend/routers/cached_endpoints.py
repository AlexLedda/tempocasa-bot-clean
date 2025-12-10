"""
Cached API Endpoints
Esempi di endpoint con caching Redis
"""
from fastapi import APIRouter, Depends
from typing import List, Optional
from core import cache_result, invalidate_cache, get_db
from models.schemas import Property
from auth import User, get_current_active_user
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/cached", tags=["cached"])


@router.get("/properties", response_model=List[Property])
@cache_result(expire=600, key_prefix="properties")  # Cache 10 minuti
async def get_properties_cached(
    status: Optional[str] = None,
    location: Optional[str] = None,
    current_user: User = Depends(get_current_active_user),
    db = Depends(get_db)
):
    """
    Get properties con caching
    Cache invalidata quando si crea/modifica/elimina property
    """
    query = {}
    
    if current_user.role == "agent":
        query['agent_id'] = current_user.id
    
    if status:
        query['status'] = status
    
    if location:
        query['location'] = {'$regex': location, '$options': 'i'}
    
    properties = await db.properties.find(query, {"_id": 0}).to_list(1000)
    
    # Parse datetime
    from core.utils import parse_datetime_fields
    for prop in properties:
        parse_datetime_fields(prop, ['created_at'])
    
    return properties


@router.post("/properties/invalidate")
async def invalidate_properties_cache(
    current_user: User = Depends(get_current_active_user)
):
    """
    Invalida cache properties
    Da chiamare dopo create/update/delete
    """
    count = await invalidate_cache("properties:*")
    return {"invalidated": count, "message": "Cache invalidata"}


# Esempio: Stats dashboard con caching aggressivo
@router.get("/dashboard/stats")
@cache_result(expire=300, key_prefix="dashboard")  # Cache 5 minuti
async def get_dashboard_stats(
    current_user: User = Depends(get_current_active_user),
    db = Depends(get_db)
):
    """
    Dashboard stats con caching
    Perfetto per dati che non cambiano spesso
    """
    stats = {
        'total_properties': await db.properties.count_documents({}),
        'total_clients': await db.clients.count_documents({}),
        'pending_appointments': await db.appointments.count_documents({'status': 'confermato'}),
        'pending_valuations': await db.valuations.count_documents({'status': 'richiesta'})
    }
    
    return stats

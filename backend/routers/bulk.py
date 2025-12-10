"""
Bulk Operations Router
Operazioni massive su properties, clients, etc.
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import logging

from auth import User, get_current_admin_user
from core.database import get_db
from core import invalidate_cache

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/bulk", tags=["bulk"])


class BulkUpdateRequest(BaseModel):
    """Request per bulk update"""
    ids: List[str]
    updates: Dict[str, Any]


class BulkDeleteRequest(BaseModel):
    """Request per bulk delete"""
    ids: List[str]


class BulkStatusUpdate(BaseModel):
    """Request per cambio status multiplo"""
    property_ids: List[str]
    new_status: str  # disponibile, venduto, riservato


# ==================== PROPERTIES ====================

@router.post("/properties/update")
async def bulk_update_properties(
    request: BulkUpdateRequest,
    current_user: User = Depends(get_current_admin_user),
    db = Depends(get_db)
):
    """
    Aggiorna multipli immobili contemporaneamente
    
    Example:
        {
            "ids": ["prop1", "prop2", "prop3"],
            "updates": {
                "status": "venduto",
                "agent_id": "agent123"
            }
        }
    """
    logger.info(f"Bulk update {len(request.ids)} properties by {current_user.username}")
    
    if not request.ids:
        raise HTTPException(status_code=400, detail="Nessun ID specificato")
    
    if not request.updates:
        raise HTTPException(status_code=400, detail="Nessun aggiornamento specificato")
    
    # Perform bulk update
    result = await db.properties.update_many(
        {'id': {'$in': request.ids}},
        {'$set': request.updates}
    )
    
    # Invalidate cache
    await invalidate_cache("properties:*")
    
    logger.info(f"Bulk update completed: {result.modified_count} properties updated")
    
    return {
        'success': True,
        'matched': result.matched_count,
        'modified': result.modified_count,
        'message': f'{result.modified_count} immobili aggiornati'
    }


@router.post("/properties/status")
async def bulk_update_status(
    request: BulkStatusUpdate,
    current_user: User = Depends(get_current_admin_user),
    db = Depends(get_db)
):
    """
    Cambia status di multipli immobili
    
    Utile per:
    - Marcare come venduti
    - Riservare multipli immobili
    - Rimettere disponibili
    """
    logger.info(
        f"Bulk status update: {len(request.property_ids)} properties "
        f"to '{request.new_status}' by {current_user.username}"
    )
    
    # Validate status
    valid_statuses = ['disponibile', 'venduto', 'riservato']
    if request.new_status not in valid_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Status non valido. Usa: {', '.join(valid_statuses)}"
        )
    
    # Update
    result = await db.properties.update_many(
        {'id': {'$in': request.property_ids}},
        {'$set': {'status': request.new_status}}
    )
    
    # Invalidate cache
    await invalidate_cache("properties:*")
    
    return {
        'success': True,
        'updated': result.modified_count,
        'new_status': request.new_status,
        'message': f'{result.modified_count} immobili marcati come {request.new_status}'
    }


@router.post("/properties/delete")
async def bulk_delete_properties(
    request: BulkDeleteRequest,
    current_user: User = Depends(get_current_admin_user),
    db = Depends(get_db)
):
    """
    Elimina multipli immobili
    
    ⚠️ ATTENZIONE: Operazione irreversibile!
    """
    logger.warning(
        f"Bulk delete: {len(request.ids)} properties by {current_user.username}"
    )
    
    if not request.ids:
        raise HTTPException(status_code=400, detail="Nessun ID specificato")
    
    # Delete
    result = await db.properties.delete_many(
        {'id': {'$in': request.ids}}
    )
    
    # Invalidate cache
    await invalidate_cache("properties:*")
    
    logger.warning(f"Bulk delete completed: {result.deleted_count} properties deleted")
    
    return {
        'success': True,
        'deleted': result.deleted_count,
        'message': f'{result.deleted_count} immobili eliminati'
    }


@router.post("/properties/assign-agent")
async def bulk_assign_agent(
    property_ids: List[str],
    agent_id: str,
    current_user: User = Depends(get_current_admin_user),
    db = Depends(get_db)
):
    """
    Assegna multipli immobili a un agente
    """
    logger.info(
        f"Bulk assign: {len(property_ids)} properties to agent {agent_id} "
        f"by {current_user.username}"
    )
    
    # Verify agent exists
    agent = await db.users.find_one({'id': agent_id, 'role': 'agent'})
    if not agent:
        raise HTTPException(status_code=404, detail="Agente non trovato")
    
    # Assign
    result = await db.properties.update_many(
        {'id': {'$in': property_ids}},
        {'$set': {'agent_id': agent_id}}
    )
    
    # Invalidate cache
    await invalidate_cache("properties:*")
    
    return {
        'success': True,
        'assigned': result.modified_count,
        'agent_name': agent.get('full_name', agent.get('username')),
        'message': f'{result.modified_count} immobili assegnati a {agent.get("full_name")}'
    }


# ==================== CLIENTS ====================

@router.post("/clients/update")
async def bulk_update_clients(
    request: BulkUpdateRequest,
    current_user: User = Depends(get_current_admin_user),
    db = Depends(get_db)
):
    """
    Aggiorna multipli clienti
    """
    logger.info(f"Bulk update {len(request.ids)} clients by {current_user.username}")
    
    result = await db.clients.update_many(
        {'id': {'$in': request.ids}},
        {'$set': request.updates}
    )
    
    return {
        'success': True,
        'modified': result.modified_count,
        'message': f'{result.modified_count} clienti aggiornati'
    }


@router.post("/clients/delete")
async def bulk_delete_clients(
    request: BulkDeleteRequest,
    current_user: User = Depends(get_current_admin_user),
    db = Depends(get_db)
):
    """
    Elimina multipli clienti
    
    ⚠️ ATTENZIONE: Operazione irreversibile!
    """
    logger.warning(
        f"Bulk delete: {len(request.ids)} clients by {current_user.username}"
    )
    
    result = await db.clients.delete_many(
        {'id': {'$in': request.ids}}
    )
    
    return {
        'success': True,
        'deleted': result.deleted_count,
        'message': f'{result.deleted_count} clienti eliminati'
    }


# ==================== MESSAGES ====================

@router.post("/messages/mark-read")
async def bulk_mark_messages_read(
    message_ids: List[str],
    current_user: User = Depends(get_current_admin_user),
    db = Depends(get_db)
):
    """
    Marca multipli messaggi come letti
    """
    result = await db.messages.update_many(
        {'id': {'$in': message_ids}},
        {'$set': {'read': True}}
    )
    
    return {
        'success': True,
        'marked': result.modified_count,
        'message': f'{result.modified_count} messaggi marcati come letti'
    }


@router.post("/messages/delete")
async def bulk_delete_messages(
    request: BulkDeleteRequest,
    current_user: User = Depends(get_current_admin_user),
    db = Depends(get_db)
):
    """
    Elimina multipli messaggi
    """
    result = await db.messages.delete_many(
        {'id': {'$in': request.ids}}
    )
    
    return {
        'success': True,
        'deleted': result.deleted_count,
        'message': f'{result.deleted_count} messaggi eliminati'
    }

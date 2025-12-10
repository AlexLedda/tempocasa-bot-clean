"""
Valuation API Router
Endpoints per sistema valutazione AI con approvazione admin
"""
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from typing import List
import logging
from datetime import datetime, timezone

from models.valuation import ValuationRequest, ValuationReview, AIValuationResult
from ml.valuation_engine import PropertyValuationEngine
from auth import User, get_current_active_user, get_current_admin_user
from core.database import get_db

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/valuations", tags=["valuations"])


@router.post("/request", response_model=ValuationRequest)
async def request_valuation(
    request: ValuationRequest,
    background_tasks: BackgroundTasks,
    db = Depends(get_db)
):
    """
    Cliente richiede valutazione immobile
    L'AI fa stima automatica ma NON viene inviata al cliente
    """
    logger.info(f"New valuation request from {request.client_name}")
    
    # Crea valuation engine
    engine = PropertyValuationEngine(db)
    
    # Esegui valutazione AI
    try:
        ai_result = await engine.estimate_value({
            'property_location': request.property_location,
            'property_type': request.property_type,
            'square_meters': request.square_meters,
            'bedrooms': request.bedrooms,
            'bathrooms': request.bathrooms,
            'condition': request.condition,
            'has_parking': request.has_parking,
            'has_garden': request.has_garden,
            'has_elevator': request.has_elevator
        })
        
        # Salva risultati AI nella request
        request.ai_estimated_value = ai_result['estimated_value']
        request.ai_confidence_score = ai_result['confidence_score']
        request.ai_comparable_properties = [
            c['id'] for c in ai_result['comparable_properties']
        ]
        
        logger.info(
            f"AI estimated value: €{ai_result['estimated_value']:,.0f} "
            f"(confidence: {ai_result['confidence_score']})"
        )
        
    except Exception as e:
        logger.error(f"AI valuation failed: {e}")
        # Continua comunque, admin farà valutazione manuale
    
    # Salva nel database con status pending_review
    request_dict = request.model_dump()
    request_dict['created_at'] = request_dict['created_at'].isoformat()
    
    await db.valuation_requests.insert_one(request_dict)
    
    # Notifica admin (background task)
    background_tasks.add_task(
        notify_admin_new_valuation,
        request.id,
        request.client_name,
        request.ai_estimated_value
    )
    
    return request


@router.get("/pending", response_model=List[ValuationRequest])
async def get_pending_valuations(
    current_user: User = Depends(get_current_admin_user),
    db = Depends(get_db)
):
    """
    Admin: ottieni tutte le valutazioni in attesa di review
    """
    valuations = await db.valuation_requests.find({
        'status': 'pending_review'
    }).sort('created_at', -1).to_list(100)
    
    # Parse datetime
    for val in valuations:
        if isinstance(val.get('created_at'), str):
            val['created_at'] = datetime.fromisoformat(val['created_at'])
    
    return valuations


@router.get("/{valuation_id}", response_model=ValuationRequest)
async def get_valuation_detail(
    valuation_id: str,
    current_user: User = Depends(get_current_admin_user),
    db = Depends(get_db)
):
    """
    Admin: ottieni dettagli valutazione con AI insights
    """
    valuation = await db.valuation_requests.find_one(
        {'id': valuation_id},
        {'_id': 0}
    )
    
    if not valuation:
        raise HTTPException(status_code=404, detail="Valutazione non trovata")
    
    # Parse datetime
    if isinstance(valuation.get('created_at'), str):
        valuation['created_at'] = datetime.fromisoformat(valuation['created_at'])
    
    return valuation


@router.post("/{valuation_id}/review")
async def review_valuation(
    valuation_id: str,
    review: ValuationReview,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_admin_user),
    db = Depends(get_db)
):
    """
    Admin: approva, rigetta o aggiusta valutazione
    
    Actions:
    - approve: Usa valore AI
    - adjust: Usa valore aggiustato dall'admin
    - reject: Rigetta richiesta
    """
    logger.info(f"Admin {current_user.username} reviewing valuation {valuation_id}")
    
    # Trova valutazione
    valuation = await db.valuation_requests.find_one({'id': valuation_id})
    
    if not valuation:
        raise HTTPException(status_code=404, detail="Valutazione non trovata")
    
    if valuation['status'] != 'pending_review':
        raise HTTPException(
            status_code=400,
            detail=f"Valutazione già processata (status: {valuation['status']})"
        )
    
    # Aggiorna valutazione
    update_data = {
        'admin_reviewed_by': current_user.id,
        'admin_reviewed_at': datetime.now(timezone.utc).isoformat(),
        'admin_notes': review.notes
    }
    
    if review.action == 'approve':
        # Usa valore AI
        update_data['status'] = 'approved'
        update_data['final_value'] = valuation['ai_estimated_value']
        update_data['final_value_min'] = valuation['ai_estimated_value'] * 0.9
        update_data['final_value_max'] = valuation['ai_estimated_value'] * 1.1
        
    elif review.action == 'adjust':
        # Usa valore aggiustato dall'admin
        if not review.adjusted_value:
            raise HTTPException(
                status_code=400,
                detail="adjusted_value richiesto per action='adjust'"
            )
        
        update_data['status'] = 'approved'
        update_data['admin_adjusted_value'] = review.adjusted_value
        update_data['final_value'] = review.adjusted_value
        update_data['final_value_min'] = review.adjusted_value * 0.95
        update_data['final_value_max'] = review.adjusted_value * 1.05
        
    elif review.action == 'reject':
        update_data['status'] = 'rejected'
        
    else:
        raise HTTPException(
            status_code=400,
            detail=f"Action non valida: {review.action}"
        )
    
    # Salva nel DB
    await db.valuation_requests.update_one(
        {'id': valuation_id},
        {'$set': update_data}
    )
    
    # Se approvata, invia al cliente (background)
    if update_data['status'] == 'approved':
        background_tasks.add_task(
            send_valuation_to_client,
            valuation_id,
            valuation['client_phone'],
            update_data['final_value']
        )
    
    logger.info(
        f"Valuation {valuation_id} {review.action}ed by {current_user.username}"
    )
    
    return {
        'success': True,
        'message': f'Valutazione {review.action}ed',
        'valuation_id': valuation_id
    }


@router.get("/stats/summary")
async def get_valuation_stats(
    current_user: User = Depends(get_current_admin_user),
    db = Depends(get_db)
):
    """
    Admin: statistiche valutazioni
    """
    total = await db.valuation_requests.count_documents({})
    pending = await db.valuation_requests.count_documents({'status': 'pending_review'})
    approved = await db.valuation_requests.count_documents({'status': 'approved'})
    rejected = await db.valuation_requests.count_documents({'status': 'rejected'})
    
    # Calcola accuracy AI
    approved_valuations = await db.valuation_requests.find({
        'status': 'approved',
        'ai_estimated_value': {'$exists': True},
        'admin_adjusted_value': {'$exists': True}
    }).to_list(1000)
    
    if approved_valuations:
        differences = [
            abs(v['ai_estimated_value'] - v['admin_adjusted_value']) / v['admin_adjusted_value']
            for v in approved_valuations
        ]
        avg_difference = sum(differences) / len(differences)
        ai_accuracy = 1 - avg_difference
    else:
        ai_accuracy = None
    
    return {
        'total_requests': total,
        'pending_review': pending,
        'approved': approved,
        'rejected': rejected,
        'ai_accuracy': round(ai_accuracy, 2) if ai_accuracy else None
    }


# Background tasks

async def notify_admin_new_valuation(
    valuation_id: str,
    client_name: str,
    ai_value: float
):
    """Notifica admin di nuova richiesta valutazione"""
    logger.info(f"Notifying admin about new valuation request {valuation_id}")
    # TODO: Invia notifica Telegram/Email
    pass


async def send_valuation_to_client(
    valuation_id: str,
    client_phone: str,
    final_value: float
):
    """Invia valutazione approvata al cliente"""
    logger.info(f"Sending valuation {valuation_id} to client {client_phone}")
    # TODO: Invia via WhatsApp/Telegram
    # Messaggio: "La valutazione del tuo immobile è pronta! Valore stimato: €{final_value:,.0f}"
    pass

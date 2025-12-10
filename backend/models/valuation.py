"""
AI Property Valuation Models
Sistema di valutazione immobili con approvazione admin
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timezone
import uuid


class ValuationRequest(BaseModel):
    """Richiesta valutazione da cliente"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_phone: str
    client_name: str
    property_location: str
    property_type: str  # Appartamento, Villa, etc.
    square_meters: float
    bedrooms: int
    bathrooms: int
    floor: Optional[int] = None
    has_elevator: Optional[bool] = None
    has_parking: Optional[bool] = None
    has_garden: Optional[bool] = None
    condition: Optional[str] = None  # ottimo, buono, da ristrutturare
    year_built: Optional[int] = None
    description: Optional[str] = None
    images: List[str] = []
    
    # AI prediction
    ai_estimated_value: Optional[float] = None
    ai_confidence_score: Optional[float] = None
    ai_comparable_properties: List[str] = []
    
    # Admin review
    status: str = "pending_review"  # pending_review, approved, rejected, sent_to_client
    admin_reviewed_by: Optional[str] = None
    admin_adjusted_value: Optional[float] = None
    admin_notes: Optional[str] = None
    admin_reviewed_at: Optional[datetime] = None
    
    # Final value sent to client
    final_value: Optional[float] = None
    final_value_min: Optional[float] = None  # Range minimo
    final_value_max: Optional[float] = None  # Range massimo
    
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    sent_to_client_at: Optional[datetime] = None


class ValuationReview(BaseModel):
    """Review admin di una valutazione"""
    valuation_id: str
    action: str  # approve, reject, adjust
    adjusted_value: Optional[float] = None
    notes: Optional[str] = None


class AIValuationResult(BaseModel):
    """Risultato valutazione AI"""
    estimated_value: float
    confidence_score: float  # 0-1
    value_range_min: float
    value_range_max: float
    comparable_properties: List[dict]
    factors: dict  # Fattori che influenzano il prezzo
    recommendation: str  # Suggerimento per admin

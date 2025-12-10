"""
Pydantic Models / Schemas
Tutti i modelli Pydantic per validazione dati
"""
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
from datetime import datetime, timezone
import uuid


# ==================== PROPERTY MODELS ====================

class Property(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    reference: Optional[str] = None  # Codice annuncio (es: IMM001, A123)
    title: str
    description: str
    price: float
    location: str  # Zona (Tarquinia Centro, Lido, etc)
    street: Optional[str] = None  # Via
    street_number: Optional[str] = None  # Civico
    bedrooms: int
    bathrooms: int
    square_meters: float
    property_type: str  # Tipo principale: Ville, Appartamento, Case, etc
    property_subtype: Optional[str] = None  # Sottotipo: Villa, Bilocale, Casa indipendente, etc
    categoria_catastale: Optional[str] = None  # Es: A/2, C/1, D/8
    rendita_catastale: Optional[float] = None  # Rendita catastale in euro
    images: List[str] = []
    status: str = "disponibile"  # disponibile, venduto, riservato
    agent_id: Optional[str] = None  # ID agente assegnato
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class PropertyCreate(BaseModel):
    reference: Optional[str] = None
    title: str
    description: str
    price: float
    location: str
    street: Optional[str] = None
    street_number: Optional[str] = None
    bedrooms: int
    bathrooms: int
    square_meters: float
    property_type: str
    property_subtype: Optional[str] = None
    categoria_catastale: Optional[str] = None
    rendita_catastale: Optional[float] = None
    images: List[str] = []
    status: str = "disponibile"
    agent_id: Optional[str] = None


# ==================== CLIENT MODELS ====================

class Client(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    surname: str = ""
    phone: str
    email: Optional[str] = None
    looking_for: Optional[str] = None  # cosa cerca
    budget: Optional[float] = None
    needs_mortgage: Optional[bool] = None  # mutuo da prendere
    mortgage_amount: Optional[float] = None  # importo mutuo
    mortgage_percentage: Optional[int] = None  # percentuale mutuo
    needs_to_sell: Optional[bool] = None  # deve vendere casa attuale
    property_to_sell_location: Optional[str] = None  # ubicazione immobile da vendere
    property_already_listed: Optional[bool] = None  # già in vendita con agenzia
    wants_evaluation: Optional[bool] = None  # vuole valutazione
    notes: Optional[str] = None
    profile_completed: bool = False  # profilo completo
    conversation_completed: bool = False  # conversazione conclusa
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ClientCreate(BaseModel):
    name: str
    surname: str = ""
    phone: str
    email: Optional[str] = None
    looking_for: Optional[str] = None
    budget: Optional[float] = None
    needs_mortgage: Optional[bool] = None
    mortgage_amount: Optional[float] = None
    mortgage_percentage: Optional[int] = None
    needs_to_sell: Optional[bool] = None
    property_to_sell_location: Optional[str] = None
    property_already_listed: Optional[bool] = None
    wants_evaluation: Optional[bool] = None
    notes: Optional[str] = None
    profile_completed: bool = False
    conversation_completed: bool = False


class ClientUpdate(BaseModel):
    name: Optional[str] = None
    surname: Optional[str] = None
    email: Optional[str] = None
    looking_for: Optional[str] = None
    budget: Optional[float] = None
    needs_mortgage: Optional[bool] = None
    mortgage_amount: Optional[float] = None
    mortgage_percentage: Optional[int] = None
    needs_to_sell: Optional[bool] = None
    property_to_sell_location: Optional[str] = None
    property_already_listed: Optional[bool] = None
    wants_evaluation: Optional[bool] = None
    notes: Optional[str] = None
    profile_completed: Optional[bool] = None
    conversation_completed: Optional[bool] = None


# ==================== MESSAGE MODELS ====================

class Message(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_phone: str
    client_name: Optional[str] = None
    message: str
    direction: str  # incoming, outgoing
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    ai_response: bool = False


class MessageCreate(BaseModel):
    client_phone: str
    message: str
    direction: str
    client_name: Optional[str] = None


# ==================== APPOINTMENT MODELS ====================

class Appointment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_phone: str
    client_name: str
    property_id: str
    property_title: str
    appointment_date: datetime
    status: str = "confermato"  # confermato, completato, cancellato
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class AppointmentCreate(BaseModel):
    client_phone: str
    client_name: str
    property_id: str
    appointment_date: str
    notes: Optional[str] = None


# ==================== VALUATION MODELS ====================

class Valuation(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_phone: str
    client_name: str
    property_location: str
    property_type: Optional[str] = None
    property_description: Optional[str] = None
    already_listed: bool = False
    current_agency: Optional[str] = None
    appointment_date: Optional[datetime] = None
    status: str = "richiesta"  # richiesta, appuntamento_fissato, valutata, conclusa
    estimated_value: Optional[float] = None
    is_evaluated: bool = False  # segno di spunta se valutato
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ValuationCreate(BaseModel):
    client_phone: str
    client_name: str
    property_location: str
    property_type: Optional[str] = None
    property_description: Optional[str] = None
    already_listed: bool = False
    current_agency: Optional[str] = None
    appointment_date: Optional[str] = None
    notes: Optional[str] = None


# ==================== AI MODELS ====================

class AIResponse(BaseModel):
    response: str
    properties_mentioned: List[str] = []

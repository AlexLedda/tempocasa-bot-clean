from fastapi import FastAPI, APIRouter, HTTPException, File, UploadFile, Form, Request, Depends, status
from fastapi.responses import Response
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import shutil
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timezone
from emergentintegrations.llm.chat import LlmChat, UserMessage
import httpx
import cloudinary
import cloudinary.uploader
import cloudinary.api
from cloudinary_helpers import (
    get_optimized_url, 
    get_property_image_variants,
    get_responsive_urls,
    delete_image
)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Configure uploads directory
UPLOAD_DIR = ROOT_DIR / 'uploads'
UPLOAD_DIR.mkdir(exist_ok=True)

# Configure Cloudinary
cloudinary.config(
    cloud_name=os.environ.get('CLOUDINARY_CLOUD_NAME', ''),
    api_key=os.environ.get('CLOUDINARY_API_KEY', ''),
    api_secret=os.environ.get('CLOUDINARY_API_SECRET', '')
)

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Rate Limiting Middleware (semplice implementazione)
from collections import defaultdict
from time import time

# Dictionary per tracciare richieste per IP
request_counts = defaultdict(list)
RATE_LIMIT = 100  # max richieste
RATE_WINDOW = 60  # in secondi

@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    """
    Rate limiting: max 100 richieste al minuto per IP
    """
    client_ip = request.client.host
    current_time = time()
    
    # Pulisci vecchie richieste
    request_counts[client_ip] = [
        req_time for req_time in request_counts[client_ip]
        if current_time - req_time < RATE_WINDOW
    ]
    
    # Controlla limite
    if len(request_counts[client_ip]) >= RATE_LIMIT:
        return Response(
            content="Rate limit exceeded. Try again later.",
            status_code=429
        )
    
    # Aggiungi richiesta corrente
    request_counts[client_ip].append(current_time)
    
    response = await call_next(request)
    return response

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Define Models
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
    property_type: str  # appartamento, villa, ufficio, etc
    images: List[str] = []
    status: str = "disponibile"  # disponibile, venduto, riservato
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
    images: List[str] = []
    status: str = "disponibile"

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

class WhatsAppMessage(BaseModel):
    phone_number: str
    message: str

class WhatsAppWebhook(BaseModel):
    phone_number: str
    message: str
    timestamp: Optional[int] = None

class AIResponse(BaseModel):
    response: str
    properties_mentioned: List[str] = []


# ==================== AUTHENTICATION ENDPOINTS ====================
from auth import (
    User, UserCreate, UserLogin, UserResponse, Token,
    get_password_hash, verify_password, create_access_token,
    get_current_user, get_current_active_user, get_current_admin_user,
    user_to_response
)

@api_router.post("/auth/register", response_model=Token, tags=["auth"])
async def register(user_data: UserCreate):
    """Registra nuovo utente"""
    # Check if user already exists
    existing_user = await db.users.find_one({"username": user_data.username})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username già registrato"
        )
    
    # Create new user
    user = User(
        username=user_data.username,
        email=user_data.email,
        full_name=user_data.full_name,
        role=user_data.role,
        hashed_password=get_password_hash(user_data.password)
    )
    
    # Save to database
    user_dict = user.model_dump()
    user_dict['created_at'] = user_dict['created_at'].isoformat()
    if user_dict.get('last_login'):
        user_dict['last_login'] = user_dict['last_login'].isoformat()
    
    await db.users.insert_one(user_dict)
    
    # Create access token
    access_token = create_access_token(
        data={"sub": user.username, "user_id": user.id}
    )
    
    return Token(
        access_token=access_token,
        user=user_to_response(user)
    )


@api_router.post("/auth/login", response_model=Token, tags=["auth"])
async def login(credentials: UserLogin):
    """Login utente"""
    # Find user by username
    user_data = await db.users.find_one({"username": credentials.username}, {"_id": 0})
    
    if not user_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Username o password incorretti",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Convert datetime strings
    if isinstance(user_data.get('created_at'), str):
        user_data['created_at'] = datetime.fromisoformat(user_data['created_at'])
    if user_data.get('last_login') and isinstance(user_data.get('last_login'), str):
        user_data['last_login'] = datetime.fromisoformat(user_data['last_login'])
    
    user = User(**user_data)
    
    # Verify password
    if not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Username o password incorretti",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Utente disattivato"
        )
    
    # Update last login
    await db.users.update_one(
        {"username": user.username},
        {"$set": {"last_login": datetime.now(timezone.utc).isoformat()}}
    )
    
    # Create access token
    access_token = create_access_token(
        data={"sub": user.username, "user_id": user.id}
    )
    
    return Token(
        access_token=access_token,
        user=user_to_response(user)
    )


@api_router.get("/auth/me", response_model=UserResponse, tags=["auth"])
async def get_me(current_user: User = Depends(get_current_active_user)):
    """Ottieni informazioni utente corrente"""
    return user_to_response(current_user)


@api_router.get("/auth/users", response_model=List[UserResponse], tags=["auth"])
async def get_users(current_user: User = Depends(get_current_admin_user)):
    """Ottieni lista utenti (solo admin)"""
    users = await db.users.find({}, {"_id": 0}).to_list(100)
    
    result = []
    for user_data in users:
        if isinstance(user_data.get('created_at'), str):
            user_data['created_at'] = datetime.fromisoformat(user_data['created_at'])
        if user_data.get('last_login') and isinstance(user_data.get('last_login'), str):
            user_data['last_login'] = datetime.fromisoformat(user_data['last_login'])
        
        user = User(**user_data)
        result.append(user_to_response(user))
    
    return result


@api_router.put("/auth/users/{user_id}/toggle", response_model=UserResponse, tags=["auth"])
async def toggle_user_status(
    user_id: str,
    current_user: User = Depends(get_current_admin_user)
):
    """Attiva/disattiva utente (solo admin)"""
    user_data = await db.users.find_one({"id": user_id}, {"_id": 0})
    
    if not user_data:
        raise HTTPException(status_code=404, detail="Utente non trovato")
    
    # Toggle active status
    new_status = not user_data.get('is_active', True)
    await db.users.update_one(
        {"id": user_id},
        {"$set": {"is_active": new_status}}
    )
    
    # Get updated user
    updated_user_data = await db.users.find_one({"id": user_id}, {"_id": 0})
    
    if isinstance(updated_user_data.get('created_at'), str):
        updated_user_data['created_at'] = datetime.fromisoformat(updated_user_data['created_at'])
    if updated_user_data.get('last_login') and isinstance(updated_user_data.get('last_login'), str):
        updated_user_data['last_login'] = datetime.fromisoformat(updated_user_data['last_login'])
    
    user = User(**updated_user_data)
    return user_to_response(user)

# ==================== END AUTHENTICATION ENDPOINTS ====================

# Properties endpoints
@api_router.post("/properties", response_model=Property)
async def create_property(prop: PropertyCreate):
    property_dict = prop.model_dump()
    property_obj = Property(**property_dict)
    
    doc = property_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.properties.insert_one(doc)
    return property_obj

@api_router.get("/properties", response_model=List[Property])
async def get_properties(status: Optional[str] = None):
    query = {}
    if status:
        query['status'] = status
    
    properties = await db.properties.find(query, {"_id": 0}).to_list(1000)
    
    for prop in properties:
        if isinstance(prop['created_at'], str):
            prop['created_at'] = datetime.fromisoformat(prop['created_at'])
    
    return properties

@api_router.get("/properties/{property_id}", response_model=Property)
async def get_property(property_id: str):
    prop = await db.properties.find_one({"id": property_id}, {"_id": 0})
    if not prop:
        raise HTTPException(status_code=404, detail="Immobile non trovato")
    
    if isinstance(prop['created_at'], str):
        prop['created_at'] = datetime.fromisoformat(prop['created_at'])
    
    return prop

@api_router.put("/properties/{property_id}", response_model=Property)
async def update_property(property_id: str, prop: PropertyCreate):
    existing = await db.properties.find_one({"id": property_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Immobile non trovato")
    
    update_data = prop.model_dump()
    await db.properties.update_one(
        {"id": property_id},
        {"$set": update_data}
    )
    
    updated = await db.properties.find_one({"id": property_id}, {"_id": 0})
    if isinstance(updated['created_at'], str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    
    return updated

@api_router.delete("/properties/{property_id}")
async def delete_property(property_id: str):
    result = await db.properties.delete_one({"id": property_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Immobile non trovato")
    return {"message": "Immobile eliminato"}

# Clients endpoints
@api_router.post("/clients", response_model=Client)
async def create_client(client: ClientCreate):
    client_obj = Client(**client.model_dump())
    
    doc = client_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.clients.insert_one(doc)
    return client_obj

@api_router.get("/clients", response_model=List[Client])
async def get_clients():
    clients = await db.clients.find({}, {"_id": 0}).to_list(1000)
    
    for client in clients:
        if isinstance(client['created_at'], str):
            client['created_at'] = datetime.fromisoformat(client['created_at'])
    
    return clients

@api_router.get("/clients/{phone}", response_model=Client)
async def get_client(phone: str):
    client = await db.clients.find_one({"phone": phone}, {"_id": 0})
    if not client:
        raise HTTPException(status_code=404, detail="Cliente non trovato")
    
    if isinstance(client['created_at'], str):
        client['created_at'] = datetime.fromisoformat(client['created_at'])
    
    return client

@api_router.put("/clients/{phone}", response_model=Client)
async def update_client(phone: str, client_update: ClientUpdate):
    existing = await db.clients.find_one({"phone": phone})
    if not existing:
        raise HTTPException(status_code=404, detail="Cliente non trovato")
    
    update_data = {k: v for k, v in client_update.model_dump().items() if v is not None}
    
    if update_data:
        await db.clients.update_one(
            {"phone": phone},
            {"$set": update_data}
        )
    
    updated = await db.clients.find_one({"phone": phone}, {"_id": 0})
    if isinstance(updated['created_at'], str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    
    return updated

@api_router.delete("/clients/{phone}")
async def delete_client(phone: str):
    # Delete client
    client_result = await db.clients.delete_one({"phone": phone})
    if client_result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Cliente non trovato")
    
    # Delete associated messages
    await db.messages.delete_many({"client_phone": phone})
    
    # Delete associated appointments
    await db.appointments.delete_many({"client_phone": phone})
    
    # Delete associated valuations
    await db.valuations.delete_many({"client_phone": phone})
    
    return {"message": "Cliente e dati associati eliminati con successo"}

# Messages endpoints
@api_router.post("/messages", response_model=Message)
async def create_message(msg: MessageCreate):
    message_obj = Message(**msg.model_dump())
    
    doc = message_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    await db.messages.insert_one(doc)
    return message_obj

@api_router.get("/messages", response_model=List[Message])
async def get_messages(client_phone: Optional[str] = None):
    query = {}
    if client_phone:
        query['client_phone'] = client_phone
    
    messages = await db.messages.find(query, {"_id": 0}).sort("timestamp", -1).to_list(1000)
    
    for msg in messages:
        if isinstance(msg['timestamp'], str):
            msg['timestamp'] = datetime.fromisoformat(msg['timestamp'])
    
    return messages

# Appointments endpoints
@api_router.post("/appointments", response_model=Appointment)
async def create_appointment(appt: AppointmentCreate):
    # Get property info
    prop = await db.properties.find_one({"id": appt.property_id}, {"_id": 0})
    if not prop:
        raise HTTPException(status_code=404, detail="Immobile non trovato")
    
    appointment_dict = appt.model_dump()
    appointment_dict['property_title'] = prop['title']
    appointment_dict['appointment_date'] = datetime.fromisoformat(appt.appointment_date)
    
    appointment_obj = Appointment(**appointment_dict)
    
    doc = appointment_obj.model_dump()
    doc['appointment_date'] = doc['appointment_date'].isoformat()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.appointments.insert_one(doc)
    return appointment_obj

@api_router.get("/appointments", response_model=List[Appointment])
async def get_appointments(status: Optional[str] = None):
    query = {}
    if status:
        query['status'] = status
    
    appointments = await db.appointments.find(query, {"_id": 0}).sort("appointment_date", 1).to_list(1000)
    
    for appt in appointments:
        if isinstance(appt['appointment_date'], str):
            appt['appointment_date'] = datetime.fromisoformat(appt['appointment_date'])
        if isinstance(appt['created_at'], str):
            appt['created_at'] = datetime.fromisoformat(appt['created_at'])
    
    return appointments

@api_router.get("/appointments/{appointment_id}", response_model=Appointment)
async def get_appointment(appointment_id: str):
    appointment = await db.appointments.find_one({"id": appointment_id}, {"_id": 0})
    if not appointment:
        raise HTTPException(status_code=404, detail="Appuntamento non trovato")
    
    # Convert string dates to datetime objects if needed
    if isinstance(appointment.get('appointment_date'), str):
        appointment['appointment_date'] = datetime.fromisoformat(appointment['appointment_date'])
    if isinstance(appointment.get('created_at'), str):
        appointment['created_at'] = datetime.fromisoformat(appointment['created_at'])
    
    return appointment

@api_router.put("/appointments/{appointment_id}")
async def update_appointment_status(appointment_id: str, status: str):
    result = await db.appointments.update_one(
        {"id": appointment_id},
        {"$set": {"status": status}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Appuntamento non trovato")
    return {"message": "Appuntamento aggiornato"}

@api_router.delete("/appointments/{appointment_id}")
async def delete_appointment(appointment_id: str):
    result = await db.appointments.delete_one({"id": appointment_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Appuntamento non trovato")
    return {"message": "Appuntamento eliminato"}

# Valuations endpoints
@api_router.post("/valuations", response_model=Valuation)
async def create_valuation(valuation: ValuationCreate):
    valuation_dict = valuation.model_dump()
    
    # Convert appointment_date if provided
    if valuation_dict.get('appointment_date'):
        valuation_dict['appointment_date'] = datetime.fromisoformat(valuation.appointment_date)
    
    valuation_obj = Valuation(**valuation_dict)
    
    doc = valuation_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    if doc.get('appointment_date'):
        doc['appointment_date'] = doc['appointment_date'].isoformat()
    
    await db.valuations.insert_one(doc)
    return valuation_obj

@api_router.get("/valuations", response_model=List[Valuation])
async def get_valuations(status: Optional[str] = None):
    query = {}
    if status:
        query['status'] = status
    
    valuations = await db.valuations.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    
    for val in valuations:
        if isinstance(val['created_at'], str):
            val['created_at'] = datetime.fromisoformat(val['created_at'])
        if val.get('appointment_date') and isinstance(val['appointment_date'], str):
            val['appointment_date'] = datetime.fromisoformat(val['appointment_date'])
    
    return valuations

@api_router.get("/valuations/{valuation_id}", response_model=Valuation)
async def get_valuation(valuation_id: str):
    valuation = await db.valuations.find_one({"id": valuation_id}, {"_id": 0})
    if not valuation:
        raise HTTPException(status_code=404, detail="Valutazione non trovata")
    
    if isinstance(valuation['created_at'], str):
        valuation['created_at'] = datetime.fromisoformat(valuation['created_at'])
    if valuation.get('appointment_date') and isinstance(valuation['appointment_date'], str):
        valuation['appointment_date'] = datetime.fromisoformat(valuation['appointment_date'])
    
    return valuation

@api_router.put("/valuations/{valuation_id}")
async def update_valuation_status(
    valuation_id: str, 
    status: str, 
    estimated_value: Optional[float] = None,
    is_evaluated: Optional[bool] = None
):
    update_data = {"status": status}
    if estimated_value:
        update_data["estimated_value"] = estimated_value
    if is_evaluated is not None:
        update_data["is_evaluated"] = is_evaluated
    
    # Se lo stato è "valutata", imposta automaticamente is_evaluated a True
    if status == "valutata":
        update_data["is_evaluated"] = True
    
    result = await db.valuations.update_one(
        {"id": valuation_id},
        {"$set": update_data}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Valutazione non trovata")
    return {"message": "Valutazione aggiornata"}

@api_router.delete("/valuations/{valuation_id}")
async def delete_valuation(valuation_id: str):
    result = await db.valuations.delete_one({"id": valuation_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Valutazione non trovata")
    return {"message": "Valutazione eliminata"}

# ==================== WHATSAPP CLOUD API WEBHOOK ====================

@api_router.get("/whatsapp/webhook")
async def verify_webhook(request: Request):
    """
    Webhook verification per Meta WhatsApp Cloud API
    Meta invia una richiesta GET per verificare il webhook
    """
    # Get query parameters
    mode = request.query_params.get("hub.mode")
    token = request.query_params.get("hub.verify_token")
    challenge = request.query_params.get("hub.challenge")
    
    verify_token = os.environ.get("WHATSAPP_VERIFY_TOKEN", "tempocasa_webhook_verify_2024")
    
    logging.info(f"Webhook verification request - mode: {mode}, token: {token}")
    
    # Check if mode and token are correct
    if mode == "subscribe" and token == verify_token:
        logging.info("Webhook verified successfully!")
        return Response(content=challenge, media_type="text/plain")
    else:
        logging.error(f"Webhook verification failed - token mismatch")
        raise HTTPException(status_code=403, detail="Verification failed")


@api_router.post("/whatsapp/webhook")
async def whatsapp_webhook(request: Request):
    """
    Riceve messaggi da WhatsApp Cloud API
    """
    try:
        # Parse WhatsApp Cloud API webhook payload
        body = await request.json()
        logging.info(f"=== WHATSAPP CLOUD API WEBHOOK ===")
        logging.info(f"Payload: {body}")
        
        # Verifica struttura payload Meta
        if body.get("object") != "whatsapp_business_account":
            logging.warning(f"Invalid webhook object: {body.get('object')}")
            return {"status": "ignored"}
        
        # Estrai entry
        entries = body.get("entry", [])
        if not entries:
            logging.warning("No entries in webhook")
            return {"status": "no_entries"}
        
        # Processa ogni entry
        for entry in entries:
            changes = entry.get("changes", [])
            for change in changes:
                value = change.get("value", {})
                
                # Verifica se ci sono messaggi
                messages = value.get("messages", [])
                if not messages:
                    logging.info("No messages in this change")
                    continue
                
                # Processa ogni messaggio
                for msg in messages:
                    # Estrai info messaggio
                    message_id = msg.get("id")
                    from_number = msg.get("from")  # Numero mittente
                    message_type = msg.get("type")  # text, image, etc
                    timestamp = msg.get("timestamp")
                    
                    # Supportiamo solo messaggi di testo per ora
                    if message_type != "text":
                        logging.info(f"Unsupported message type: {message_type}")
                        continue
                    
                    text_body = msg.get("text", {}).get("body", "")
                    
                    if not from_number or not text_body:
                        logging.warning(f"Missing from or text: {from_number}, {text_body}")
                        continue
                    
                    logging.info(f"Message from {from_number}: {text_body}")
                    
                    # Processa il messaggio
                    await process_whatsapp_message(from_number, text_body, message_id)
        
        return {"status": "ok"}
        
    except Exception as e:
        logging.error(f"Error processing webhook: {e}", exc_info=True)
        return {"status": "error", "message": str(e)}


async def process_whatsapp_message(phone_number: str, message_text: str, message_id: str = None):
    """
    Processa un messaggio WhatsApp in arrivo e genera risposta AI
    """
    from whatsapp_cloud_api import get_whatsapp_client
    from bot_messages import get_welcome_message
    
    # Check if client has previous messages
    existing_messages = await db.messages.count_documents({"client_phone": phone_number})
    
    # If client exists, check if we're in an active conversation
    if existing_messages > 0:
        # Check last bot message timestamp (within last 10 minutes = active conversation)
        from datetime import datetime, timedelta, timezone
        ten_minutes_ago = datetime.now(timezone.utc) - timedelta(minutes=10)
        
        last_bot_message = await db.messages.find_one(
            {
                "client_phone": phone_number,
                "direction": "outgoing",
                "timestamp": {"$gte": ten_minutes_ago.isoformat()}
            },
            sort=[("timestamp", -1)]
        )
        
        # If bot sent a message in last 10 minutes, it's an active conversation - always respond
        if last_bot_message:
            logging.info(f"Cliente esistente - conversazione attiva")
        else:
            # Not in active conversation - check if message is a property query
            properties_cursor = db.properties.find({"status": "disponibile"}, {"_id": 0})
            properties = await properties_cursor.to_list(length=100)
            
            # Simple property query check
            property_keywords = ["casa", "appartamento", "villa", "immobile", "vendita", "affitto", "prezzo", "budget", "cerco"]
            is_property_query = any(keyword in message_text.lower() for keyword in property_keywords)
            
            # If message is NOT a property query, just save and don't respond
            if not is_property_query:
                msg = MessageCreate(
                    client_phone=phone_number,
                    message=message_text,
                    direction="incoming"
                )
                await create_message(msg)
                logging.info(f"Cliente esistente - messaggio non è query immobiliare: {message_text}")
                return
            
            # Message is a property query - proceed with AI response
            logging.info(f"Cliente esistente - query immobiliare rilevata: {message_text}")
    
    # New contact or property query - proceed with normal flow
    msg = MessageCreate(
        client_phone=phone_number,
        message=message_text,
        direction="incoming"
    )
    await create_message(msg)
    
    # Get or create client
    client = await db.clients.find_one({"phone": phone_number})
    if not client:
        new_client = ClientCreate(
            name=f"Cliente {phone_number[-4:]}",
            surname="",
            phone=phone_number,
            profile_completed=False
        )
        await create_client(new_client)
        client = await db.clients.find_one({"phone": phone_number})
    
    # Get AI response with client context
    try:
        ai_response = await get_ai_response(message_text, phone_number, client)
        
        # Check if AI wants to update client profile
        if ai_response.get("update_client"):
            update_data = ai_response["update_client"]
            await db.clients.update_one(
                {"phone": phone_number},
                {"$set": update_data}
            )
        
        # Save AI response to database
        response_msg = MessageCreate(
            client_phone=phone_number,
            message=ai_response["response"],
            direction="outgoing",
            client_name=client.get('name') if client else None
        )
        await create_message(response_msg)
        
        # Send response via WhatsApp Cloud API
        try:
            whatsapp_client = get_whatsapp_client()
            result = whatsapp_client.send_message(
                to=phone_number,
                message=ai_response["response"],
                preview_url=True
            )
            logging.info(f"Message sent to {phone_number}: {result}")
            
            # Mark original message as read
            if message_id:
                whatsapp_client.mark_message_as_read(message_id)
                
        except Exception as send_error:
            logging.error(f"Error sending WhatsApp message: {send_error}", exc_info=True)
        
    except Exception as e:
        logging.error(f"Error processing message: {e}", exc_info=True)


# Send message via WATI API
async def send_wati_message(phone_number: str, message: str):
    """Send WhatsApp message via WATI API"""
    import aiohttp
    
    wati_api_url = os.environ.get("WATI_API_URL", "")
    wati_api_token = os.environ.get("WATI_API_TOKEN", "")
    
    if not wati_api_url or not wati_api_token:
        logging.error("WATI API credentials not configured")
        return False
    
    headers = {
        "Authorization": f"Bearer {wati_api_token}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "whatsappNumber": phone_number,
        "text": message
    }
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{wati_api_url}/api/v1/sendSessionMessage/{phone_number}",
                headers=headers,
                json=payload
            ) as response:
                if response.status == 200:
                    logging.info(f"WATI message sent successfully to {phone_number}")
                    return True
                else:
                    error_text = await response.text()
                    logging.error(f"WATI API error: {response.status} - {error_text}")
                    return False
    except Exception as e:
        logging.error(f"Error sending WATI message: {e}")
        return False

# AI Chat endpoint
async def get_ai_response(message: str, client_phone: str, client: dict) -> dict:
    from ai_helpers import (
        filter_properties_by_criteria,
        format_property_for_whatsapp,
        check_calendar_availability,
        extract_property_preferences,
        parse_date_from_text,
        should_create_valuation,
        format_calendar_suggestion
    )
    
    # Get all available properties
    all_properties = await db.properties.find({"status": "disponibile"}, {"_id": 0}).to_list(100)
    
    # Filter properties based on client preferences
    prefs = extract_property_preferences(client)
    matched_properties = filter_properties_by_criteria(
        all_properties,
        property_type=prefs.get('property_type'),
        max_budget=prefs.get('max_budget'),
        min_bedrooms=prefs.get('min_bedrooms'),
        location=prefs.get('location')
    )
    
    properties = matched_properties if matched_properties else all_properties[:5]
    
    # Build context for AI
    properties_text = "\n\n".join([
        f"ID: {p['id']}\n"
        f"Titolo: {p['title']}\n"
        f"Tipo: {p['property_type']}\n"
        f"Prezzo: €{p['price']:,.2f}\n"
        f"Ubicazione: {p['location']}\n"
        f"Camere: {p['bedrooms']}, Bagni: {p['bathrooms']}, Mq: {p['square_meters']}\n"
        f"Descrizione: {p['description']}"
        for p in properties
    ])
    
    # Client profile info
    profile_completed = client.get('profile_completed', False)
    conversation_completed = client.get('conversation_completed', False)
    budget = client.get('budget') or 0
    mortgage_amount = client.get('mortgage_amount') or 0
    mortgage_percentage = client.get('mortgage_percentage') or 0
    
    client_info = f"""
Informazioni Cliente:
- Nome: {client.get('name', 'Non fornito')} {client.get('surname', '')}
- Email: {client.get('email') or 'Non fornita'}
- Cerca: {client.get('looking_for') or 'Non specificato'}
- Budget: €{budget:,.2f}
- Mutuo: {"Sì" if client.get('needs_mortgage') else "No"} {f"({mortgage_percentage}% - €{mortgage_amount:,.2f})" if mortgage_percentage else ""}
- Deve vendere: {"Sì" if client.get('needs_to_sell') else "No"}
- Casa da vendere: {client.get('property_to_sell_location') or 'Non specificata'}
- Già in vendita: {"Sì" if client.get('property_already_listed') else "No"}
- Vuole valutazione: {"Sì" if client.get('wants_evaluation') else "No"}
- Profilo Completo: {"Sì" if profile_completed else "No"}
- Conversazione Conclusa: {"Sì" if conversation_completed else "No"}
"""
    
    # Get bot configuration from MongoDB settings
    settings = await db.settings.find_one({"id": "default_settings"}, {"_id": 0})
    if settings:
        bot_name = settings.get('bot_name', 'Elettra')
        agency_name = settings.get('agency_name', 'Tempocasa Tarquinia')
    else:
        bot_name = os.environ.get('BOT_NAME', 'Elettra')
        agency_name = os.environ.get('BOT_AGENCY_NAME', 'Tempocasa Tarquinia')
    
    # Get calendar appointments to check availability
    appointments = await db.appointments.find({}, {"_id": 0}).to_list(1000)
    
    # Check if we need to create valuation
    auto_create_valuation = should_create_valuation(client)
    
    # Format matched properties for display
    matched_properties_text = "\n\n".join([
        f"🏠 IMMOBILE CONSIGLIATO #{i+1}:\n" + format_property_for_whatsapp(p)
        for i, p in enumerate(properties[:3])  # Top 3 matches
    ]) if properties else "Nessun immobile disponibile al momento."
    
    system_message = f"""Sei un assistente virtuale per un'agenzia immobiliare. Il tuo nome è {bot_name}.
Lavori per {agency_name}.

{client_info}

IMMOBILI RACCOMANDATI (in base al profilo cliente):
{matched_properties_text}

TUTTI GLI IMMOBILI DISPONIBILI:
{properties_text}

🎯 FUNZIONALITÀ INTELLIGENTI:

1. **SUGGERIMENTO IMMOBILI AUTOMATICO**:
   - Quando conosci budget e tipologia, suggerisci AUTOMATICAMENTE i 2-3 immobili più adatti
   - Usa gli "IMMOBILI RACCOMANDATI" sopra (sono già filtrati per il cliente)
   - Menziona prezzo, ubicazione, caratteristiche principali

2. **GESTIONE APPUNTAMENTI SMART**:
   - Se cliente chiede appuntamento, verifica SEMPRE disponibilità calendario
   - Calendario attuale: {len(appointments)} appuntamenti esistenti
   - Proponi orari specifici (es: "Martedì 14 ore 10:00" o "Giovedì 16 ore 15:00")
   - Se l'orario è occupato, suggerisci alternative

3. **VALUTAZIONI AUTOMATICHE**:
   - Se cliente vuole vendere E vuole valutazione: crea richiesta automaticamente
   - Usa: CREATE_VALUATION
   - Poi proponi appuntamento per valutazione

FLUSSO CONVERSAZIONE COMPLETO:

1. **PRESENTAZIONE E NOME** (se non presente):
   - Presentati solo al primo messaggio
   - Chiedi nome e cognome del cliente

2. **COSA CERCA** (se non presente):
   - Chiedi che tipo di immobile cerca
   - Zona preferita
   - Caratteristiche importanti

3. **BUDGET** (se non presente):
   - Chiedi il budget massimo
   - IMPORTANTE: Dopo il budget, chiedi SEMPRE:
     * "Ha bisogno di un mutuo per l'acquisto?"
     * Se sì: "Che percentuale vorrebbe finanziare? (es. 80%, 90%)"

4. **VENDITA CASA ATTUALE** (se non chiesto):
   - Dopo budget e mutuo, chiedi: "Deve vendere la sua casa attuale per acquistare?"
   - Se SÌ:
     * Chiedi: "Dove si trova l'immobile che deve vendere?"
     * Chiedi: "È già in vendita con un'agenzia immobiliare?"
     * Se NO (non in vendita): "Vuole fissare un appuntamento per una valutazione gratuita con la nostra agenzia?"
     * Se vuole valutazione: Chiedi disponibilità per appuntamento

5. **EMAIL** (se non presente):
   - Chiedi email per invio documentazione

6. **SUGGERIMENTI IMMOBILI**:
   - Basandoti su tutte le info raccolte, suggerisci immobili pertinenti
   - Considera budget, mutuo, e se deve vendere

7. **CHIUSURA CONVERSAZIONE**:
   - Quando hai raccolto TUTTE le informazioni (nome, budget, mutuo, vendita, email)
   - E hai suggerito almeno un immobile
   - CONCLUDI con questo messaggio ESATTO:
   
   "Verrà ricontattata da un nostro consulente per la visione dell'immobile e il consenso della privacy."
   
   - Quando invii questo messaggio, aggiungi: conversation_completed=True

REGOLE IMPORTANTI:
- Chiedi UNA informazione alla volta
- Sii cordiale e professionale
- Non ripetere "Sono Emma..." dopo la prima volta
- Usa emoji con moderazione
- Rispondi SEMPRE in italiano
- Segui l'ordine: nome → cosa cerca → budget → mutuo → percentuale mutuo → vendita casa → valutazione → email → immobili → chiusura

COMANDI SPECIALI (usa quando necessario):

**UPDATE_CLIENT:** Aggiorna profilo cliente
UPDATE_CLIENT: campo=valore|campo2=valore2

**CREATE_APPOINTMENT:** Crea appuntamento
CREATE_APPOINTMENT: property_id=xxx|date=YYYY-MM-DD|time=HH:MM|notes=testo

**CREATE_VALUATION:** Crea richiesta valutazione
CREATE_VALUATION: location=xxx|property_type=xxx|notes=testo

**CHECK_AVAILABILITY:** Verifica calendario
CHECK_AVAILABILITY: date=YYYY-MM-DD|time=HH:MM

ESEMPI COMPLETI:

Esempio 1 - Raccolta info:
UPDATE_CLIENT: name=Mario|surname=Rossi

Piacere Mario! Che tipo di immobile stai cercando?

Esempio 2 - Suggerimento immobili:
UPDATE_CLIENT: budget=300000|looking_for=appartamento 3 camere

Perfetto Mario! Ho trovato 2 appartamenti che potrebbero interessarti:

🏠 **Appartamento Luminoso Centro**
📍 Milano Centro
💰 €280.000
🛏️ 3 camere | 🚿 2 bagni | 📐 95m²
...

Esempio 3 - Appuntamento con verifica:
Cliente: "Vorrei vederlo martedì alle 15"

CHECK_AVAILABILITY: date=2024-11-12|time=15:00

[Se disponibile:]
CREATE_APPOINTMENT: property_id=xxx|date=2024-11-12|time=15:00|notes=Visita appartamento

Perfetto! Ho fissato l'appuntamento per martedì 12 novembre alle 15:00. Riceverà conferma via SMS.

[Se NON disponibile:]
Martedì 15:00 è già occupato. Posso proporle:
📅 Martedì 12/11 alle 16:00
📅 Mercoledì 13/11 alle 10:00
📅 Giovedì 14/11 alle 14:00

Quale preferisce?

Esempio 4 - Valutazione:
UPDATE_CLIENT: needs_to_sell=true|property_to_sell_location=Roma Centro|wants_evaluation=true

CREATE_VALUATION: location=Roma Centro|property_type=appartamento|notes=Cliente vuole vendere per acquistare

Perfetto! Ho registrato la richiesta di valutazione per il suo immobile a Roma Centro. Quando sarebbe disponibile per un sopralluogo gratuito?
"""
    
    # Initialize AI chat
    api_key = os.environ.get('EMERGENT_LLM_KEY')
    chat = LlmChat(
        api_key=api_key,
        session_id=f"client_{client_phone}",
        system_message=system_message
    ).with_model("anthropic", "claude-3-7-sonnet-20250219")
    
    # Send message
    user_message = UserMessage(text=message)
    response = await chat.send_message(user_message)
    
    # Parse response for commands and updates
    update_client = {}
    create_appointment = None
    create_valuation = None
    check_availability = None
    final_response = response
    
    lines = response.split("\n")
    message_lines = []
    
    for line in lines:
        line_stripped = line.strip()
        
        # UPDATE_CLIENT command
        if line_stripped.startswith("UPDATE_CLIENT:"):
            update_line = line_stripped.replace("UPDATE_CLIENT:", "").strip()
            for item in update_line.split("|"):
                if "=" in item:
                    key, value = item.split("=", 1)
                    key = key.strip()
                    value = value.strip()
                    
                    # Convert values
                    if key in ["budget", "mortgage_amount", "estimated_value"]:
                        try:
                            update_client[key] = float(value)
                        except:
                            pass
                    elif key in ["mortgage_percentage"]:
                        try:
                            update_client[key] = int(value)
                        except:
                            pass
                    elif key in ["needs_mortgage", "needs_to_sell", "property_already_listed", "wants_evaluation", "profile_completed", "conversation_completed"]:
                        update_client[key] = value.lower() in ["true", "sì", "si", "yes", "vero"]
                    else:
                        update_client[key] = value
        
        # CREATE_APPOINTMENT command
        elif line_stripped.startswith("CREATE_APPOINTMENT:"):
            appt_line = line_stripped.replace("CREATE_APPOINTMENT:", "").strip()
            create_appointment = {}
            for item in appt_line.split("|"):
                if "=" in item:
                    key, value = item.split("=", 1)
                    create_appointment[key.strip()] = value.strip()
        
        # CREATE_VALUATION command
        elif line_stripped.startswith("CREATE_VALUATION:"):
            val_line = line_stripped.replace("CREATE_VALUATION:", "").strip()
            create_valuation = {}
            for item in val_line.split("|"):
                if "=" in item:
                    key, value = item.split("=", 1)
                    create_valuation[key.strip()] = value.strip()
        
        # CHECK_AVAILABILITY command
        elif line_stripped.startswith("CHECK_AVAILABILITY:"):
            check_line = line_stripped.replace("CHECK_AVAILABILITY:", "").strip()
            check_availability = {}
            for item in check_line.split("|"):
                if "=" in item:
                    key, value = item.split("=", 1)
                    check_availability[key.strip()] = value.strip()
        
        else:
            # Regular message line
            if line.strip():
                message_lines.append(line)
    
    # Ricostruisci il messaggio senza comandi
    final_response = "\n".join(message_lines).strip()
    
    # Execute commands
    if create_appointment:
        try:
            # Create appointment in database
            appt_date_str = f"{create_appointment.get('date')} {create_appointment.get('time', '10:00')}"
            appt = AppointmentCreate(
                client_phone=client_phone,
                client_name=client.get('name', 'Cliente'),
                property_id=create_appointment.get('property_id', 'unknown'),
                appointment_date=appt_date_str,
                notes=create_appointment.get('notes', '')
            )
            # Call the appointment creation endpoint directly
            prop = await db.properties.find_one({"id": appt.property_id}, {"_id": 0})
            if prop:
                appointment_dict = appt.model_dump()
                appointment_dict['property_title'] = prop['title']
                appointment_dict['appointment_date'] = datetime.fromisoformat(appt.appointment_date)
                appointment_obj = Appointment(**appointment_dict)
                doc = appointment_obj.model_dump()
                doc['appointment_date'] = doc['appointment_date'].isoformat()
                doc['created_at'] = doc['created_at'].isoformat()
                await db.appointments.insert_one(doc)
        except Exception as e:
            logging.error(f"Error creating appointment: {e}")
    
    if create_valuation:
        try:
            # Create valuation in database
            val = ValuationCreate(
                client_phone=client_phone,
                client_name=client.get('name', 'Cliente'),
                property_location=create_valuation.get('location', ''),
                property_type=create_valuation.get('property_type'),
                notes=create_valuation.get('notes', '')
            )
            valuation_dict = val.model_dump()
            if valuation_dict.get('appointment_date'):
                valuation_dict['appointment_date'] = datetime.fromisoformat(val.appointment_date)
            valuation_obj = Valuation(**valuation_dict)
            doc = valuation_obj.model_dump()
            doc['created_at'] = doc['created_at'].isoformat()
            if doc.get('appointment_date'):
                doc['appointment_date'] = doc['appointment_date'].isoformat()
            await db.valuations.insert_one(doc)
        except Exception as e:
            logging.error(f"Error creating valuation: {e}")
    
    return {
        "response": final_response,
        "update_client": update_client,
        "properties_mentioned": [],
        "appointment_created": create_appointment is not None,
        "valuation_created": create_valuation is not None
    }

# Statistics endpoint
@api_router.get("/whatsapp/status")
async def get_whatsapp_status():
    """Get WhatsApp connection status"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get("http://localhost:3001/status", timeout=5.0)
            return response.json()
    except Exception as e:
        return {"connected": False, "status": "error", "user": None, "error": str(e)}

@api_router.get("/whatsapp/qr")
async def get_whatsapp_qr():
    """Get WhatsApp QR code"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get("http://localhost:3001/qr", timeout=5.0)
            return response.json()
    except Exception as e:
        return {"qr": None, "error": str(e)}

@api_router.post("/whatsapp/start")
async def start_whatsapp_service():
    """Start WhatsApp service via supervisor"""
    try:
        import subprocess
        result = subprocess.run(
            ["sudo", "supervisorctl", "start", "whatsapp-service"],
            capture_output=True,
            text=True,
            timeout=10
        )
        
        if result.returncode == 0 or "already started" in result.stdout.lower():
            return {
                "success": True,
                "message": "Servizio WhatsApp avviato. Il QR code apparirà tra pochi secondi.",
                "output": result.stdout
            }
        else:
            raise HTTPException(
                status_code=500,
                detail=f"Errore avvio servizio: {result.stderr or result.stdout}"
            )
    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=500, detail="Timeout durante l'avvio del servizio")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Errore: {str(e)}")

# Statistics endpoint
@api_router.get("/stats")
async def get_stats():
    total_properties = await db.properties.count_documents({})
    available_properties = await db.properties.count_documents({"status": "disponibile"})
    total_clients = await db.clients.count_documents({})
    total_messages = await db.messages.count_documents({})
    pending_appointments = await db.appointments.count_documents({"status": "confermato"})
    pending_valuations = await db.valuations.count_documents({"status": "richiesta"})
    
    return {
        "total_properties": total_properties,
        "available_properties": available_properties,
        "total_clients": total_clients,
        "total_messages": total_messages,
        "pending_appointments": pending_appointments,
        "pending_valuations": pending_valuations
    }

class BotSettings(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default="default_settings")
    bot_name: str = "Emma"
    agency_name: str = "Agenzia Immobiliare"
    primary_color: str = "#3b82f6"
    secondary_color: str = "#10b981"
    accent_color: str = "#f59e0b"
    logo_url: str = ""
    logo_public_id: str = ""  # Cloudinary public_id per eliminare vecchi logo
    auto_respond_new_only: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

@api_router.get("/settings")
async def get_settings():
    """Get bot settings from MongoDB"""
    # Try to get settings from MongoDB
    settings = await db.settings.find_one({"id": "default_settings"}, {"_id": 0})
    
    if settings:
        # Convert datetime strings back to datetime objects if needed
        if isinstance(settings.get('created_at'), str):
            settings['created_at'] = datetime.fromisoformat(settings['created_at'])
        if isinstance(settings.get('updated_at'), str):
            settings['updated_at'] = datetime.fromisoformat(settings['updated_at'])
        return settings
    
    # If no settings in DB, create default settings
    default_settings = BotSettings(
        bot_name=os.environ.get('BOT_NAME', 'Elettra'),
        agency_name=os.environ.get('BOT_AGENCY_NAME', 'Tempocasa Tarquinia'),
        primary_color=os.environ.get('PRIMARY_COLOR', '#179306')
    )
    
    # Save to MongoDB
    settings_dict = default_settings.model_dump()
    settings_dict['created_at'] = settings_dict['created_at'].isoformat()
    settings_dict['updated_at'] = settings_dict['updated_at'].isoformat()
    await db.settings.insert_one(settings_dict)
    
    return default_settings.model_dump()

@api_router.put("/settings")
async def update_settings(settings: BotSettings):
    """Update bot settings in MongoDB"""
    # Get existing settings to check for logo change
    existing = await db.settings.find_one({"id": "default_settings"})
    
    # If logo changed and there's an old logo on Cloudinary, delete it
    if existing and existing.get('logo_public_id'):
        if settings.logo_url != existing.get('logo_url'):
            try:
                # Delete old logo from Cloudinary
                cloudinary.uploader.destroy(existing['logo_public_id'])
                logging.info(f"Deleted old logo: {existing['logo_public_id']}")
            except Exception as e:
                logging.error(f"Error deleting old logo: {e}")
    
    # Update timestamp
    settings.updated_at = datetime.now(timezone.utc)
    
    # Prepare for MongoDB
    settings_dict = settings.model_dump()
    settings_dict['created_at'] = settings_dict['created_at'].isoformat()
    settings_dict['updated_at'] = settings_dict['updated_at'].isoformat()
    
    # Upsert to MongoDB (update if exists, insert if not)
    await db.settings.update_one(
        {"id": "default_settings"},
        {"$set": settings_dict},
        upsert=True
    )
    
    return {
        "message": "Impostazioni aggiornate con successo",
        "settings": settings.model_dump()
    }

@api_router.post("/upload-logo")
async def upload_logo(file: UploadFile = File(...)):
    """Upload logo image to Cloudinary and update settings"""
    # Validate file type
    allowed_types = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/svg+xml"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400, 
            detail="Formato file non valido. Sono accettati solo: JPG, PNG, WEBP, SVG"
        )
    
    # Validate file size (max 5MB)
    contents = await file.read()
    file_size = len(contents)
    
    if file_size > 5 * 1024 * 1024:  # 5MB
        raise HTTPException(status_code=400, detail="Il file è troppo grande. Massimo 5MB")
    
    # Check Cloudinary configuration
    if not all([
        os.environ.get('CLOUDINARY_CLOUD_NAME'),
        os.environ.get('CLOUDINARY_API_KEY'),
        os.environ.get('CLOUDINARY_API_SECRET')
    ]):
        raise HTTPException(
            status_code=500, 
            detail="Cloudinary non configurato. Aggiungi CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY e CLOUDINARY_API_SECRET su Render."
        )
    
    # Get existing settings to delete old logo
    existing_settings = await db.settings.find_one({"id": "default_settings"})
    
    # Delete old logo from Cloudinary if exists
    if existing_settings and existing_settings.get('logo_public_id'):
        try:
            cloudinary.uploader.destroy(existing_settings['logo_public_id'])
            logging.info(f"Deleted old logo: {existing_settings['logo_public_id']}")
        except Exception as e:
            logging.warning(f"Could not delete old logo: {e}")
    
    # Upload to Cloudinary with optimizations
    try:
        # Upload with unique public_id for logos and advanced transformations
        upload_result = cloudinary.uploader.upload(
            contents,
            folder="logos",
            public_id=f"logo_{uuid.uuid4().hex[:8]}",
            overwrite=True,
            resource_type="image",
            # Ottimizzazioni logo
            transformation=[
                {
                    'width': 300,
                    'height': 300,
                    'crop': 'limit',  # Mantiene aspect ratio
                    'quality': 'auto:best',  # Qualità automatica ottimale
                    'fetch_format': 'auto',  # WebP/AVIF automatico
                    'flags': 'progressive',  # Progressive loading
                    'dpr': 'auto'  # Device pixel ratio automatico
                }
            ],
            # Rimuove metadati per ridurre dimensioni
            strip_exif=True,
            colors=True,  # Analizza colori dominanti
            faces=False,  # Non serve face detection per logo
            quality_analysis=True  # Analisi qualità
        )
        
        logo_url = upload_result.get('secure_url')
        logo_public_id = upload_result.get('public_id')
        
        # Update settings in MongoDB with new logo
        await db.settings.update_one(
            {"id": "default_settings"},
            {
                "$set": {
                    "logo_url": logo_url,
                    "logo_public_id": logo_public_id,
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }
            },
            upsert=True
        )
        
        return {
            "success": True,
            "filename": logo_public_id,
            "url": logo_url
        }
        
    except Exception as e:
        logging.error(f"Cloudinary upload error: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Errore durante l'upload su Cloudinary: {str(e)}"
        )

@api_router.delete("/upload-logo/{filename}")
async def delete_logo(filename: str):
    """Delete uploaded logo"""
    file_path = UPLOAD_DIR / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File non trovato")
    
    try:
        file_path.unlink()  # Delete the file
        return {"success": True, "message": "Logo eliminato con successo"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Errore durante l'eliminazione: {str(e)}")

@api_router.post("/upload-property-image")
async def upload_property_image(file: UploadFile = File(...)):
    """Upload property image to Cloudinary"""
    # Validate file type
    allowed_types = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400, 
            detail="Formato file non valido. Sono accettati solo: JPG, PNG, WEBP"
        )
    
    # Validate file size (max 10MB)
    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)
    
    if file_size > 10 * 1024 * 1024:  # 10MB
        raise HTTPException(status_code=400, detail="Il file è troppo grande. Massimo 10MB")
    
    try:
        # Upload originale to Cloudinary con ottimizzazioni avanzate
        upload_result = cloudinary.uploader.upload(
            file.file,
            folder="real_estate_properties",
            resource_type="image",
            # Ottimizzazioni complete
            eager=[
                # Thumbnail - per liste (300x200)
                {
                    'width': 300,
                    'height': 200,
                    'crop': 'fill',
                    'gravity': 'auto',  # Focus automatico su parti importanti
                    'quality': 'auto:eco',  # Qualità economica per thumbnail
                    'fetch_format': 'auto',
                    'flags': 'progressive'
                },
                # Medium - per card (800x600)
                {
                    'width': 800,
                    'height': 600,
                    'crop': 'fill',
                    'gravity': 'auto',
                    'quality': 'auto:good',
                    'fetch_format': 'auto',
                    'flags': 'progressive'
                },
                # Large - per dettaglio/hero (1200x800)
                {
                    'width': 1200,
                    'height': 800,
                    'crop': 'fill',
                    'gravity': 'auto',
                    'quality': 'auto:best',
                    'fetch_format': 'auto',
                    'flags': 'progressive',
                    'dpr': 'auto'
                }
            ],
            # Opzioni globali
            strip_exif=True,  # Rimuove metadati EXIF (privacy + dimensioni)
            colors=True,  # Estrae colori dominanti
            faces=True,  # Rilevamento volti (utile per foto interni)
            quality_analysis=True,
            eager_async=False,  # Genera subito tutte le versioni
            overwrite=False,  # Non sovrascrivere se esiste
            unique_filename=True  # Nome file unico automatico
        )
        
        # Genera URL ottimizzati per ogni versione
        base_url = upload_result['secure_url']
        public_id = upload_result['public_id']
        
        # URL con transformations on-the-fly
        thumbnail_url = cloudinary.CloudinaryImage(public_id).build_url(
            width=300, height=200, crop='fill', gravity='auto',
            quality='auto:eco', fetch_format='auto'
        )
        
        medium_url = cloudinary.CloudinaryImage(public_id).build_url(
            width=800, height=600, crop='fill', gravity='auto',
            quality='auto:good', fetch_format='auto'
        )
        
        large_url = cloudinary.CloudinaryImage(public_id).build_url(
            width=1200, height=800, crop='fill', gravity='auto',
            quality='auto:best', fetch_format='auto', dpr='auto'
        )
        
        return {
            "success": True,
            "url": base_url,  # URL originale (compatibilità)
            "public_id": public_id,
            "urls": {
                "original": base_url,
                "thumbnail": thumbnail_url,  # 300x200
                "medium": medium_url,        # 800x600
                "large": large_url           # 1200x800
            },
            "metadata": {
                "width": upload_result.get('width'),
                "height": upload_result.get('height'),
                "format": upload_result.get('format'),
                "bytes": upload_result.get('bytes'),
                "colors": upload_result.get('colors', [])[:3] if upload_result.get('colors') else []
            }
        }
    except Exception as e:
        logging.error(f"Cloudinary upload error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Errore durante l'upload: {str(e)}")


# Cloudinary optimization endpoints
@api_router.get("/cloudinary/optimize/{public_id:path}")
async def get_optimized_image(
    public_id: str,
    width: Optional[int] = None,
    height: Optional[int] = None,
    quality: str = "auto:good",
    format: str = "auto"
):
    """Get optimized URL for an image"""
    try:
        url = get_optimized_url(
            public_id,
            width=width,
            height=height,
            quality=quality,
            format=format
        )
        return {"url": url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/cloudinary/variants/{public_id:path}")
async def get_image_variants(public_id: str):
    """Get all optimized variants for a property image"""
    try:
        variants = get_property_image_variants(public_id)
        return {"variants": variants}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/cloudinary/responsive/{public_id:path}")
async def get_responsive_image_urls(public_id: str, base_width: int = 800):
    """Get responsive URLs for srcset"""
    try:
        urls = get_responsive_urls(public_id, base_width=base_width)
        return {"responsive_urls": urls}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.delete("/cloudinary/image/{public_id:path}")
async def delete_cloudinary_image(public_id: str):
    """Delete an image from Cloudinary"""
    try:
        success = delete_image(public_id)
        if success:
            return {"success": True, "message": "Immagine eliminata"}
        else:
            raise HTTPException(status_code=500, detail="Impossibile eliminare l'immagine")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/")
async def root():
    return {"message": "Real Estate WhatsApp Bot API"}

# Health Check Endpoint
@api_router.get("/health")
async def health_check():
    """
    Endpoint per verificare lo stato del sistema
    """
    try:
        # Test MongoDB connection
        await db.command("ping")
        db_status = "healthy"
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"
    
    return {
        "status": "healthy" if db_status == "healthy" else "degraded",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "services": {
            "database": db_status,
            "api": "healthy"
        }
    }

# System Stats Endpoint (protetto, solo per admin)
@api_router.get("/stats/system")
async def get_system_stats(current_user = Depends(get_current_user)):
    """
    Statistiche del sistema (solo admin)
    """
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access forbidden")
    
    try:
        # Conta documenti per collezione
        stats = {
            "properties": await db.properties.count_documents({}),
            "clients": await db.clients.count_documents({}),
            "appointments": await db.appointments.count_documents({}),
            "valuations": await db.valuations.count_documents({}),
            "users": await db.users.count_documents({}),
            "conversations": await db.bot_conversations.count_documents({}) if "bot_conversations" in await db.list_collection_names() else 0,
        }
        
        # Statistiche recenti (ultimi 7 giorni)
        from datetime import timedelta
        week_ago = datetime.now(timezone.utc) - timedelta(days=7)
        
        recent_stats = {
            "new_clients_week": await db.clients.count_documents({"created_at": {"$gte": week_ago}}),
            "new_appointments_week": await db.appointments.count_documents({"created_at": {"$gte": week_ago}}),
            "new_valuations_week": await db.valuations.count_documents({"created_at": {"$gte": week_ago}}),
        }
        
        return {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "totals": stats,
            "recent": recent_stats
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Bot Learning Insights Endpoint (protetto, solo per admin)
@api_router.get("/stats/bot-insights")
async def get_bot_insights(current_user = Depends(get_current_user)):
    """
    Insights dal sistema di apprendimento del bot
    """
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access forbidden")
    
    try:
        from bot_learning import BotLearningSystem
        learning_system = BotLearningSystem(db)
        
        insights = await learning_system.generate_insights_report()
        return insights
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Include the router in the main app
app.include_router(api_router)

# Mount uploads directory for static file serving
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

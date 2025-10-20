from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Define Models
class Property(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    price: float
    location: str
    bedrooms: int
    bathrooms: int
    square_meters: float
    property_type: str  # appartamento, villa, ufficio, etc
    images: List[str] = []
    status: str = "disponibile"  # disponibile, venduto, riservato
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PropertyCreate(BaseModel):
    title: str
    description: str
    price: float
    location: str
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
    phone: str
    email: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ClientCreate(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None
    notes: Optional[str] = None

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

@api_router.put("/appointments/{appointment_id}")
async def update_appointment_status(appointment_id: str, status: str):
    result = await db.appointments.update_one(
        {"id": appointment_id},
        {"$set": {"status": status}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Appuntamento non trovato")
    return {"message": "Appuntamento aggiornato"}

# WhatsApp webhook endpoint
@api_router.post("/whatsapp/webhook")
async def whatsapp_webhook(webhook: WhatsAppWebhook):
    # Save incoming message
    msg = MessageCreate(
        client_phone=webhook.phone_number,
        message=webhook.message,
        direction="incoming"
    )
    await create_message(msg)
    
    # Get or create client
    client = await db.clients.find_one({"phone": webhook.phone_number})
    if not client:
        new_client = ClientCreate(
            name=f"Cliente {webhook.phone_number[-4:]}",
            phone=webhook.phone_number
        )
        await create_client(new_client)
    
    # Get AI response
    try:
        ai_response = await get_ai_response(webhook.message, webhook.phone_number)
        
        # Save AI response
        response_msg = MessageCreate(
            client_phone=webhook.phone_number,
            message=ai_response.response,
            direction="outgoing",
            client_name=client['name'] if client else None
        )
        response_msg_obj = await create_message(response_msg)
        response_msg_obj.ai_response = True
        
        return {"reply": ai_response.response, "success": True}
    except Exception as e:
        logging.error(f"Error processing message: {e}")
        return {"reply": "Scusa, c'è stato un errore. Un nostro agente ti contatterà presto.", "success": False}

# AI Chat endpoint
async def get_ai_response(message: str, client_phone: str) -> AIResponse:
    # Get all available properties
    properties = await db.properties.find({"status": "disponibile"}, {"_id": 0}).to_list(100)
    
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
    
    system_message = f"""Sei un assistente virtuale per un'agenzia immobiliare.

Immobili disponibili:
{properties_text}

Compiti:
1. Rispondi alle domande sugli immobili disponibili
2. Suggerisci immobili basandoti sulle esigenze del cliente
3. Se il cliente vuole prenotare una visita, chiedi data e ora preferite
4. Sii cordiale, professionale e conciso
5. Rispondi SEMPRE in italiano
6. Se chiede info su un immobile specifico, fornisci tutti i dettagli
7. Per prenotare una visita usa il formato: "PRENOTA|property_id|data_ora"

Esempi di risposta:
- "Abbiamo un bellissimo appartamento in Centro con 3 camere a €250,000. Vuoi saperne di più?"
- "Per prenotare una visita, che giorno e orario preferisci?"
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
    
    return AIResponse(response=response, properties_mentioned=[])

# Statistics endpoint
@api_router.get("/stats")
async def get_stats():
    total_properties = await db.properties.count_documents({})
    available_properties = await db.properties.count_documents({"status": "disponibile"})
    total_clients = await db.clients.count_documents({})
    total_messages = await db.messages.count_documents({})
    pending_appointments = await db.appointments.count_documents({"status": "confermato"})
    
    return {
        "total_properties": total_properties,
        "available_properties": available_properties,
        "total_clients": total_clients,
        "total_messages": total_messages,
        "pending_appointments": pending_appointments
    }

@api_router.get("/")
async def root():
    return {"message": "Real Estate WhatsApp Bot API"}

# Include the router in the main app
app.include_router(api_router)

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
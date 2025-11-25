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
    images: List[str] = []
    status: str = "disponibile"
    agent_id: Optional[str] = None

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

class AIResponse(BaseModel):
    response: str
    properties_mentioned: List[str] = []


# ==================== AUTHENTICATION ENDPOINTS ====================
from auth import (
    User, UserCreate, UserLogin, UserResponse, UserUpdate, Token,
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



@api_router.put("/auth/profile", response_model=UserResponse, tags=["auth"])
async def update_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_active_user)
):
    """Aggiorna profilo utente corrente"""
    update_data = {}
    
    if user_update.email is not None:
        update_data['email'] = user_update.email
    if user_update.phone is not None:
        update_data['phone'] = user_update.phone
    if user_update.full_name is not None:
        update_data['full_name'] = user_update.full_name
    if user_update.password is not None:
        update_data['hashed_password'] = get_password_hash(user_update.password)
    
    if not update_data:
        raise HTTPException(status_code=400, detail="Nessun dato da aggiornare")
    
    await db.users.update_one(
        {"id": current_user.id},
        {"$set": update_data}
    )
    
    # Get updated user
    updated_user_data = await db.users.find_one({"id": current_user.id}, {"_id": 0})
    
    if isinstance(updated_user_data.get('created_at'), str):
        updated_user_data['created_at'] = datetime.fromisoformat(updated_user_data['created_at'])
    if updated_user_data.get('last_login') and isinstance(updated_user_data.get('last_login'), str):
        updated_user_data['last_login'] = datetime.fromisoformat(updated_user_data['last_login'])
    
    user = User(**updated_user_data)
    return user_to_response(user)


@api_router.delete("/auth/users/{user_id}", tags=["auth"])
async def delete_user(
    user_id: str,
    current_user: User = Depends(get_current_admin_user)
):
    """Elimina utente (solo admin)"""
    # Non può eliminare se stesso
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Non puoi eliminare te stesso")
    
    result = await db.users.delete_one({"id": user_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Utente non trovato")
    
    return {"success": True, "message": "Utente eliminato"}


@api_router.post("/auth/users", response_model=UserResponse, tags=["auth"])
async def create_user_admin(
    user_data: UserCreate,
    current_user: User = Depends(get_current_admin_user)
):
    """Crea nuovo utente (solo admin)"""
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
        phone=user_data.phone,
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
    
    return user_to_response(user)

@api_router.get("/auth/users/export", tags=["auth"])
async def export_users_json(current_user: User = Depends(get_current_admin_user)):
    """Esporta tutti gli utenti in formato JSON (solo admin)"""
    users = await db.users.find({}, {"_id": 0, "hashed_password": 0}).to_list(1000)
    
    # Convert datetime to string
    for user in users:
        if user.get('created_at'):
            user['created_at'] = user['created_at'] if isinstance(user['created_at'], str) else user['created_at'].isoformat()
        if user.get('last_login'):
            user['last_login'] = user['last_login'] if isinstance(user['last_login'], str) else user['last_login'].isoformat()
    
    from fastapi.responses import JSONResponse
    return JSONResponse(
        content={"users": users, "exported_at": datetime.now(timezone.utc).isoformat()},
        headers={"Content-Disposition": "attachment; filename=users_export.json"}
    )

@api_router.post("/auth/users/avatar", tags=["auth"])
async def upload_user_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user)
):
    """Upload avatar utente su Cloudinary"""
    try:
        # Upload to Cloudinary
        result = cloudinary.uploader.upload(
            file.file,
            folder="tempocasa/avatars",
            public_id=f"user_{current_user.id}",
            overwrite=True,
            resource_type="image",
            transformation=[
                {'width': 200, 'height': 200, 'crop': 'fill', 'gravity': 'face'},
                {'quality': 'auto', 'fetch_format': 'auto'}
            ]
        )
        
        avatar_url = result['secure_url']
        
        # Update user in database
        await db.users.update_one(
            {"id": current_user.id},
            {"$set": {"avatar": avatar_url}}
        )
        
        return {"avatar_url": avatar_url, "message": "Avatar caricato con successo"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Errore caricamento avatar: {str(e)}")

@api_router.put("/auth/users/{user_id}", response_model=UserResponse, tags=["auth"])
async def update_user_admin(
    user_id: str,
    user_data: UserUpdate,
    current_user: User = Depends(get_current_active_user)
):
    """Aggiorna dati utente - Admin può modificare chiunque, Agente solo se stesso"""
    # Find user
    existing_user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not existing_user:
        raise HTTPException(status_code=404, detail="Utente non trovato")
    
    # Controllo permessi: agente può modificare solo se stesso
    if current_user.role != "admin" and current_user.id != user_id:
        raise HTTPException(
            status_code=403, 
            detail="Non autorizzato: puoi modificare solo il tuo profilo"
        )
    
    # Prepare update data
    update_dict = {}
    if user_data.full_name is not None:
        update_dict['full_name'] = user_data.full_name
    if user_data.email is not None:
        update_dict['email'] = user_data.email
    if user_data.phone is not None:
        update_dict['phone'] = user_data.phone
    if user_data.password is not None:
        update_dict['hashed_password'] = get_password_hash(user_data.password)
    
    if update_dict:
        await db.users.update_one({"id": user_id}, {"$set": update_dict})
    
    # Get updated user
    updated_user = await db.users.find_one({"id": user_id}, {"_id": 0})
    
    # Convert datetime strings
    if isinstance(updated_user.get('created_at'), str):
        updated_user['created_at'] = datetime.fromisoformat(updated_user['created_at'])
    if updated_user.get('last_login') and isinstance(updated_user.get('last_login'), str):
        updated_user['last_login'] = datetime.fromisoformat(updated_user['last_login'])
    
    user_obj = User(**updated_user)
    return user_to_response(user_obj)

@api_router.post("/auth/users/{user_id}/avatar", tags=["auth"])
async def upload_user_avatar_admin(
    user_id: str,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user)
):
    """Upload avatar - Admin per chiunque, Agente solo per se stesso"""
    # Verifica che l'utente esista
    existing_user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not existing_user:
        raise HTTPException(status_code=404, detail="Utente non trovato")
    
    # Controllo permessi: agente può modificare solo se stesso
    if current_user.role != "admin" and current_user.id != user_id:
        raise HTTPException(
            status_code=403, 
            detail="Non autorizzato: puoi modificare solo il tuo avatar"
        )
    
    try:
        # Upload to Cloudinary
        result = cloudinary.uploader.upload(
            file.file,
            folder="tempocasa/avatars",
            public_id=f"user_{user_id}",
            overwrite=True,
            resource_type="image",
            transformation=[
                {'width': 200, 'height': 200, 'crop': 'fill', 'gravity': 'face'},
                {'quality': 'auto', 'fetch_format': 'auto'}
            ]
        )
        
        avatar_url = result['secure_url']
        
        # Update user in database
        await db.users.update_one(
            {"id": user_id},
            {"$set": {"avatar": avatar_url}}
        )
        
        return {"avatar_url": avatar_url, "message": "Avatar caricato con successo"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Errore caricamento avatar: {str(e)}")

# ==================== END AUTHENTICATION ENDPOINTS ====================

# Properties endpoints
@api_router.post("/properties", response_model=Property)
async def create_property(
    prop: PropertyCreate,
    current_user: User = Depends(get_current_active_user)
):
    property_dict = prop.model_dump()
    
    # Se l'utente è agente e non è specificato agent_id, assegna automaticamente
    if current_user.role == "agent" and not property_dict.get('agent_id'):
        property_dict['agent_id'] = current_user.id
    
    property_obj = Property(**property_dict)
    
    doc = property_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.properties.insert_one(doc)
    return property_obj

@api_router.get("/properties", response_model=List[Property])
async def get_properties(
    status: Optional[str] = None,
    current_user: User = Depends(get_current_active_user)
):
    query = {}
    
    # Se l'utente è agente, mostra solo i suoi immobili
    if current_user.role == "agent":
        query['agent_id'] = current_user.id
    
    if status:
        query['status'] = status
    
    properties = await db.properties.find(query, {"_id": 0}).to_list(1000)
    
    for prop in properties:
        # Gestisci campo created_at opzionale
        if prop.get('created_at') and isinstance(prop['created_at'], str):
            prop['created_at'] = datetime.fromisoformat(prop['created_at'])
        elif not prop.get('created_at'):
            # Aggiungi created_at di default se mancante
            prop['created_at'] = datetime.now(timezone.utc)
    
    return properties

@api_router.get("/properties/{property_id}", response_model=Property)
async def get_property(property_id: str):
    prop = await db.properties.find_one({"id": property_id}, {"_id": 0})
    if not prop:
        raise HTTPException(status_code=404, detail="Immobile non trovato")
    
    # Gestisci campo created_at opzionale
    if prop.get('created_at') and isinstance(prop['created_at'], str):
        prop['created_at'] = datetime.fromisoformat(prop['created_at'])
    elif not prop.get('created_at'):
        prop['created_at'] = datetime.now(timezone.utc)
    
    return prop

@api_router.put("/properties/{property_id}", response_model=Property)
async def update_property(
    property_id: str,
    prop: PropertyCreate,
    current_user: User = Depends(get_current_active_user)
):
    existing = await db.properties.find_one({"id": property_id})
    
    # Se l'utente è agente, può modificare solo i suoi immobili
    if current_user.role == "agent" and existing.get('agent_id') != current_user.id:
        raise HTTPException(status_code=403, detail="Non autorizzato a modificare questo immobile")
    
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
async def delete_property(
    property_id: str,
    current_user: User = Depends(get_current_active_user)
):
    # Verifica proprietà
    existing = await db.properties.find_one({"id": property_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Immobile non trovato")
    
    # Se l'utente è agente, può eliminare solo i suoi immobili
    if current_user.role == "agent" and existing.get('agent_id') != current_user.id:
        raise HTTPException(status_code=403, detail="Non autorizzato a eliminare questo immobile")
    
    result = await db.properties.delete_one({"id": property_id})
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

@api_router.delete("/messages/{message_id}")
async def delete_message(message_id: str):
    """Elimina un messaggio specifico"""
    result = await db.messages.delete_one({"id": message_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Messaggio non trovato")
    return {"message": "Messaggio eliminato"}

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


# ==================== TELEGRAM BOT WEBHOOK ====================

@api_router.post("/telegram/webhook")
async def telegram_webhook(request: Request):
    """
    Riceve messaggi da Telegram Bot API
    """
    try:
        body = await request.json()
        logging.info("=== TELEGRAM WEBHOOK ===")
        logging.info(f"Payload: {body}")
        
        # Gestisci callback query (bottoni cliccati)
        if "callback_query" in body:
            callback = body["callback_query"]
            chat_id = str(callback["message"]["chat"]["id"])
            user_id = str(callback["from"]["id"])
            first_name = callback["from"].get("first_name", "User")
            callback_data = callback.get("data", "")
            
            logging.info(f"Callback from {first_name}: {callback_data}")
            
            # Rispondi al callback
            from telegram_bot import get_telegram_bot
            telegram_bot = get_telegram_bot()
            
            # Conferma callback (rimuove icona di caricamento)
            try:
                import requests
                requests.post(
                    f"https://api.telegram.org/bot{os.getenv('TELEGRAM_BOT_TOKEN')}/answerCallbackQuery",
                    json={"callback_query_id": callback["id"]}
                )
            except:
                pass
            
            # Gestisci callback speciali (foto, mappa, PDF, condividi)
            if callback_data.startswith(("photo_", "location_", "pdf_")):
                await handle_property_callback(callback_data, chat_id, user_id)
            elif callback_data.startswith("share_"):
                await handle_share_callback(callback_data, chat_id, user_id)
            else:
                # Processa il comando del bottone
                await process_telegram_message(chat_id, user_id, callback_data, first_name)
        
        # Verifica se c'è un messaggio
        elif "message" in body:
            message = body["message"]
            chat_id = str(message["chat"]["id"])
            user_id = str(message["from"]["id"])
            username = message["from"].get("username", "")
            first_name = message["from"].get("first_name", "User")
            
            # Supporta solo messaggi di testo per ora
            if "text" in message:
                text = message["text"]
                
                logging.info(f"Message from {first_name} (@{username}): {text}")
                
                # Gestisci comandi
                if text.startswith("/"):
                    await handle_telegram_command(chat_id, user_id, text, first_name)
                else:
                    # Processa messaggio normale
                    await process_telegram_message(chat_id, user_id, text, first_name)
        
        return {"ok": True}
        
    except Exception as e:
        logging.error(f"Error processing Telegram webhook: {e}", exc_info=True)
        return {"ok": False, "error": str(e)}


async def handle_telegram_command(chat_id: str, user_id: str, command: str, user_name: str):
    """
    Gestisce i comandi Telegram (es: /start, /appartamenti, ecc.)
    """
    from telegram_bot import get_telegram_bot
    
    telegram_bot = get_telegram_bot()
    client_identifier = f"telegram_{user_id}"
    
    # Ottieni info bot
    bot_name = os.environ.get('BOT_NAME', 'Elettra')
    agency_name = os.environ.get('BOT_AGENCY_NAME', 'Tempocasa Tarquinia')
    
    if command == "/start":
        # Carica template messaggio di benvenuto
        templates = await db.bot_templates.find_one({}, {"_id": 0})
        welcome_text = templates.get("welcome_message", f"Benvenuto! Sono {bot_name}")
        
        # Crea bottoni inline
        keyboard = {
            "inline_keyboard": [
                [
                    {"text": "🏠 Cerco casa", "callback_data": "cerco_casa"},
                    {"text": "💰 Voglio vendere", "callback_data": "voglio_vendere"}
                ],
                [
                    {"text": "📊 Valutazione gratuita", "callback_data": "valutazione"},
                    {"text": "📅 Appuntamento", "callback_data": "appuntamento"}
                ],
                [
                    {"text": "🏢 Vedi appartamenti", "callback_data": "/appartamenti"},
                    {"text": "🏡 Vedi ville", "callback_data": "/ville"}
                ],
                [
                    {"text": "📞 Contatti agenzia", "callback_data": "/contatti"}
                ]
            ]
        }
        
        telegram_bot.send_message(
            chat_id=chat_id,
            text=welcome_text,
            reply_markup=keyboard
        )
    
    elif command == "/appartamenti":
        # Mostra appartamenti disponibili con funzionalità avanzate
        from telegram_advanced_features import send_property_location, send_property_pdf
        
        properties = await db.properties.find(
            {"property_type": "Appartamento", "status": "disponibile"},
            {"_id": 0}
        ).to_list(10)
        
        if properties:
            response = "🏢 **APPARTAMENTI DISPONIBILI**\n\n"
            for i, p in enumerate(properties[:5], 1):
                response += f"{i}. {p['location']} - {p['square_meters']}mq\n"
                response += f"   💰 €{p['price']:,.0f} | 🛏️ {p['bedrooms']} camere\n"
                response += f"   {p['description'][:80]}...\n\n"
            
            response += "\n💡 Usa i bottoni per maggiori dettagli!"
            
            # Bottoni per ogni immobile
            keyboard = {
                "inline_keyboard": []
            }
            
            for i, p in enumerate(properties[:3], 1):
                keyboard["inline_keyboard"].append([
                    {"text": f"📸 Foto #{i}", "callback_data": f"photo_{i-1}"},
                    {"text": f"📍 Mappa #{i}", "callback_data": f"location_{i-1}"},
                    {"text": f"📄 PDF #{i}", "callback_data": f"pdf_{i-1}"}
                ])
            
            telegram_bot.send_message(chat_id=chat_id, text=response, reply_markup=keyboard)
            
            # Salva properties in cache per i callback
            import json
            await db.telegram_cache.update_one(
                {"chat_id": chat_id, "type": "properties"},
                {"$set": {"data": json.dumps([dict(p) for p in properties], default=str), "chat_id": chat_id, "type": "properties"}},
                upsert=True
            )
        else:
            # Carica template no properties
            templates = await db.bot_templates.find_one({}, {"_id": 0})
            no_props_msg = templates.get("no_properties_message", "Nessun immobile disponibile")
            no_props_msg = no_props_msg.replace("{property_type}", "appartamenti")
            
            telegram_bot.send_message(chat_id=chat_id, text=no_props_msg)
    
    elif command == "/ville":
        # Mostra ville disponibili
        properties = await db.properties.find(
            {"property_type": "Villa", "status": "disponibile"},
            {"_id": 0}
        ).to_list(10)
        
        if properties:
            response = "🏡 **VILLE DISPONIBILI**\n\n"
            for i, p in enumerate(properties[:5], 1):
                response += f"{i}. {p['location']} - {p['square_meters']}mq\n"
                response += f"   💰 €{p['price']:,.0f} | 🛏️ {p['bedrooms']} camere\n"
                response += f"   {p['description'][:80]}...\n\n"
            
            telegram_bot.send_message(chat_id=chat_id, text=response)
            
            # Invia foto della prima villa se disponibile
            if properties[0].get('images') and len(properties[0]['images']) > 0:
                try:
                    telegram_bot.send_photo(
                        chat_id=chat_id,
                        photo_url=properties[0]['images'][0],
                        caption=f"🏡 {properties[0]['location']} - €{properties[0]['price']:,.0f}"
                    )
                except:
                    pass
        else:
            telegram_bot.send_message(
                chat_id=chat_id,
                text="Al momento non ci sono ville disponibili. Ti contatterò appena arriveranno nuove proposte!"
            )
    
    elif command == "/valutazione":
        # Carica template valutazione
        templates = await db.bot_templates.find_one({}, {"_id": 0})
        response = templates.get("valutation_message", "Richiedi valutazione gratuita")
        
        telegram_bot.send_message(chat_id=chat_id, text=response)
    
    elif command == "/contatti":
        # Carica template contatti
        templates = await db.bot_templates.find_one({}, {"_id": 0})
        response = templates.get("contacts_message", f"Contatti {agency_name}")
        
        telegram_bot.send_message(chat_id=chat_id, text=response)
    
    elif command == "/help":
        # Carica template help
        templates = await db.bot_templates.find_one({}, {"_id": 0})
        response = templates.get("help_message", "Comandi disponibili: /start /appartamenti /ville /contatti")
        
        telegram_bot.send_message(chat_id=chat_id, text=response)
    
    elif command.startswith("/takeover"):
        # Comando admin per prendere controllo di una chat
        admin_id = os.getenv("TELEGRAM_ADMIN_ID")
        if str(user_id) != str(admin_id):
            telegram_bot.send_message(
                chat_id=chat_id,
                text="⛔ Comando riservato all'amministratore"
            )
            return
        
        # Estrai chat_id dal comando (es: /takeover_123456789)
        if "_" in command:
            target_chat_id = command.split("_")[1]
        else:
            target_chat_id = chat_id
        
        # Attiva takeover
        await db.telegram_takeovers.update_one(
            {"chat_id": target_chat_id},
            {
                "$set": {
                    "chat_id": target_chat_id,
                    "admin_id": user_id,
                    "active": True,
                    "started_at": datetime.now(timezone.utc).isoformat()
                }
            },
            upsert=True
        )
        
        telegram_bot.send_message(
            chat_id=chat_id,
            text=f"✅ Hai preso il controllo della chat {target_chat_id}\n\nIl bot non risponderà più automaticamente. Usa /release_{target_chat_id} per rilasciare."
        )
        
        # Notifica il cliente
        try:
            telegram_bot.send_message(
                chat_id=target_chat_id,
                text="👋 Un nostro agente si è unito alla conversazione e ti risponderà personalmente!"
            )
        except:
            pass
    
    elif command.startswith("/release"):
        # Rilascia il controllo di una chat
        admin_id = os.getenv("TELEGRAM_ADMIN_ID")
        if str(user_id) != str(admin_id):
            return
        
        # Estrai chat_id
        if "_" in command:
            target_chat_id = command.split("_")[1]
        else:
            target_chat_id = chat_id
        
        # Disattiva takeover
        await db.telegram_takeovers.update_one(
            {"chat_id": target_chat_id},
            {"$set": {"active": False, "ended_at": datetime.now(timezone.utc).isoformat()}}
        )
    
    elif command == "/condividi":
        # Genera link condivisibile per immobili
        properties = await db.properties.find({"status": "disponibile"}, {"_id": 1, "property_type": 1, "location": 1}).to_list(5)
        
        if not properties:
            telegram_bot.send_message(chat_id=chat_id, text="Nessun immobile disponibile al momento")
            return
        
        response = "🔗 **CONDIVIDI IMMOBILI**\n\nScegli quale immobile vuoi condividere:\n\n"
        
        keyboard = {"inline_keyboard": []}
        
        for i, prop in enumerate(properties):
            response += f"{i+1}. {prop['property_type']} - {prop['location']}\n"
            keyboard["inline_keyboard"].append([
                {"text": f"📤 Condividi #{i+1}", "callback_data": f"share_{str(prop['_id'])}"}
            ])
        
        telegram_bot.send_message(chat_id=chat_id, text=response, reply_markup=keyboard)
    
    elif command == "/leads":
        # Delega ai comandi admin
        await handle_telegram_admin_commands(chat_id, user_id, command, user_name)
    
    else:
        # Comando non riconosciuto, delega ai comandi admin
        await handle_telegram_admin_commands(chat_id, user_id, command, user_name)



@api_router.get("/share/{share_token}")
async def view_shared_property(share_token: str):
    """
    Visualizza immobile condiviso tramite link
    """
    # Trova immobile dal token
    share = await db.property_shares.find_one({"token": share_token})
    
    if not share:
        raise HTTPException(status_code=404, detail="Link non valido o scaduto")
    
    # Incrementa contatore views
    await db.property_shares.update_one(
        {"token": share_token},
        {"$inc": {"views": 1}}
    )
    
    # Recupera immobile
    property_data = await db.properties.find_one({"_id": share["property_id"]}, {"_id": 0})
    
    if not property_data:
        raise HTTPException(status_code=404, detail="Immobile non trovato")
    
    # Ritorna HTML con dettagli immobile
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>{property_data['property_type']} - {property_data['location']}</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body {{ font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }}
            .header {{ background: #179306; color: white; padding: 20px; border-radius: 10px; }}
            .price {{ font-size: 32px; font-weight: bold; margin: 10px 0; }}
            .features {{ display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 20px 0; }}
            .feature {{ background: #f5f5f5; padding: 15px; border-radius: 5px; text-align: center; }}
            .images {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 10px; margin: 20px 0; }}
            img {{ width: 100%; border-radius: 10px; }}
            .contact {{ background: #f0f0f0; padding: 20px; border-radius: 10px; margin-top: 20px; }}
        </style>
    </head>
    <body>
        <div class="header">
            <h1>{property_data['property_type']}</h1>
            <h2>{property_data['location']}</h2>
            <div class="price">€ {property_data['price']:,.0f}</div>
        </div>
        
        <div class="features">
            <div class="feature">
                <h3>📐 Superficie</h3>
                <p>{property_data['square_meters']} mq</p>
            </div>
            <div class="feature">
                <h3>🛏️ Camere</h3>
                <p>{property_data['bedrooms']}</p>
            </div>
            <div class="feature">
                <h3>🚿 Bagni</h3>
                <p>{property_data['bathrooms']}</p>
            </div>
        </div>
        
        <h2>Descrizione</h2>
        <p>{property_data['description']}</p>
        
        <div class="images">
            {"".join([f'<img src="{img}" alt="Foto immobile">' for img in property_data.get('images', [])[:6]])}
        </div>
        
        <div class="contact">
            <h2>Interessato? Contattaci!</h2>
            <p>📞 Telefono: +39 0766 xxx xxx</p>
            <p>📧 Email: info@tempocasa-tarquinia.it</p>
            <p>🤖 Oppure chatta con il nostro bot: <a href="https://t.me/tempocasa_elettra_bot">@tempocasa_elettra_bot</a></p>
        </div>
    </body>
    </html>
    """
    
    from fastapi.responses import HTMLResponse
    return HTMLResponse(content=html_content)


@api_router.get("/telegram/analytics")
async def get_telegram_analytics():
    """
    Analytics avanzati per bot Telegram
    """
    from datetime import datetime, timezone, timedelta
    
    # Ultimi 30 giorni
    thirty_days_ago = (datetime.now(timezone.utc) - timedelta(days=30)).isoformat()
    
    # Totali
    total_clients = await db.clients.count_documents({"phone": {"$regex": "^telegram_"}})
    total_messages = await db.messages.count_documents({"client_phone": {"$regex": "^telegram_"}})
    total_appointments = await db.appointments.count_documents({})
    
    # Ultimi 30 giorni
    recent_clients = await db.clients.count_documents({
        "phone": {"$regex": "^telegram_"},
        "created_at": {"$gte": thirty_days_ago}
    })
    
    recent_messages = await db.messages.count_documents({
        "client_phone": {"$regex": "^telegram_"},
        "timestamp": {"$gte": thirty_days_ago}
    })
    
    # Lead scoring
    all_clients = await db.clients.find({"phone": {"$regex": "^telegram_"}}).to_list(1000)
    
    hot_count = 0
    warm_count = 0
    cold_count = 0
    
    for client in all_clients:
        score_data = calculate_lead_score(client, "")
        if score_data['score'] >= 70:
            hot_count += 1
        elif score_data['score'] >= 40:
            warm_count += 1
        else:
            cold_count += 1
    
    # Conversion rate (approssimativo)
    conversion_rate = (total_appointments / total_clients * 100) if total_clients > 0 else 0
    
    # Tempo medio risposta (simulato per ora)
    avg_response_time = "< 2 minuti"
    
    # Immobili più richiesti
    # TODO: Tracciare richieste per immobile
    
    return {
        "success": True,
        "period": "Ultimi 30 giorni",
        "totals": {
            "clients": total_clients,
            "messages": total_messages,
            "appointments": total_appointments
        },
        "recent": {
            "new_clients": recent_clients,
            "messages": recent_messages
        },
        "lead_scoring": {
            "hot": hot_count,
            "warm": warm_count,
            "cold": cold_count
        },
        "performance": {
            "conversion_rate": f"{conversion_rate:.1f}%",
            "avg_response_time": avg_response_time
        }
    }


@api_router.get("/telegram/daily-report")
async def send_daily_report():
    """
    Genera e invia report giornaliero all'admin
    Da chiamare via cron ogni sera alle 20:00
    """
    from telegram_bot import get_telegram_bot



@api_router.get("/telegram/conversations")
async def get_telegram_conversations():
    """
    Ottieni tutte le conversazioni Telegram con dettagli
    """
    # Trova tutti i clienti Telegram
    clients = await db.clients.find({"phone": {"$regex": "^telegram_"}}).to_list(1000)
    
    conversations = []
    
    for client in clients:
        # Ultimo messaggio
        last_message = await db.messages.find_one(
            {"client_phone": client['phone']},
            sort=[("timestamp", -1)]
        )
        
        # Conta messaggi
        message_count = await db.messages.count_documents({"client_phone": client['phone']})
        
        # Calcola lead score
        lead_score = calculate_lead_score(client, last_message.get('message', '') if last_message else '')
        
        # Controlla se c'è takeover attivo
        chat_id = client['phone'].replace('telegram_', '')
        takeover = await db.telegram_takeovers.find_one({"chat_id": chat_id, "active": True})
        
        conversations.append({
            "id": str(client.get('_id', '')),
            "client_id": str(client.get('_id', '')),
            "chat_id": chat_id,
            "name": f"{client.get('name', 'Unknown')} {client.get('surname', '')}".strip(),
            "phone": client['phone'],
            "last_message": last_message.get('message', '') if last_message else 'Nessun messaggio',
            "last_message_time": last_message.get('timestamp', '') if last_message else '',
            "last_message_direction": last_message.get('direction', '') if last_message else '',
            "message_count": message_count,
            "lead_score": lead_score['score'],
            "lead_temperature": lead_score['temperature'],
            "lead_emoji": lead_score['emoji'],
            "budget": client.get('budget', 0),
            "email": client.get('email', ''),
            "looking_for": client.get('looking_for', ''),
            "profile_completed": client.get('profile_completed', False),
            "takeover_active": takeover is not None,
            "created_at": client.get('created_at', '')
        })
    
    # Ordina per ultimo messaggio
    conversations.sort(key=lambda x: x['last_message_time'], reverse=True)
    
    return {"success": True, "conversations": conversations, "total": len(conversations)}


@api_router.get("/telegram/conversation/{client_id}")
async def get_telegram_conversation_details(client_id: str):
    """
    Ottieni dettagli completi di una conversazione specifica
    """
    from bson import ObjectId
    
    # Trova cliente
    try:
        client = await db.clients.find_one({"_id": ObjectId(client_id)})
    except:
        raise HTTPException(status_code=404, detail="Cliente non trovato")
    
    if not client:
        raise HTTPException(status_code=404, detail="Cliente non trovato")
    
    # Tutti i messaggi
    messages = await db.messages.find(
        {"client_phone": client['phone']},
        {"_id": 0}
    ).sort("timestamp", 1).to_list(1000)
    
    # Lead score
    last_msg_text = messages[-1]['message'] if messages else ''
    lead_score = calculate_lead_score(client, last_msg_text)
    
    return {
        "success": True,
        "client": {
            "id": str(client['_id']),
            "name": client.get('name', ''),
            "surname": client.get('surname', ''),
            "phone": client.get('phone', ''),
            "email": client.get('email', ''),
            "budget": client.get('budget', 0),
            "looking_for": client.get('looking_for', ''),
            "needs_mortgage": client.get('needs_mortgage', False),
            "needs_to_sell": client.get('needs_to_sell', False),
            "profile_completed": client.get('profile_completed', False),
            "created_at": client.get('created_at', '')
        },
        "messages": messages,
        "lead_score": lead_score,
        "total_messages": len(messages)
    }


@api_router.post("/telegram/send-message")
async def send_message_from_dashboard(chat_id: str, message: str):
    """
    Invia messaggio da dashboard web a conversazione Telegram
    """
    from telegram_bot import get_telegram_bot
    
    telegram_bot = get_telegram_bot()
    
    try:
        result = telegram_bot.send_message(chat_id=chat_id, text=message)
        
        # Salva nel database
        client_identifier = f"telegram_{chat_id}"
        msg = MessageCreate(
            client_phone=client_identifier,
            message=message,
            direction="outgoing",
            client_name="Dashboard Admin"
        )
        await create_message(msg)
        
        return {"success": True, "result": result}
        
    except Exception as e:
        logging.error(f"Error sending message from dashboard: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.get("/telegram/dashboard-stats")
async def get_telegram_dashboard_stats():
    """
    Statistiche per dashboard Telegram
    """
    from datetime import datetime, timezone, timedelta
    
    # Date
    now = datetime.now(timezone.utc)
    today_start = datetime.combine(now.date(), datetime.min.time()).replace(tzinfo=timezone.utc).isoformat()
    week_ago = (now - timedelta(days=7)).isoformat()
    month_ago = (now - timedelta(days=30)).isoformat()
    
    # Totali
    total_conversations = await db.clients.count_documents({"phone": {"$regex": "^telegram_"}})
    total_messages = await db.messages.count_documents({"client_phone": {"$regex": "^telegram_"}})
    
    # Oggi
    new_today = await db.clients.count_documents({
        "phone": {"$regex": "^telegram_"},
        "created_at": {"$gte": today_start}
    })
    
    messages_today = await db.messages.count_documents({
        "client_phone": {"$regex": "^telegram_"},
        "timestamp": {"$gte": today_start}
    })
    
    # Settimana
    new_week = await db.clients.count_documents({
        "phone": {"$regex": "^telegram_"},
        "created_at": {"$gte": week_ago}
    })
    
    # Lead scoring
    all_clients = await db.clients.find({"phone": {"$regex": "^telegram_"}}).to_list(1000)
    
    hot = sum(1 for c in all_clients if calculate_lead_score(c, '')['score'] >= 70)
    warm = sum(1 for c in all_clients if 40 <= calculate_lead_score(c, '')['score'] < 70)
    cold = sum(1 for c in all_clients if calculate_lead_score(c, '')['score'] < 40)
    
    # Conversazioni attive (con messaggio nelle ultime 24h)
    active_conversations = await db.messages.distinct(
        "client_phone",
        {
            "client_phone": {"$regex": "^telegram_"},
            "timestamp": {"$gte": today_start}
        }
    )
    
    return {
        "success": True,
        "totals": {
            "conversations": total_conversations,
            "messages": total_messages,
            "active_today": len(active_conversations)
        },
        "today": {
            "new_conversations": new_today,
            "messages": messages_today
        },
        "week": {
            "new_conversations": new_week
        },
        "leads": {
            "hot": hot,
            "warm": warm,
            "cold": cold
        }
    }

    from datetime import datetime, timezone, timedelta
    
    admin_id = os.getenv("TELEGRAM_ADMIN_ID")
    if not admin_id:
        return {"error": "Admin ID not configured"}
    
    telegram_bot = get_telegram_bot()
    
    # Data di oggi
    today = datetime.now(timezone.utc).date()
    today_start = datetime.combine(today, datetime.min.time()).replace(tzinfo=timezone.utc).isoformat()
    today_end = datetime.combine(today, datetime.max.time()).replace(tzinfo=timezone.utc).isoformat()
    
    # Conta messaggi oggi
    messages_today = await db.messages.count_documents({
        "timestamp": {"$gte": today_start, "$lte": today_end},
        "client_phone": {"$regex": "^telegram_"}
    })
    
    # Nuovi contatti oggi
    new_clients_today = await db.clients.count_documents({
        "created_at": {"$gte": today_start, "$lte": today_end},
        "phone": {"$regex": "^telegram_"}
    })
    
    # Lead HOT oggi
    all_clients = await db.clients.find({
        "phone": {"$regex": "^telegram_"},
        "created_at": {"$gte": today_start, "$lte": today_end}
    }).to_list(100)
    
    hot_leads_today = []
    warm_leads_today = []
    
    for client in all_clients:
        score_data = calculate_lead_score(client, "")
        if score_data['score'] >= 70:
            hot_leads_today.append({
                "name": client.get('name', 'Unknown'),
                "score": score_data['score'],
                "budget": client.get('budget', 0)
            })
        elif score_data['score'] >= 40:
            warm_leads_today.append({
                "name": client.get('name', 'Unknown'),
                "score": score_data['score']
            })
    
    # Appuntamenti fissati oggi
    appointments_today = await db.appointments.count_documents({
        "date": {"$gte": today_start, "$lte": today_end}
    })
    
    # Genera report
    report = f"""📊 **REPORT GIORNALIERO TELEGRAM BOT**
📅 {today.strftime('%d/%m/%Y')}

---

📈 **STATISTICHE GENERALI:**
💬 Messaggi ricevuti: {messages_today}
👥 Nuovi contatti: {new_clients_today}
📅 Appuntamenti fissati: {appointments_today}

---

🔥 **LEAD HOT** ({len(hot_leads_today)}):
"""
    
    if hot_leads_today:
        for i, lead in enumerate(hot_leads_today[:5], 1):
            report += f"{i}. {lead['name']} - Score {lead['score']}/100"
            if lead['budget'] > 0:
                report += f" - Budget €{lead['budget']:,.0f}"
            report += "\n"
    else:
        report += "Nessun lead HOT oggi\n"
    
    report += f"""
---

🌡️ **LEAD WARM** ({len(warm_leads_today)}):
"""
    
    if warm_leads_today:
        for i, lead in enumerate(warm_leads_today[:5], 1):
            report += f"{i}. {lead['name']} - Score {lead['score']}/100\n"
    else:
        report += "Nessun lead WARM oggi\n"
    
    report += """
---

💡 **AZIONI CONSIGLIATE:**
"""
    
    if hot_leads_today:
        report += "• ⚡ Contatta SUBITO i lead HOT!\n"
    if warm_leads_today:
        report += "• 📞 Follow-up lead WARM entro domani\n"
    if appointments_today > 0:
        report += f"• 📅 Prepara i {appointments_today} appuntamenti di domani\n"
    
    if not hot_leads_today and not warm_leads_today and new_clients_today == 0:
        report += "• 📣 Considera di promuovere il bot sui social!\n"
    
    report += """
---

🤖 Bot attivo e funzionante ✅
"""
    
    try:
        telegram_bot.send_message(
            chat_id=admin_id,
            text=report
        )
        
        return {
            "success": True,
            "report_sent": True,
            "stats": {
                "messages": messages_today,
                "new_clients": new_clients_today,
                "hot_leads": len(hot_leads_today),
                "warm_leads": len(warm_leads_today),
                "appointments": appointments_today
            }
        }
    except Exception as e:
        logging.error(f"Error sending daily report: {e}")
        return {"success": False, "error": str(e)}


@api_router.get("/telegram/admin-commands")
async def get_admin_commands():
    """
    Lista comandi admin disponibili
    """
    return {
        "commands": [
            "/takeover_CHATID - Prendi controllo manuale di una chat",
            "/release_CHATID - Rilascia controllo di una chat",
            "/leads - Mostra statistiche lead HOT/WARM/COLD"
        ]
    }


async def handle_property_callback(callback_data: str, chat_id: str, user_id: str):
    """
    Gestisce callback per azioni su immobili (foto, mappa, PDF)
    """
    from telegram_bot import get_telegram_bot
    from telegram_advanced_features import send_property_location, send_property_pdf
    import json
    
    telegram_bot = get_telegram_bot()
    
    # Recupera properties dalla cache
    cache = await db.telegram_cache.find_one({"chat_id": chat_id, "type": "properties"})
    if not cache:
        telegram_bot.send_message(chat_id=chat_id, text="⚠️ Dati scaduti. Richiedi di nuovo la lista immobili.")
        return
    
    properties = json.loads(cache['data'])
    
    # Parse callback
    action, index_str = callback_data.split("_")
    index = int(index_str)
    
    if index >= len(properties):
        telegram_bot.send_message(chat_id=chat_id, text="⚠️ Immobile non trovato.")
        return
    
    property_data = properties[index]
    
    if action == "photo":
        # Invia tutte le foto
        images = property_data.get('images', [])
        if images:
            for img_url in images[:3]:  # Max 3 foto
                try:
                    telegram_bot.send_photo(
                        chat_id=chat_id,
                        photo_url=img_url,
                        caption=f"📸 {property_data['property_type']} - {property_data['location']}"
                    )
                except Exception as e:
                    logging.error(f"Error sending photo: {e}")
        else:
            telegram_bot.send_message(chat_id=chat_id, text="📸 Foto non disponibili per questo immobile")
    
    elif action == "location":
        # Invia posizione su mappa
        await send_property_location(telegram_bot, chat_id, property_data)
        telegram_bot.send_message(
            chat_id=chat_id,
            text=f"📍 Posizione: {property_data['location']}\n\nClicca sulla mappa per aprire in Google Maps!"
        )
    
    elif action == "pdf":
        # Genera e invia PDF
        telegram_bot.send_message(chat_id=chat_id, text="📄 Sto generando il PDF...")



async def handle_share_callback(callback_data: str, chat_id: str, user_id: str):
    """
    Gestisce creazione link condivisibile
    """
    from telegram_bot import get_telegram_bot
    from telegram_advanced_features import create_share_link
    from bson import ObjectId
    
    telegram_bot = get_telegram_bot()
    
    # Parse callback
    _, property_id = callback_data.split("_", 1)
    
    try:
        # Recupera immobile
        property_data = await db.properties.find_one({"_id": ObjectId(property_id)})
        
        if not property_data:
            telegram_bot.send_message(chat_id=chat_id, text="⚠️ Immobile non trovato")
            return
        
        # Crea link condivisibile
        share_link = await create_share_link(str(property_data['_id']), db)
        
        # Invia link
        message = f"""🔗 **LINK GENERATO!**

📱 Condividi questo link:
{share_link}

Il link include:
✅ Foto complete
✅ Dettagli immobile
✅ Contatti agenzia

💡 Chiunque può visualizzarlo, anche senza Telegram!"""
        
        telegram_bot.send_message(chat_id=chat_id, text=message)
        
        # Salva statistiche condivisione
        await db.telegram_shares.insert_one({
            "shared_by": user_id,
            "property_id": str(property_data['_id']),
            "share_link": share_link,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
    except Exception as e:
        logging.error(f"Error creating share link: {e}")
        telegram_bot.send_message(chat_id=chat_id, text="❌ Errore nella creazione del link")

        await send_property_pdf(telegram_bot, chat_id, property_data)


async def handle_telegram_admin_commands(chat_id: str, user_id: str, command: str, user_name: str):
    """
    Gestisce comandi admin aggiuntivi
    """
    from telegram_bot import get_telegram_bot
    telegram_bot = get_telegram_bot()
    
    admin_id = os.getenv("TELEGRAM_ADMIN_ID")
    if str(user_id) != str(admin_id):
        return



# ==================== BOT TEMPLATES MANAGEMENT ====================

@api_router.get("/bot-templates")
async def get_bot_templates():
    """
    Ottieni tutti i template del bot
    """
    templates = await db.bot_templates.find_one({}, {"_id": 0})
    
    if not templates:
        raise HTTPException(status_code=404, detail="Template non trovati")
    
    return {"success": True, "templates": templates}


@api_router.put("/bot-templates")
async def update_bot_templates(templates: dict):
    """
    Aggiorna i template del bot
    """
    # Rimuovi _id se presente
    templates.pop("_id", None)
    
    # Aggiorna o crea template
    result = await db.bot_templates.update_one(
        {},
        {"$set": templates},
        upsert=True
    )
    
    return {
        "success": True,
        "message": "Template aggiornati con successo",
        "modified": result.modified_count > 0 or result.upserted_id is not None
    }


@api_router.get("/bot-templates/{template_key}")
async def get_single_template(template_key: str):
    """
    Ottieni un singolo template
    """
    templates = await db.bot_templates.find_one({}, {"_id": 0})
    
    if not templates or template_key not in templates:
        raise HTTPException(status_code=404, detail="Template non trovato")
    
    return {"success": True, "template": templates[template_key]}

    
    if command == "/leads":
        # Mostra statistiche lead (solo admin)
        
        # Conta lead per temperatura
        all_clients = await db.clients.find({"phone": {"$regex": "^telegram_"}}).to_list(1000)
        
        hot_leads = []
        warm_leads = []
        cold_leads = []
        
        for client in all_clients:
            score_data = calculate_lead_score(client, "")
            if score_data['score'] >= 70:
                hot_leads.append(client)
            elif score_data['score'] >= 40:
                warm_leads.append(client)
            else:
                cold_leads.append(client)
        
        response = f"""📊 **STATISTICHE LEAD TELEGRAM**

🔥 **HOT** ({len(hot_leads)}): Lead pronti per chiusura
🌡️ **WARM** ({len(warm_leads)}): Lead interessati
❄️ **COLD** ({len(cold_leads)}): Lead da riscaldare

📈 **Totale lead:** {len(all_clients)}
"""
        
        telegram_bot.send_message(chat_id=chat_id, text=response)
        # Delega ai comandi admin
        await handle_telegram_admin_commands(chat_id, user_id, command, user_name)
    
    else:
        # Comando non riconosciuto, gestiscilo come messaggio normale
        await process_telegram_message(chat_id, user_id, command, user_name)




def calculate_lead_score(client: Dict, message_text: str) -> Dict:
    """
    Calcola il punteggio del lead (caldo/tiepido/freddo)
    
    Returns:
        Dict con score (0-100), temperature (hot/warm/cold), reasons
    """
    score = 0
    reasons = []
    
    # Budget alto = +30 punti
    budget = client.get('budget', 0) or 0
    if budget >= 300000:
        score += 30
        reasons.append(f"Budget alto: €{budget:,.0f}")
    elif budget >= 150000:
        score += 20
        reasons.append(f"Budget medio: €{budget:,.0f}")
    elif budget > 0:
        score += 10
        reasons.append(f"Budget: €{budget:,.0f}")
    
    # Ha fornito email = +20 punti (più serio)
    if client.get('email'):
        score += 20
        reasons.append("Ha fornito email")
    
    # Ha fornito nome completo = +15 punti
    if client.get('name') and client.get('surname'):
        score += 15
        reasons.append("Dati completi")
    
    # Needs mortgage = +10 punti (più commitment)
    if client.get('needs_mortgage'):
        score += 10
        reasons.append("Richiede mutuo")
    
    # Vuole vendere = +15 punti (ha urgenza)
    if client.get('needs_to_sell'):
        score += 15
        reasons.append("Deve vendere casa")
    
    # Profilo completo = +10 punti
    if client.get('profile_completed'):
        score += 10
        reasons.append("Profilo completato")
    
    # Parole chiave urgenti nel messaggio
    urgent_keywords = ['urgente', 'subito', 'velocemente', 'entro', 'presto', 'immediat']
    if any(keyword in message_text.lower() for keyword in urgent_keywords):
        score += 20
        reasons.append("⚡ Urgenza espressa")
    
    # Determina temperatura
    if score >= 70:
        temperature = "🔥 HOT"
        emoji = "🔥"
    elif score >= 40:
        temperature = "🌡️ WARM"
        emoji = "🌡️"
    else:
        temperature = "❄️ COLD"
        emoji = "❄️"
    
    return {
        "score": score,
        "temperature": temperature,
        "emoji": emoji,
        "reasons": reasons
    }


async def send_admin_notification(chat_id: str, user_name: str, lead_info: Dict, message_text: str):
    """
    Invia notifica all'admin per lead VIP
    """
    from telegram_bot import get_telegram_bot
    
    admin_id = os.getenv("TELEGRAM_ADMIN_ID")
    if not admin_id:
        return
    
    telegram_bot = get_telegram_bot()
    
    score_data = lead_info
    
    notification = f"""🚨 **NUOVO LEAD {score_data['temperature']}!**

👤 **Cliente:** {user_name}
💯 **Score:** {score_data['score']}/100

📊 **Motivi:**
"""
    
    for reason in score_data['reasons']:
        notification += f"• {reason}\n"
    
    notification += f"""
💬 **Ultimo messaggio:**
"{message_text[:150]}..."

🔗 **Azioni:**
• Scrivi direttamente a @{user_name if user_name != 'User' else 'cliente'}
• Usa /takeover_{chat_id} per prendere controllo chat
"""
    
    try:
        telegram_bot.send_message(
            chat_id=admin_id,
            text=notification
        )
        logging.info(f"Admin notification sent for lead score {score_data['score']}")
    except Exception as e:
        logging.error(f"Error sending admin notification: {e}")


async def process_telegram_message(chat_id: str, user_id: str, message_text: str, user_name: str):
    """
    Processa un messaggio Telegram in arrivo e genera risposta AI
    """
    from telegram_bot import get_telegram_bot
    from bot_messages import get_welcome_message
    
    # Gestisci callback da bottoni
    if message_text.startswith("/"):
        await handle_telegram_command(chat_id, user_id, message_text, user_name)
        return
    
    # Gestisci testi da bottoni inline
    if message_text == "cerco_casa":
        message_text = "Cerco casa"
    elif message_text == "voglio_vendere":
        message_text = "Voglio vendere il mio immobile"
    elif message_text == "valutazione":
        await handle_telegram_command(chat_id, user_id, "/valutazione", user_name)
        return
    elif message_text == "appuntamento":
        message_text = "Vorrei fissare un appuntamento"
    
    # Usa user_id come identificatore cliente (invece del telefono)
    client_identifier = f"telegram_{user_id}"

    # Controlla se l'admin ha preso il controllo di questa chat
    takeover = await db.telegram_takeovers.find_one({"chat_id": chat_id, "active": True})
    if takeover:
        # Admin ha il controllo, il bot non risponde
        logging.info(f"Chat {chat_id} sotto controllo admin - bot disabilitato")
        return

    
    # Check if client has previous messages
    existing_messages = await db.messages.count_documents({"client_phone": client_identifier})
    
    # If client exists, check if we're in an active conversation
    if existing_messages > 0:
        # Check last bot message timestamp (within last 10 minutes = active conversation)
        from datetime import datetime, timedelta, timezone
        ten_minutes_ago = datetime.now(timezone.utc) - timedelta(minutes=10)
        
        last_bot_message = await db.messages.find_one(
            {
                "client_phone": client_identifier,
                "direction": "outgoing",
                "timestamp": {"$gte": ten_minutes_ago.isoformat()}
            },
            sort=[("timestamp", -1)]
        )
        
        # If bot sent a message in last 10 minutes, it's an active conversation - always respond
        if last_bot_message:
            logging.info("Cliente esistente - conversazione attiva")
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
                    client_phone=client_identifier,
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
        client_phone=client_identifier,
        message=message_text,
        direction="incoming"
    )
    await create_message(msg)
    
    # Get or create client
    client = await db.clients.find_one({"phone": client_identifier})
    if not client:
        new_client = ClientCreate(
            name=user_name,
            surname="",
            phone=client_identifier,
            profile_completed=False
        )
        await create_client(new_client)
        client = await db.clients.find_one({"phone": client_identifier})
    
    # Get AI response with client context
    try:
        ai_response = await get_ai_response(message_text, client_identifier, client)
        
        # Check if AI wants to update client profile
        if ai_response.get("update_client"):
            update_data = ai_response["update_client"]
            await db.clients.update_one(
                {"phone": client_identifier},
                {"$set": update_data}
            )
            # Ricarica client aggiornato
            client = await db.clients.find_one({"phone": client_identifier})
        
        # Calcola lead score e invia notifica se VIP
        lead_score = calculate_lead_score(client, message_text)
        
        # Invia notifica admin se lead è HOT o WARM e è nuovo/primo messaggio
        if existing_messages <= 1 and lead_score['score'] >= 40:
            await send_admin_notification(chat_id, user_name, lead_score, message_text)
        
        # Save AI response to database
        response_msg = MessageCreate(
            client_phone=client_identifier,
            message=ai_response["response"],
            direction="outgoing",
            client_name=client.get('name') if client else None
        )
        await create_message(response_msg)
        
        # Send response via Telegram
        try:
            telegram_bot = get_telegram_bot()
            
            # Controlla se la risposta contiene suggerimenti di immobili
            response_text = ai_response["response"]
            
            # Se ci sono immobili nel contesto, invia foto
            if any(keyword in response_text.lower() for keyword in ["immobile", "appartamento", "villa", "casa", "consiglio", "suggerisco"]):
                # Trova immobili che potrebbero interessare
                properties = await db.properties.find(
                    {"status": "disponibile"},
                    {"_id": 0}
                ).to_list(3)
                
                # Invia la risposta testuale
                result = telegram_bot.send_message(
                    chat_id=chat_id,
                    text=response_text
                )
                
                # Invia foto dei primi 2 immobili se disponibili
                for i, prop in enumerate(properties[:2]):
                    if prop.get('images') and len(prop['images']) > 0:
                        try:
                            caption = f"""🏠 {prop['property_type']} - {prop['location']}
💰 Prezzo: €{prop['price']:,.0f}
📐 Superficie: {prop['square_meters']}mq
🛏️ Camere: {prop['bedrooms']} | 🚿 Bagni: {prop['bathrooms']}

{prop['description'][:150]}..."""
                            
                            telegram_bot.send_photo(
                                chat_id=chat_id,
                                photo_url=prop['images'][0],
                                caption=caption
                            )
                        except Exception as photo_error:
                            logging.error(f"Error sending photo: {photo_error}")
            else:
                # Risposta normale senza foto
                result = telegram_bot.send_message(
                    chat_id=chat_id,
                    text=response_text
                )
            
            logging.info(f"Telegram message sent to {chat_id}: {result}")
                
        except Exception as send_error:
            logging.error(f"Error sending Telegram message: {send_error}", exc_info=True)
        
    except Exception as e:
        logging.error(f"Error processing Telegram message: {e}", exc_info=True)


@api_router.get("/telegram/set-webhook")
async def set_telegram_webhook():
    """
    Configura il webhook Telegram
    """
    from telegram_bot import get_telegram_bot
    
    try:
        telegram_bot = get_telegram_bot()
        webhook_url = f"{os.environ.get('REACT_APP_BACKEND_URL', 'https://agent-dashboard-82.preview.emergentagent.com')}/api/telegram/webhook"
        
        result = telegram_bot.set_webhook(webhook_url)
        
        return {
            "success": True,
            "webhook_url": webhook_url,
            "result": result
        }
    except Exception as e:
        logging.error(f"Error setting Telegram webhook: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.get("/telegram/webhook-info")
async def get_telegram_webhook_info():
    """
    Ottieni info sul webhook Telegram
    """
    from telegram_bot import get_telegram_bot
    
    try:
        telegram_bot = get_telegram_bot()
        result = telegram_bot.get_webhook_info()
        return result
    except Exception as e:
        logging.error(f"Error getting webhook info: {e}")
        raise HTTPException(status_code=500, detail=str(e))


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

FLUSSO CONVERSAZIONE OTTIMIZZATO:

⚠️ REGOLE IMPORTANTI:
- NON ripetere il saluto (Buongiorno/Buonasera) se l'hai già detto
- Se il cliente specifica TIPOLOGIA + ZONA (es: "villa a Tarquinia Lido"), NON chiedere nome
- Passa direttamente alle caratteristiche tecniche

1. **PRIMO CONTATTO** (SOLO se non ci sono messaggi precedenti):
   - Saluta UNA SOLA VOLTA con orario appropriato
   - Presentati: "Sono {bot_name}, assistente virtuale di {agency_name}"
   - Non chiedere subito il nome
   - Dopo il primo messaggio, NON ripetere MAI più il saluto o la presentazione

2. **SE IL CLIENTE SPECIFICA TIPOLOGIA + ZONA** (es: "appartamento a Tarquinia Centro"):
   - NON chiedere nome e cognome
   - Chiedi SUBITO:
     * Metratura desiderata (es: "Quanti mq circa?")
     * Stato immobile: "Preferisce un immobile ristrutturato o da ristrutturare?"
     * Numero camere: "Quante camere da letto?"
     * Budget: "Qual è il suo budget massimo?"

3. **SE IL CLIENTE DICE SOLO "Cerco casa" (generico)**:
   - Chiedi: "Che tipo di immobile cerca?" (appartamento, villa, etc)
   - Chiedi: "In quale zona di Tarquinia?" (Centro, Lido, etc)
   - POI passa al punto 2

4. **DOPO LE CARATTERISTICHE TECNICHE**:
   - Suggerisci 2-3 immobili che corrispondono
   - POI chiedi il nome: "Per poterla assistere meglio, mi può dire il suo nome?"
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

REGOLE CRUCIALI:
- ❌ NON ripetere il saluto (Buongiorno/Buonasera) se l'hai già usato nella conversazione
- ❌ Se il cliente dà tipologia+zona, NON chiedere il nome subito
- ✅ Chiedi UNA informazione alla volta
- ✅ Sii cordiale ma efficiente
- ✅ Usa emoji con moderazione
- ✅ Rispondi SEMPRE in italiano
- ✅ Ordine ottimale: saluto → tipologia+zona → metratura → stato → camere → budget → suggerisci immobili → nome → mutuo → vendita → valutazione → email → chiusura

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
async def upload_property_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user)
):
    """Upload property image to Cloudinary (autenticazione richiesta)"""
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

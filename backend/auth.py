"""
Authentication System
Sistema di autenticazione con JWT tokens e password hashing
"""
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr, Field, ConfigDict
import os
import secrets

# JWT Configuration
SECRET_KEY = os.environ.get("JWT_SECRET_KEY", secrets.token_urlsafe(32))
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 giorni

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# HTTP Bearer for JWT
security = HTTPBearer()


# Models
class User(BaseModel):
    """User model"""
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: secrets.token_urlsafe(16))
    username: str  # Username per login (es: "admin")
    email: Optional[EmailStr] = None  # Email opzionale
    full_name: str
    role: str = "agent"  # admin, agent, viewer
    is_active: bool = True
    hashed_password: str = ""
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    last_login: Optional[datetime] = None


class UserCreate(BaseModel):
    """User creation model"""
    username: str = Field(min_length=3, max_length=50)
    email: Optional[EmailStr] = None
    password: str = Field(min_length=8)
    full_name: str
    role: str = "agent"


class UserLogin(BaseModel):
    """User login model"""
    username: str
    password: str


class UserResponse(BaseModel):
    """User response (without password)"""
    id: str
    username: str
    email: Optional[EmailStr] = None
    full_name: str
    role: str
    is_active: bool
    created_at: datetime
    last_login: Optional[datetime] = None


class Token(BaseModel):
    """JWT Token response"""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenData(BaseModel):
    """JWT Token data"""
    username: Optional[str] = None
    user_id: Optional[str] = None


# Password Functions
def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica password"""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash password"""
    return pwd_context.hash(password)


# JWT Functions
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Crea JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Optional[TokenData]:
    """Decodifica JWT token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        user_id: str = payload.get("user_id")
        
        if email is None:
            return None
        
        return TokenData(email=email, user_id=user_id)
    except JWTError:
        return None


# Dependency Functions
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db=None  # Will be injected
) -> User:
    """
    Dependency per ottenere utente corrente da JWT token
    Usa: current_user = Depends(get_current_user)
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenziali non valide",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    if not credentials:
        raise credentials_exception
    
    token = credentials.credentials
    token_data = decode_access_token(token)
    
    if token_data is None or token_data.email is None:
        raise credentials_exception
    
    # Get database connection
    if db is None:
        from motor.motor_asyncio import AsyncIOMotorClient
        mongo_url = os.environ['MONGO_URL']
        client = AsyncIOMotorClient(mongo_url)
        db = client[os.environ['DB_NAME']]
    
    # Find user in database
    user = await db.users.find_one({"email": token_data.email}, {"_id": 0})
    
    if user is None:
        raise credentials_exception
    
    # Convert datetime strings back to datetime objects
    if isinstance(user.get('created_at'), str):
        user['created_at'] = datetime.fromisoformat(user['created_at'])
    if user.get('last_login') and isinstance(user.get('last_login'), str):
        user['last_login'] = datetime.fromisoformat(user['last_login'])
    
    return User(**user)


async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """Dependency per ottenere solo utenti attivi"""
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Utente disattivato"
        )
    return current_user


async def get_current_admin_user(
    current_user: User = Depends(get_current_active_user)
) -> User:
    """Dependency per ottenere solo utenti admin"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permessi insufficienti. Solo admin."
        )
    return current_user


# Helper Functions
def user_to_response(user: User) -> UserResponse:
    """Converti User a UserResponse (senza password)"""
    return UserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        is_active=user.is_active,
        created_at=user.created_at,
        last_login=user.last_login
    )

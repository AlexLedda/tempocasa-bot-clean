"""
Core Configuration Module
Centralizza tutte le configurazioni dell'applicazione
"""
import os
from pathlib import Path
from pydantic_settings import BaseSettings
from typing import Optional

# Root directory
ROOT_DIR = Path(__file__).parent.parent


class Settings(BaseSettings):
    """Application settings from environment variables"""
    
    # Database
    mongo_url: str
    db_name: str
    
    # Security
    jwt_secret_key: str
    
    # Cloudinary
    cloudinary_cloud_name: str = ""
    cloudinary_api_key: str = ""
    cloudinary_api_secret: str = ""
    
    # Backend
    backend_url: str = "http://localhost:8000"
    
    # Optional integrations
    openai_api_key: Optional[str] = None
    twilio_account_sid: Optional[str] = None
    twilio_auth_token: Optional[str] = None
    twilio_phone_number: Optional[str] = None
    telegram_bot_token: Optional[str] = None
    telegram_chat_id: Optional[str] = None
    
    # Rate limiting
    rate_limit_requests: int = 100
    rate_limit_window: int = 60  # seconds
    
    # File upload limits
    max_avatar_size_mb: int = 5
    max_property_image_size_mb: int = 10
    
    class Config:
        env_file = ROOT_DIR / ".env"
        case_sensitive = False


# Singleton instance
settings = Settings()


# Validate critical settings
def validate_settings():
    """Validate that critical settings are configured"""
    if not settings.jwt_secret_key:
        raise RuntimeError(
            "JWT_SECRET_KEY is required. "
            "Generate with: python -c \"import secrets; print(secrets.token_urlsafe(32))\""
        )
    
    if not settings.mongo_url or not settings.db_name:
        raise RuntimeError("MONGO_URL and DB_NAME are required")


# Run validation on import
validate_settings()

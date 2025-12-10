"""
Health Check Endpoint
Per Render e monitoring
"""
from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get("/health")
async def health_check():
    """
    Health check endpoint per Render
    """
    return {
        "status": "healthy",
        "service": "tempocasa-backend",
        "version": "2.0.0"
    }


@router.get("/")
async def root():
    """
    Root endpoint
    """
    return {
        "message": "Tempocasa Bot API",
        "version": "2.0.0",
        "docs": "/docs"
    }

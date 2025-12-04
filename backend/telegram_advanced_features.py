"""
Funzionalità avanzate per Telegram Bot
"""
import os
from typing import Dict, List
from telegram_bot import TelegramBot
import logging
from pdf_generator import generate_property_pdf
import uuid

logger = logging.getLogger(__name__)


async def send_property_location(telegram_bot: TelegramBot, chat_id: str, property_data: Dict):
    """
    Invia geolocalizzazione immobile
    """
    latitude = property_data.get('latitude')
    longitude = property_data.get('longitude')
    
    if not latitude or not longitude:
        logger.warning(f"Property {property_data.get('location')} has no coordinates")
        return
    
    try:
        import requests
        url = f"https://api.telegram.org/bot{os.getenv('TELEGRAM_BOT_TOKEN')}/sendLocation"
        
        payload = {
            "chat_id": chat_id,
            "latitude": latitude,
            "longitude": longitude,
            "title": f"{property_data.get('property_type')} - {property_data.get('location')}",
            "address": property_data.get('location', '')
        }
        
        response = requests.post(url, json=payload)
        response.raise_for_status()
        
        logger.info(f"Location sent for property at {property_data.get('location')}")
        return response.json()
        
    except Exception as e:
        logger.error(f"Error sending location: {e}")


async def send_property_pdf(telegram_bot: TelegramBot, chat_id: str, property_data: Dict):
    """
    Genera e invia PDF scheda immobile
    """
    try:
        # Genera PDF
        pdf_bytes = generate_property_pdf(property_data)
        
        # Salva temporaneamente
        filename = f"/tmp/immobile_{uuid.uuid4().hex[:8]}.pdf"
        with open(filename, 'wb') as f:
            f.write(pdf_bytes)
        
        # Invia PDF
        import requests
        url = f"https://api.telegram.org/bot{os.getenv('TELEGRAM_BOT_TOKEN')}/sendDocument"
        
        with open(filename, 'rb') as f:
            files = {'document': f}
            data = {
                'chat_id': chat_id,
                'caption': f"📄 Scheda completa:\n{property_data.get('property_type')} - {property_data.get('location')}\n€{property_data.get('price', 0):,.0f}"
            }
            
            response = requests.post(url, files=files, data=data)
            response.raise_for_status()
        
        # Rimuovi file temporaneo
        os.remove(filename)
        
        logger.info(f"PDF sent for property at {property_data.get('location')}")
        return response.json()
        
    except Exception as e:
        logger.error(f"Error sending PDF: {e}")


async def create_share_link(property_id: str, db) -> str:
    """
    Crea link condivisibile per immobile con tracking
    """
    share_token = uuid.uuid4().hex[:12]
    
    # Salva nel DB
    await db.property_shares.insert_one({
        "token": share_token,
        "property_id": property_id,
        "views": 0,
        "created_at": None  # TODO: add timestamp
    })
    
    # Genera link
    base_url = os.getenv("REACT_APP_BACKEND_URL", "https://propmate-13.preview.emergentagent.com")
    share_link = f"{base_url}/share/{share_token}"
    
    return share_link


async def send_custom_notification(admin_id: str, notification_type: str, data: Dict, telegram_bot: TelegramBot):
    """
    Invia notifiche personalizzate all'admin
    
    Types:
    - appointment_booked
    - urgent_request
    - high_budget
    """
    if not admin_id:
        return
    
    messages = {
        "appointment_booked": f"""📅 **NUOVO APPUNTAMENTO!**

👤 Cliente: {data.get('client_name', 'Unknown')}
📍 Immobile: {data.get('property', 'Non specificato')}
🕐 Data: {data.get('date', 'Non specificata')}
⏰ Ora: {data.get('time', 'Non specificata')}

Ricordati di preparare i documenti! 📋""",

        "urgent_request": f"""⚡ **RICHIESTA URGENTE!**

👤 Cliente: {data.get('client_name', 'Unknown')}
💬 Messaggio: "{data.get('message', '')}"

⚠️ Cliente vuole risposta immediata!""",

        "high_budget": f"""💎 **CLIENTE HIGH BUDGET!**

👤 Nome: {data.get('client_name', 'Unknown')}
💰 Budget: €{data.get('budget', 0):,.0f}
🏠 Cerca: {data.get('looking_for', 'Non specificato')}

🎯 Questo è un cliente premium - priorità massima!"""
    }
    
    message = messages.get(notification_type, "Notifica sconosciuta")
    
    try:
        telegram_bot.send_message(chat_id=admin_id, text=message)
        logger.info(f"Custom notification sent: {notification_type}")
    except Exception as e:
        logger.error(f"Error sending custom notification: {e}")

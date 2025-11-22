"""
Telegram Bot Integration
Bot Elettra - Assistente Virtuale Tempocasa Tarquinia
"""
import os
import requests
from typing import Dict, Optional
import logging

logger = logging.getLogger(__name__)


class TelegramBot:
    """
    Client per Telegram Bot API
    """
    
    def __init__(self, token: str):
        """
        Inizializza il client Telegram
        
        Args:
            token: Bot token da @BotFather
        """
        self.token = token
        self.base_url = f"https://api.telegram.org/bot{token}"
    
    def send_message(
        self,
        chat_id: str,
        text: str,
        parse_mode: str = "Markdown",
        reply_markup: Optional[Dict] = None
    ) -> Dict:
        """
        Invia un messaggio di testo
        
        Args:
            chat_id: ID della chat
            text: Testo del messaggio
            parse_mode: Formato del testo (Markdown, HTML)
            reply_markup: Tastiera inline (opzionale)
        
        Returns:
            Response da Telegram API
        """
        url = f"{self.base_url}/sendMessage"
        
        payload = {
            "chat_id": chat_id,
            "text": text,
            "parse_mode": parse_mode
        }
        
        if reply_markup:
            payload["reply_markup"] = reply_markup
        
        try:
            response = requests.post(url, json=payload)
            logger.info(f"Telegram API Response: Status {response.status_code}, Body: {response.text[:500]}")
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Error sending Telegram message: {e}")
            if hasattr(e, 'response') and e.response:
                logger.error(f"Response status: {e.response.status_code}")
                logger.error(f"Response body: {e.response.text}")
                logger.error(f"Payload sent: {payload}")
            raise
    
    def send_photo(
        self,
        chat_id: str,
        photo_url: str,
        caption: Optional[str] = None
    ) -> Dict:
        """
        Invia una foto
        """
        url = f"{self.base_url}/sendPhoto"
        
        payload = {
            "chat_id": chat_id,
            "photo": photo_url
        }
        
        if caption:
            payload["caption"] = caption
        
        try:
            response = requests.post(url, json=payload)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Error sending photo: {e}")
            raise
    
    def set_webhook(self, webhook_url: str) -> Dict:
        """
        Configura il webhook
        
        Args:
            webhook_url: URL pubblico del webhook
        """
        url = f"{self.base_url}/setWebhook"
        
        payload = {
            "url": webhook_url,
            "allowed_updates": ["message", "callback_query"]
        }
        
        try:
            response = requests.post(url, json=payload)
            response.raise_for_status()
            result = response.json()
            logger.info(f"Webhook set: {result}")
            return result
        except requests.exceptions.RequestException as e:
            logger.error(f"Error setting webhook: {e}")
            raise
    
    def get_webhook_info(self) -> Dict:
        """
        Ottieni info sul webhook configurato
        """
        url = f"{self.base_url}/getWebhookInfo"
        
        try:
            response = requests.get(url)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Error getting webhook info: {e}")
            raise
    
    def delete_webhook(self) -> Dict:
        """
        Rimuovi il webhook
        """
        url = f"{self.base_url}/deleteWebhook"
        
        try:
            response = requests.post(url)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Error deleting webhook: {e}")
            raise


def get_telegram_bot() -> TelegramBot:
    """
    Crea client Telegram dalle variabili d'ambiente
    """
    token = os.getenv("TELEGRAM_BOT_TOKEN")
    
    if not token:
        raise ValueError("TELEGRAM_BOT_TOKEN must be set in .env")
    
    return TelegramBot(token=token)

"""
WhatsApp Business Cloud API Integration (Meta Diretta)
Integrazione diretta con Meta WhatsApp Cloud API
"""
import os
import requests
from typing import Dict, Optional, List
import logging

logger = logging.getLogger(__name__)


class WhatsAppCloudAPI:
    """
    Client per WhatsApp Business Cloud API (Meta)
    """
    
    def __init__(
        self,
        phone_number_id: str,
        access_token: str,
        api_version: str = "v21.0"
    ):
        """
        Inizializza il client WhatsApp Cloud API
        
        Args:
            phone_number_id: ID del numero WhatsApp Business
            access_token: Token di accesso permanente da Meta
            api_version: Versione API (default: v21.0)
        """
        self.phone_number_id = phone_number_id
        self.access_token = access_token
        self.api_version = api_version
        self.base_url = f"https://graph.facebook.com/{api_version}"
        
    def send_message(
        self,
        to: str,
        message: str,
        preview_url: bool = False
    ) -> Dict:
        """
        Invia un messaggio di testo
        
        Args:
            to: Numero telefono destinatario (formato: +39...)
            message: Testo del messaggio
            preview_url: Abilita preview URL nel messaggio
        
        Returns:
            Response da WhatsApp API
        """
        url = f"{self.base_url}/{self.phone_number_id}/messages"
        
        headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": to,
            "type": "text",
            "text": {
                "preview_url": preview_url,
                "body": message
            }
        }
        
        try:
            response = requests.post(url, json=payload, headers=headers)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Error sending WhatsApp message: {e}")
            raise
    
    def send_template_message(
        self,
        to: str,
        template_name: str,
        language_code: str = "it",
        components: Optional[List[Dict]] = None
    ) -> Dict:
        """
        Invia un messaggio template (pre-approvato)
        
        Args:
            to: Numero destinatario
            template_name: Nome del template approvato
            language_code: Codice lingua (default: it)
            components: Parametri del template
        """
        url = f"{self.base_url}/{self.phone_number_id}/messages"
        
        headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "messaging_product": "whatsapp",
            "to": to,
            "type": "template",
            "template": {
                "name": template_name,
                "language": {
                    "code": language_code
                }
            }
        }
        
        if components:
            payload["template"]["components"] = components
        
        try:
            response = requests.post(url, json=payload, headers=headers)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Error sending template message: {e}")
            raise
    
    def send_interactive_buttons(
        self,
        to: str,
        body_text: str,
        buttons: List[Dict[str, str]],
        header_text: Optional[str] = None,
        footer_text: Optional[str] = None
    ) -> Dict:
        """
        Invia messaggio con bottoni interattivi
        
        Args:
            to: Numero destinatario
            body_text: Testo principale
            buttons: Lista di bottoni [{"id": "1", "title": "Opzione 1"}, ...]
            header_text: Testo header (opzionale)
            footer_text: Testo footer (opzionale)
        """
        url = f"{self.base_url}/{self.phone_number_id}/messages"
        
        headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json"
        }
        
        interactive_buttons = []
        for btn in buttons[:3]:  # Max 3 bottoni
            interactive_buttons.append({
                "type": "reply",
                "reply": {
                    "id": btn.get("id"),
                    "title": btn.get("title")[:20]  # Max 20 caratteri
                }
            })
        
        payload = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": to,
            "type": "interactive",
            "interactive": {
                "type": "button",
                "body": {
                    "text": body_text
                },
                "action": {
                    "buttons": interactive_buttons
                }
            }
        }
        
        if header_text:
            payload["interactive"]["header"] = {
                "type": "text",
                "text": header_text
            }
        
        if footer_text:
            payload["interactive"]["footer"] = {
                "text": footer_text
            }
        
        try:
            response = requests.post(url, json=payload, headers=headers)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Error sending interactive message: {e}")
            raise
    
    def mark_message_as_read(self, message_id: str) -> Dict:
        """
        Marca un messaggio come letto
        """
        url = f"{self.base_url}/{self.phone_number_id}/messages"
        
        headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "messaging_product": "whatsapp",
            "status": "read",
            "message_id": message_id
        }
        
        try:
            response = requests.post(url, json=payload, headers=headers)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Error marking message as read: {e}")
            raise


# Helper per creare l'istanza dal .env
def get_whatsapp_client() -> WhatsAppCloudAPI:
    """
    Crea client WhatsApp dalle variabili d'ambiente
    """
    phone_number_id = os.getenv("WHATSAPP_PHONE_NUMBER_ID")
    access_token = os.getenv("WHATSAPP_ACCESS_TOKEN")
    
    if not phone_number_id or not access_token:
        raise ValueError(
            "WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_ACCESS_TOKEN must be set in .env"
        )
    
    return WhatsAppCloudAPI(
        phone_number_id=phone_number_id,
        access_token=access_token
    )

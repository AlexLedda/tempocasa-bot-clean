# 🔌 Setup Twilio WhatsApp API

## Vantaggi
- ✅ Funziona nell'ambiente Emergent
- ✅ No QR code richiesto
- ✅ API ufficiale WhatsApp Business
- ✅ Sandbox gratuito per testing
- ✅ Supporto scalabile per produzione

## Setup Rapido

### 1. Crea Account Twilio
https://www.twilio.com/try-twilio

### 2. Ottieni Credenziali
- Account SID
- Auth Token
- WhatsApp Number (sandbox o dedicato)

### 3. Configura Webhook
Nel pannello Twilio, imposta webhook:
```
https://whatsapp-realty-1.preview.emergentagent.com/api/twilio/webhook
```

### 4. Aggiorna Backend

Aggiungi a `/app/backend/.env`:
```bash
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

### 5. Installa Twilio SDK
```bash
cd /app/backend
pip install twilio
```

### 6. Aggiungi Endpoint Twilio

In `server.py`:

```python
from twilio.rest import Client
from twilio.request_validator import RequestValidator

# Twilio client
twilio_client = Client(
    os.environ.get('TWILIO_ACCOUNT_SID'),
    os.environ.get('TWILIO_AUTH_TOKEN')
)

@api_router.post("/twilio/webhook")
async def twilio_webhook(request: Request):
    # Ricevi messaggio da Twilio
    form_data = await request.form()
    
    phone_number = form_data.get('From', '').replace('whatsapp:', '')
    message = form_data.get('Body', '')
    
    # Processa come webhook normale
    webhook_data = WhatsAppWebhook(
        phone_number=phone_number,
        message=message,
        timestamp=int(time.time())
    )
    
    response_data = await whatsapp_webhook(webhook_data)
    
    # Invia risposta via Twilio
    if response_data.get('reply'):
        twilio_client.messages.create(
            from_=os.environ.get('TWILIO_WHATSAPP_NUMBER'),
            to=f'whatsapp:{phone_number}',
            body=response_data['reply']
        )
    
    return {"status": "success"}
```

## Costi Twilio

- **Sandbox**: Gratis (per test)
- **Produzione**: ~$0.005 per messaggio
- **Numero dedicato**: ~$1-2/mese

## Pro vs Baileys

**Twilio:**
- ✅ Affidabile
- ✅ Scalabile
- ✅ Supporto ufficiale
- ❌ A pagamento

**Baileys:**
- ✅ Gratis
- ✅ Completo
- ❌ Richiede QR code
- ❌ Non funziona in container

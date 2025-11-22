# 📱 Guida Setup WhatsApp Business Cloud API (Meta Diretta)
## Soluzione Consigliata - Più Affidabile e Ufficiale

---

## 🎯 Perché WhatsApp Cloud API?

### Vantaggi vs WATI/Twilio:
- ✅ **Direttamente da Meta** (nessun intermediario)
- ✅ **Più stabile e affidabile**
- ✅ **1000 conversazioni/mese GRATIS**
- ✅ **Nessun problema di approvazione aggiuntiva**
- ✅ **Webhook diretto al nostro backend**
- ✅ **API moderna e documentata**

---

## 📋 Prerequisiti

- ✅ **Meta Business Manager Account** (già ce l'hai)
- ✅ **Numero WhatsApp verificato** (quello in attesa da Meta)
- ✅ **Facebook Page** (collegata al business)

---

## 🚀 Setup Passo-Passo

### Step 1: Accedi a Meta Business Manager

1. Vai su https://business.facebook.com
2. Seleziona il tuo **Business Account**
3. Nel menu laterale, trova **"WhatsApp"**

### Step 2: Crea App WhatsApp Business

1. Clicca su **"Crea App"** o **"Aggiungi WhatsApp"**
2. Seleziona **"Business"** come tipo di app
3. Compila i dettagli:
   ```
   Nome App: Tempocasa Tarquinia Bot
   Email Contatto: [la tua email]
   Business Account: [seleziona il tuo]
   ```
4. Clicca **"Crea App"**

### Step 3: Configura WhatsApp Business API

1. Nel dashboard dell'app, trova **"WhatsApp"** nel menu
2. Clicca **"Inizia"**
3. Scegli **"Cloud API"** (NON On-Premises)
4. Collega il tuo numero già in verifica con Meta

### Step 4: Ottieni Credenziali

Nel dashboard vedrai:

```
📱 Phone Number ID: 1234567890
🔑 WhatsApp Business Account ID: 0987654321
🎫 Temporary Access Token: EAAxxxxx...
```

**IMPORTANTE**: Il token temporaneo dura 24 ore. Devi creare un **Token Permanente**:

1. Vai su **"Impostazioni" → "Utenti del sistema"**
2. Clicca **"Aggiungi"**
3. Nome: "Bot Elettra"
4. Ruolo: **"Admin"**
5. Clicca **"Genera nuovo token"**
6. Seleziona permessi:
   - ✅ `whatsapp_business_management`
   - ✅ `whatsapp_business_messaging`
7. Seleziona **"Mai scadere"**
8. Copia e salva il token (appare solo una volta!)

### Step 5: Configura Webhook

1. Nel dashboard WhatsApp, vai su **"Configurazione"**
2. Sezione **"Webhook"**
3. Clicca **"Modifica"**

**URL Callback:**
```
https://whatsapp-realty-1.preview.emergentagent.com/api/whatsapp/webhook
```

**Token di Verifica:** (crea uno casuale, es: `tempocasa_verify_2024`)
```
tempocasa_verify_2024
```

4. Clicca **"Verifica e salva"**

5. **Iscriviti ai webhook fields:**
   - ✅ `messages` (messaggi in arrivo)
   - ✅ `message_status` (stato messaggi)

### Step 6: Configura Backend

Nel file `/app/backend/.env` aggiungi:

```bash
# WhatsApp Cloud API
WHATSAPP_PHONE_NUMBER_ID=1234567890
WHATSAPP_ACCESS_TOKEN=EAAxxxxx...tuo_token_permanente
WHATSAPP_BUSINESS_ACCOUNT_ID=0987654321
WHATSAPP_VERIFY_TOKEN=tempocasa_verify_2024
```

### Step 7: Aggiungi Endpoint Webhook

Il backend è già pronto! Il file `/app/backend/whatsapp_cloud_api.py` contiene il client.

Aggiungiamo solo l'endpoint webhook al server:

```python
# In server.py aggiungi:

from whatsapp_cloud_api import get_whatsapp_client
from bot_messages import get_welcome_message, MESSAGES
from bot_learning import BotLearningSystem

@api_router.get("/whatsapp/webhook")
async def verify_webhook(request: Request):
    """
    Verifica webhook per WhatsApp Cloud API
    """
    mode = request.query_params.get("hub.mode")
    token = request.query_params.get("hub.verify_token")
    challenge = request.query_params.get("hub.challenge")
    
    verify_token = os.getenv("WHATSAPP_VERIFY_TOKEN")
    
    if mode == "subscribe" and token == verify_token:
        logger.info("Webhook verified successfully!")
        return int(challenge)
    else:
        raise HTTPException(status_code=403, detail="Verification failed")

@api_router.post("/whatsapp/webhook")
async def handle_whatsapp_message(request: Request):
    """
    Gestisce messaggi in arrivo da WhatsApp
    """
    try:
        data = await request.json()
        
        # Estrai messaggio
        entry = data.get("entry", [{}])[0]
        changes = entry.get("changes", [{}])[0]
        value = changes.get("value", {})
        messages = value.get("messages", [])
        
        if not messages:
            return {"status": "ok"}
        
        message = messages[0]
        from_number = message.get("from")
        message_body = message.get("text", {}).get("body", "")
        message_id = message.get("id")
        
        # Inizializza client e learning system
        wa_client = get_whatsapp_client()
        learning_system = BotLearningSystem(db)
        
        # Marca come letto
        await wa_client.mark_message_as_read(message_id)
        
        # Processa messaggio
        response_text = await process_message(message_body, from_number, learning_system)
        
        # Invia risposta
        wa_client.send_message(
            to=from_number,
            message=response_text
        )
        
        # Salva conversazione per learning
        await learning_system.save_conversation(
            phone_number=from_number,
            message=message_body,
            response=response_text
        )
        
        return {"status": "ok"}
        
    except Exception as e:
        logger.error(f"Error handling WhatsApp webhook: {e}")
        return {"status": "error", "message": str(e)}

async def process_message(message: str, phone_number: str, learning_system) -> str:
    """
    Processa il messaggio e genera risposta
    """
    message_lower = message.lower().strip()
    
    # Primi messaggi → benvenuto
    if message_lower in ['ciao', 'salve', 'buongiorno', 'buonasera', 'hello', 'hi']:
        return get_welcome_message()
    
    # Opzione 1 - Cerco casa
    if message_lower in ['1', 'cerco casa', 'voglio comprare']:
        return MESSAGES['searching']()
    
    # Opzione 2 - Voglio vendere
    if message_lower in ['2', 'voglio vendere', 'vendere', 'affittare']:
        return MESSAGES['selling']()
    
    # Opzione 3 - Valutazione
    if message_lower in ['3', 'valutazione', 'stima']:
        return MESSAGES['valuation']()
    
    # Opzione 4 - Info immobile
    if message_lower in ['4', 'info immobile', 'informazioni']:
        return MESSAGES['specific']()
    
    # Opzione 5 - Contatto agente
    if message_lower in ['5', 'agente', 'parlare con agente']:
        return MESSAGES['agent']()
    
    # Cerca risposte simili nel database
    suggestion = await learning_system.suggest_response(message)
    if suggestion:
        return suggestion
    
    # Default: fuori contesto
    return MESSAGES['out_of_context']()
```

### Step 8: Test

1. **Riavvia backend:**
   ```bash
   sudo supervisorctl restart backend
   ```

2. **Test webhook manuale:**
   ```bash
   curl "https://whatsapp-realty-1.preview.emergentagent.com/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=tempocasa_verify_2024&hub.challenge=12345"
   ```
   
   Dovrebbe ritornare: `12345`

3. **Invia messaggio WhatsApp:**
   - Apri WhatsApp
   - Invia "Ciao" al tuo numero business
   - Dovresti ricevere il messaggio di benvenuto!

---

## 💰 Costi

### Gratuito:
- Prime **1000 conversazioni/mese**
- Una conversazione = finestra di 24h con cliente

### Dopo 1000:
- ~€0.05-0.10 per conversazione
- Dipende dal paese del cliente

**Stima per agenzia immobiliare:**
- 50-100 conversazioni/mese → **GRATIS**
- 200 conversazioni/mese → ~€10/mese
- 500 conversazioni/mese → ~€25/mese

Molto più economico di WATI! 💰

---

## 🎯 Vantaggi di Questa Soluzione

1. **Nessun Intermediario**
   - Diretto con Meta
   - Nessun vendor lock-in

2. **Più Affidabile**
   - Uptime 99.9%
   - Supporto Meta ufficiale

3. **Scalabile**
   - Gestisce migliaia di messaggi
   - Nessun limite artificiale

4. **Economico**
   - 1000 conversazioni gratis
   - Pay-as-you-grow

5. **Moderno**
   - API REST standard
   - Webhook in tempo reale
   - Supporto bottoni, template, media

---

## 📚 Documentazione Ufficiale

- **Guida Completa:** https://developers.facebook.com/docs/whatsapp/cloud-api
- **Getting Started:** https://developers.facebook.com/docs/whatsapp/cloud-api/get-started
- **Reference API:** https://developers.facebook.com/docs/whatsapp/cloud-api/reference

---

## 🆘 Troubleshooting

### Webhook non si verifica:
- Controlla che l'URL sia accessibile pubblicamente
- Verifica che il token corrisponda esattamente

### Messaggio non arriva:
- Controlla che il numero sia verificato
- Verifica permessi token
- Controlla logs backend: `/var/log/supervisor/backend.err.log`

### Errore 403 sending message:
- Token scaduto o invalido
- Rigenera token permanente
- Verifica permessi token

---

## 🎉 Prossimi Passi Dopo Setup

1. **Crea Template Messaggi**
   - Per conferme appuntamenti
   - Per promemoria
   - Per follow-up

2. **Testa Flow Completi**
   - Cerca casa → mostra proprietà
   - Richiesta valutazione → crea appuntamento

3. **Monitora Analytics**
   - Dashboard Meta per statistiche
   - Bot insights nel backend

---

**Questa è la soluzione MIGLIORE e più AFFIDABILE per il tuo bot WhatsApp! 🚀**

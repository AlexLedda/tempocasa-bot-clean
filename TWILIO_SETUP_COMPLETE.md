# 📱 GUIDA COMPLETA: Twilio WhatsApp Setup

## 🎯 ARCHITETTURA FINALE

```
Cliente WhatsApp
      ↓
Twilio WhatsApp Sandbox
      ↓
Webhook → Backend Render
      ↓
Claude AI (Emergent LLM)
      ↓
MongoDB (Railway)
      ↓
Risposta → Twilio → Cliente
```

---

## 📋 STEP 1: Registrazione Twilio (5 minuti)

### 1.1 Crea Account

1. **Vai su:** https://www.twilio.com/try-twilio
2. **Sign Up** compilando:
   - First Name
   - Last Name  
   - Email
   - Password
3. **Verifica email**
4. **Verifica telefono** (SMS)

### 1.2 Setup Iniziale

Twilio ti farà alcune domande:
- **Which Twilio product?** → Messaging
- **What do you plan to build?** → Chatbots
- **How do you want to build?** → With code
- **Programming language?** → Node.js

✅ Account creato! Ti darà **$15.00 di credito gratuito**

---

## 🔑 STEP 2: Ottieni Credenziali (2 minuti)

### 2.1 Account SID e Auth Token

1. **Dashboard Twilio:** https://console.twilio.com
2. In alto vedrai **"Account Info"**:
   ```
   ACCOUNT SID: ACxxxxxxxxxxxxxxxxxxxxxxxxxx
   AUTH TOKEN: [Show] → clicca per vedere
   ```
3. **📝 COPIA entrambi**

### 2.2 WhatsApp Sandbox

1. **Menu sinistro:** Messaging → Try it out → **Send a WhatsApp message**
2. Oppure: https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn
3. Vedrai:
   ```
   Sandbox Phone Number: +1 415 523 8886
   Join Code: join [tuo-codice-unico]
   ```
4. **📝 COPIA il numero** (formato: `whatsapp:+14155238886`)

### 2.3 Attiva Sandbox (IMPORTANTE!)

1. **Dal tuo WhatsApp personale**
2. **Manda messaggio a:** +1 415 523 8886
3. **Scrivi:** `join [tuo-codice]` (es: `join shadow-garden`)
4. ✅ Riceverai conferma: "You are now connected to WhatsApp Sandbox"

---

## 🔧 STEP 3: Configurazione Backend (Render)

### 3.1 Aggiungi Variabili Twilio

1. **Render Dashboard** → `real-estate-backend`
2. **Settings** → **Environment Variables**
3. **Add** le seguenti variabili:

| Key | Value | Esempio |
|-----|-------|---------|
| `TWILIO_ACCOUNT_SID` | Il tuo Account SID | `ACxxxxxxxxx...` |
| `TWILIO_AUTH_TOKEN` | Il tuo Auth Token | `abc123xyz...` |
| `TWILIO_PHONE_NUMBER` | Il numero sandbox | `whatsapp:+14155238886` |

4. **Save** → Render rideploya automaticamente

---

## 📡 STEP 4: Deploy WhatsApp Service (Render)

### 4.1 Crea Nuovo Web Service

1. **Render Dashboard** → **New +** → **Web Service**
2. **Connect repository:** `real-estate-whatsapp-bot`
3. **Configure:**

| Campo | Valore |
|-------|--------|
| **Name** | `whatsapp-service` |
| **Region** | `Frankfurt (EU Central)` |
| **Branch** | `main` |
| **Root Directory** | `whatsapp-service` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `node whatsapp-twilio.js` |
| **Instance Type** | `Free` |

### 4.2 Environment Variables (WhatsApp Service)

| Key | Value |
|-----|-------|
| `BACKEND_URL` | `https://real-estate-bot-v2-0.onrender.com` |
| `TWILIO_ACCOUNT_SID` | Il tuo Account SID |
| `TWILIO_AUTH_TOKEN` | Il tuo Auth Token |
| `TWILIO_PHONE_NUMBER` | `whatsapp:+14155238886` |
| `PORT` | `10000` |

4. **Create Web Service**
5. ⏳ Attendi deploy (3-5 minuti)

---

## 🔗 STEP 5: Configurazione Webhook Twilio

### 5.1 Ottieni URL Backend

Il tuo webhook URL è:
```
https://real-estate-bot-v2-0.onrender.com/api/whatsapp/webhook
```

### 5.2 Configura Twilio Sandbox

1. **Twilio Console:** https://console.twilio.com/us1/develop/sms/settings/whatsapp-sandbox
2. Oppure: Messaging → Settings → **WhatsApp sandbox settings**
3. **WHEN A MESSAGE COMES IN:**
   - Seleziona: **Webhook**
   - URL: `https://real-estate-bot-v2-0.onrender.com/api/whatsapp/webhook`
   - Method: **POST**
4. **Save**

✅ Ora Twilio manderà i messaggi al tuo backend!

---

## 🧪 STEP 6: Test Completo

### 6.1 Test Backend Webhook

```bash
curl -X POST https://real-estate-bot-v2-0.onrender.com/api/whatsapp/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number": "+393331234567",
    "message": "Ciao, cerco casa",
    "timestamp": 1699999999
  }'
```

**Risposta attesa:**
```json
{
  "reply": "Ciao! Sono Emma, l'assistente virtuale di Tempocasa Tarquinia...",
  "success": true
}
```

### 6.2 Test WhatsApp Reale

1. **Apri WhatsApp** (quello che hai collegato al sandbox)
2. **Vai alla chat** con +1 415 523 8886
3. **Scrivi:** "Ciao, cerco un appartamento"
4. ✅ **Dovresti ricevere risposta da Emma!**

---

## 🔄 FLUSSO COMPLETO

```
1. Cliente manda messaggio WhatsApp
   ↓
2. Twilio riceve messaggio
   ↓
3. Twilio chiama webhook:
   POST https://real-estate-bot-v2-0.onrender.com/api/whatsapp/webhook
   ↓
4. Backend FastAPI:
   - Salva messaggio su MongoDB
   - Controlla se cliente nuovo/esistente
   - Se nuovo: chiama Claude AI
   - Genera risposta personalizzata
   ↓
5. Backend ritorna risposta a Twilio
   ↓
6. Twilio manda risposta al cliente
   ↓
7. ✅ Cliente riceve risposta automatica
```

---

## 💰 COSTI TWILIO

### Piano Gratuito (Trial):
- ✅ **$15 credito iniziale**
- ✅ Tutte le funzioni attive
- ⚠️ Messaggi hanno prefisso "Sent from Twilio trial account"
- ⚠️ Puoi mandare solo a numeri verificati

### Costi messaggi WhatsApp:
- **Messaggio ricevuto:** $0.005 (€0.0046)
- **Messaggio inviato:** $0.005 (€0.0046)
- **Conversazione (24h):** Gratuita dopo primo messaggio

### Con $15 credito:
- ~1.500 messaggi ricevuti
- ~1.500 messaggi inviati
- **Totale: ~3.000 messaggi gratis!**

### Upgrade (se necessario):
- **Twilio Verified Sender:** $0 setup
- **Numero WhatsApp Business:** ~$10-15/mese
- **Messaggi:** Stessi prezzi ($0.005/msg)

---

## ⚠️ LIMITAZIONI SANDBOX

### Sandbox WhatsApp:
- ✅ Gratuito
- ✅ Perfetto per test e development
- ⚠️ Ogni utente deve fare "join" al sandbox
- ⚠️ Sessioni scadono dopo 3 giorni
- ⚠️ Limite 3 numeri contemporaneamente

### Per Produzione (Business API):
1. Richiedi Twilio WhatsApp Business API
2. Verifica business (Facebook Business Manager)
3. Numero dedicato WhatsApp
4. Nessun limite utenti
5. Sessioni permanenti

**Costo upgrade:** ~$10-15/mese per numero dedicato

---

## 🔒 SICUREZZA

### Best Practices Implementate:

1. **Validazione Webhook:**
   - Backend verifica che richiesta venga da Twilio
   - Check firma (se configurata)

2. **Rate Limiting:**
   - Backend limita messaggi per utente
   - Previene spam

3. **Data Privacy:**
   - Numeri telefono criptati
   - Messaggi salvati su database sicuro
   - Conformità GDPR

4. **Credentials:**
   - ✅ Mai nel codice
   - ✅ Solo in environment variables
   - ✅ Non committate su GitHub

---

## 🆘 TROUBLESHOOTING

### "Webhook not responding"
1. Verifica URL webhook su Twilio
2. Controlla che backend sia "Live" su Render
3. Test con curl (vedi STEP 6.1)
4. Controlla logs backend su Render

### "Bot non risponde"
1. Verifica di aver fatto "join" al sandbox
2. Controlla che TWILIO_* variables siano su Render
3. Verifica EMERGENT_LLM_KEY sia configurata
4. Controlla logs backend per errori

### "Invalid credentials"
1. Rigenera Auth Token su Twilio
2. Aggiorna su Render
3. Rideploya servizio

### "Message not delivered"
1. Verifica credito Twilio ($15 trial)
2. Controlla che numero sia verificato
3. Vedi logs Twilio Console

---

## 📊 MONITORING

### Dashboard Twilio:
- **Messaging → Logs:** Tutti i messaggi
- **Monitor → Logs → Debugger:** Errori webhook
- **Usage:** Credito rimanente

### Dashboard Render:
- **Logs:** Vedi chiamate webhook in real-time
- **Metrics:** CPU, RAM, richieste

### Dashboard Frontend (Vercel):
- **Vai su Messaggi:** Vedi tutti i messaggi salvati
- **Clienti:** Vedi profili creati automaticamente

---

## ✅ CHECKLIST DEPLOYMENT

- [ ] Account Twilio creato
- [ ] Credenziali copiate (Account SID, Auth Token)
- [ ] WhatsApp Sandbox attivato (join)
- [ ] Variabili aggiunte su Render (backend)
- [ ] WhatsApp Service deployed su Render
- [ ] Webhook configurato su Twilio
- [ ] Test curl funziona
- [ ] Test WhatsApp reale funziona
- [ ] Bot risponde correttamente
- [ ] Messaggi salvati su database
- [ ] 🎉 **TWILIO CONFIGURATO!**

---

## 🚀 ARCHITETTURA COMPLETA FINALE

```
FRONTEND (Vercel)
├─ Dashboard
├─ Immobili (upload Cloudinary)
├─ Clienti
├─ Messaggi WhatsApp
└─ Impostazioni

BACKEND (Render)
├─ API REST
├─ Webhook WhatsApp
├─ Claude AI integration
└─ Upload immagini

WHATSAPP SERVICE (Render)
├─ Node.js
└─ Twilio SDK

DATABASE (Railway)
└─ MongoDB

STORAGE (Cloudinary)
└─ Immagini immobili (25GB)

WHATSAPP
├─ Twilio Sandbox
└─ $15 credito gratis
```

---

## 💡 PROSSIMI STEP (Opzionali)

### Upgrade a WhatsApp Business API:
1. Completa verifica business
2. Richiedi numero dedicato
3. Template messaggi approvati
4. Nessun limite utenti

### Funzionalità Avanzate:
- Invio immagini immobili via WhatsApp
- Template messaggi predefiniti
- Broadcast messaggi
- Analytics avanzate

---

**Data:** 10 Novembre 2024  
**Versione:** 2.2 (con Twilio WhatsApp)

**Costi Totali Sistema Completo:** €0/mese  
(3.000 messaggi WhatsApp gratis con trial Twilio)

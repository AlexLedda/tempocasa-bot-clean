# 🚀 ISTRUZIONI RAPIDE - Deploy Backend

## 📦 COSA HAI SCARICATO

Un pacchetto completo con:
- ✅ Backend FastAPI aggiornato
- ✅ Webhook Twilio funzionante
- ✅ Integrazione AI (Claude)
- ✅ MongoDB Atlas ready
- ✅ Cloudinary per immagini

---

## ⚡ 5 STEP VELOCI

### 1️⃣ CREA NUOVO REPO GITHUB (2 min)
- Vai su https://github.com/new
- Nome: `real-estate-backend-v2`
- Private
- **NON aggiungere** README o .gitignore
- Create repository

### 2️⃣ UPLOAD CODICE (1 min)
- Nel repo, clicca "uploading an existing file"
- Trascina tutta la cartella **backend** dal pacchetto
- Commit: "Initial commit"

### 3️⃣ CREA SERVIZIO RENDER (3 min)
- https://dashboard.render.com
- New + → Web Service
- Collega il nuovo repo
- **Settings:**
  - Name: `real-estate-backend-v2`
  - Runtime: Python 3
  - Build: `pip install -r requirements.txt`
  - Start: `uvicorn server:app --host 0.0.0.0 --port $PORT`
  - Free tier
- Create

### 4️⃣ AGGIUNGI VARIABILI (5 min)
Su Render → Environment → Add:

```
MONGO_URL = mongodb+srv://leddaalessandro336_db_user:Corneto1@cluster0.eczvwlq.mongodb.net/real_estate?retryWrites=true&w=majority

DB_NAME = real_estate

EMERGENT_LLM_KEY = [la tua chiave]

TWILIO_ACCOUNT_SID = [il tuo SID]
TWILIO_AUTH_TOKEN = [il tuo token]
TWILIO_PHONE_NUMBER = whatsapp:+14155238886

CLOUDINARY_CLOUD_NAME = [il tuo]
CLOUDINARY_API_KEY = [la tua]
CLOUDINARY_API_SECRET = [il tuo]
```

⚠️ **Ho già inserito il tuo MongoDB URL - cambia solo se hai creato un altro database!**

### 5️⃣ CONFIGURA WEBHOOK TWILIO (1 min)
- https://console.twilio.com
- Messaging → WhatsApp sandbox settings
- URL: `https://IL-TUO-SERVIZIO.onrender.com/api/whatsapp/webhook`
- Method: POST
- Save

---

## ✅ TEST FINALE

**WhatsApp:**
Manda messaggio a `+1 415 523 8886` → Dovresti ricevere risposta!

**API:**
Apri: `https://IL-TUO-SERVIZIO.onrender.com/api/stats`

---

## 🆘 PROBLEMI?

### Backend non parte
→ Controlla logs su Render
→ Verifica tutte le environment variables

### Bot non risponde
→ Webhook URL corretto su Twilio?
→ Hai fatto "join" al sandbox?
→ Controlla logs Render

### MongoDB error
→ Password senza `< >` ?
→ IP 0.0.0.0/0 su Atlas whitelist?

---

## 📝 FILE NEL PACCHETTO

```
backend/
├── server.py              ← API principale
├── ai_helpers.py          ← Funzioni AI
├── requirements.txt       ← Dipendenze
├── .env.example          ← Template variabili
├── .gitignore            ← Files da ignorare
└── uploads/              ← Cartella upload

README.md                  ← Guida completa
ISTRUZIONI_RAPIDE.md      ← Questo file
```

---

## 🎯 URL IMPORTANTE

Dopo il deploy su Render, il tuo backend sarà:
```
https://IL-TUO-NOME.onrender.com
```

Usalo per:
- Webhook Twilio: `...onrender.com/api/whatsapp/webhook`
- Frontend .env: `REACT_APP_BACKEND_URL=https://...onrender.com`

---

**Buon deploy! 🚀**

Se hai problemi, leggi il README.md completo per troubleshooting dettagliato.

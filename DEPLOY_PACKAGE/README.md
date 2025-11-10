# 🏠 Real Estate WhatsApp Bot - Backend

Backend FastAPI per il bot WhatsApp immobiliare con integrazione Twilio, AI (Claude), MongoDB Atlas e Cloudinary.

---

## 🚀 DEPLOY SU RENDER (Guida Completa)

### **STEP 1: Crea Nuovo Repository GitHub**

1. Vai su https://github.com/new
2. **Repository name:** `real-estate-backend-v2` (o nome a tua scelta)
3. **Visibility:** Private (consigliato)
4. **NON** aggiungere README, .gitignore o license (li hai già)
5. Clicca **"Create repository"**

---

### **STEP 2: Upload Codice su GitHub**

#### Opzione A: Via Web (più semplice)

1. Nel tuo nuovo repository GitHub, clicca **"uploading an existing file"**
2. **Trascina tutta la cartella `backend`** (con tutti i file dentro)
3. Scrivi commit message: "Initial commit - Backend setup"
4. Clicca **"Commit changes"**

#### Opzione B: Via Git CLI

```bash
cd backend
git init
git add .
git commit -m "Initial commit - Backend setup"
git remote add origin https://github.com/TUO_USERNAME/real-estate-backend-v2.git
git branch -M main
git push -u origin main
```

---

### **STEP 3: Crea Web Service su Render**

1. **Vai su:** https://dashboard.render.com
2. Clicca **"New +"** → **"Web Service"**
3. **Connect repository:** Seleziona il tuo nuovo repository GitHub
4. **Configura il servizio:**

| Campo | Valore |
|-------|--------|
| **Name** | `real-estate-backend-v2` |
| **Region** | `Frankfurt (EU Central)` |
| **Branch** | `main` |
| **Root Directory** | Lascia vuoto (se hai uploadato solo la cartella backend) o scrivi `backend` |
| **Runtime** | `Python 3` |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `uvicorn server:app --host 0.0.0.0 --port $PORT` |
| **Instance Type** | `Free` |

5. Clicca **"Create Web Service"**

---

### **STEP 4: Configura Environment Variables**

Nel servizio Render appena creato:

1. Vai su **"Environment"** (menu sinistro)
2. Clicca **"Add Environment Variable"**
3. **Aggiungi queste variabili:**

#### MongoDB Atlas
```
MONGO_URL = mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/real_estate?retryWrites=true&w=majority
DB_NAME = real_estate
```
⚠️ **IMPORTANTE:** Sostituisci username, password e cluster con i tuoi dati MongoDB Atlas!

#### Emergent LLM Key
```
EMERGENT_LLM_KEY = [la tua chiave Emergent]
```

#### Twilio WhatsApp
```
TWILIO_ACCOUNT_SID = ACxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN = [il tuo auth token]
TWILIO_PHONE_NUMBER = whatsapp:+14155238886
```

#### Cloudinary (opzionale, per upload immagini)
```
CLOUDINARY_CLOUD_NAME = [il tuo cloud name]
CLOUDINARY_API_KEY = [la tua api key]
CLOUDINARY_API_SECRET = [il tuo api secret]
```

#### CORS (Frontend)
```
FRONTEND_URL = https://your-frontend.vercel.app
```

4. Clicca **"Save Changes"**
5. ⏳ Render rideploya automaticamente (3-5 minuti)

---

### **STEP 5: Ottieni URL Backend**

Dopo il deploy, Render ti darà un URL tipo:
```
https://real-estate-backend-v2.onrender.com
```

📝 **COPIA QUESTO URL** - ti servirà per:
1. Configurare il webhook Twilio
2. Configurare il frontend

---

### **STEP 6: Configura Webhook Twilio**

1. **Vai su Twilio Console:** https://console.twilio.com
2. **Messaging** → **Settings** → **WhatsApp sandbox settings**
3. **WHEN A MESSAGE COMES IN:**
   - URL: `https://real-estate-backend-v2.onrender.com/api/whatsapp/webhook`
   - Method: **POST**
4. **Clicca "Save"**

---

## 🧪 TEST

### Test 1: Backend Live
Apri nel browser:
```
https://real-estate-backend-v2.onrender.com/api/stats
```
Dovresti vedere delle statistiche JSON.

### Test 2: WhatsApp
1. Apri WhatsApp
2. Manda messaggio a `+1 415 523 8886`
3. Scrivi: "Ciao, cerco casa"
4. ✅ Dovresti ricevere risposta dal bot!

### Test 3: Logs
Su Render → Tuo servizio → **Logs**
- Guarda i log in tempo reale mentre testi

---

## 📊 STRUTTURA FILE

```
backend/
├── server.py              # API principale FastAPI
├── ai_helpers.py          # Funzioni helper per AI
├── requirements.txt       # Dipendenze Python
├── .env.example          # Template variabili ambiente
└── README.md             # Questa guida
```

---

## 🔧 TECNOLOGIE

- **FastAPI** - Web framework Python
- **Motor** - MongoDB async driver
- **Claude Sonnet 4** - AI via Emergent LLM
- **Twilio** - WhatsApp API
- **Cloudinary** - Image hosting
- **MongoDB Atlas** - Database cloud

---

## 📝 ENDPOINTS API

| Endpoint | Method | Descrizione |
|----------|--------|-------------|
| `/api/properties` | GET, POST | Gestione immobili |
| `/api/clients` | GET, POST | Gestione clienti |
| `/api/messages` | GET, POST | Messaggi WhatsApp |
| `/api/appointments` | GET, POST, DELETE | Appuntamenti |
| `/api/valuations` | GET, POST, DELETE | Richieste valutazione |
| `/api/settings` | GET, PUT | Impostazioni bot |
| `/api/whatsapp/webhook` | POST | Webhook Twilio |
| `/api/upload-image` | POST | Upload immagini Cloudinary |
| `/api/stats` | GET | Statistiche dashboard |

---

## 🆘 TROUBLESHOOTING

### "Application failed to start"
- Controlla i logs su Render
- Verifica che tutte le environment variables siano configurate
- Verifica che `MONGO_URL` sia corretto (no `< >` nella password)

### "422 Unprocessable Content" sul webhook
- Verifica che l'URL webhook su Twilio sia corretto
- Deve finire con `/api/whatsapp/webhook`
- Method deve essere POST

### "MongoDB authentication failed"
- La password in `MONGO_URL` NON deve avere `< >` intorno
- Deve essere: `mongodb+srv://user:PASSWORD@cluster...` (no `<PASSWORD>`)
- Verifica IP whitelist su MongoDB Atlas (aggiungi `0.0.0.0/0`)

### "Bot non risponde su WhatsApp"
- Hai fatto "join" al sandbox Twilio?
- Webhook configurato correttamente?
- Controlla i logs su Render per errori
- Verifica `EMERGENT_LLM_KEY` sia configurata

---

## 💰 COSTI

- **Render Free Tier:** €0/mese (750 ore/mese)
- **MongoDB Atlas M0:** €0/mese (512 MB)
- **Twilio Trial:** $15 credito gratis (~3.000 messaggi)
- **Cloudinary Free:** €0/mese (25 GB storage)

**TOTALE:** €0/mese per iniziare! 🎉

---

## 📞 SUPPORTO

Se hai problemi:
1. Controlla i logs su Render
2. Verifica tutte le environment variables
3. Testa gli endpoint API direttamente

---

**Versione:** 2.0  
**Data:** Novembre 2025  
**Ultima modifica:** Fix webhook Twilio + MongoDB Atlas

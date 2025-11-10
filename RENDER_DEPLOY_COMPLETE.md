# 🎨 DEPLOY COMPLETO SU RENDER.COM

## 📋 PREREQUISITI

Prima di iniziare assicurati di avere:
- ✅ Account GitHub con il repository
- ✅ MongoDB Atlas URL (es: mongodb+srv://...)
- ✅ Emergent LLM Key (per l'AI)
- ✅ (Opzionale) Twilio credentials per WhatsApp

---

## 🚀 PARTE 1: SETUP ACCOUNT RENDER

### Step 1: Registrazione
1. Vai su **https://render.com**
2. Clicca **"Get Started for Free"**
3. Seleziona **"Sign up with GitHub"**
4. Autorizza Render ad accedere ai tuoi repository
5. ✅ Account creato!

---

## 🔧 PARTE 2: DEPLOY BACKEND (FastAPI)

### Step 1: Crea Web Service

1. Dalla Dashboard Render, clicca **"New +"** in alto a destra
2. Seleziona **"Web Service"**
3. Clicca **"Connect a repository"** 
4. Trova e seleziona il tuo repository **"real-estate-whatsapp-bot"**
5. Clicca **"Connect"**

### Step 2: Configurazione Backend

Compila il form con questi valori:

**Basic Info:**
- **Name:** `real-estate-backend`
- **Region:** `Frankfurt (EU Central)` o quello più vicino
- **Branch:** `main` (o `master`)
- **Root Directory:** `backend`
- **Runtime:** `Python 3`

**Build & Deploy:**
- **Build Command:**
  ```bash
  pip install -r requirements.txt
  ```
- **Start Command:**
  ```bash
  uvicorn server:app --host 0.0.0.0 --port $PORT
  ```

**Instance Type:**
- Seleziona: **Free** (0€/mese)

### Step 3: Environment Variables (IMPORTANTISSIMO!)

Clicca su **"Advanced"** e aggiungi le seguenti variabili:

| Key | Value | Note |
|-----|-------|------|
| `MONGO_URL` | `mongodb+srv://user:password@cluster.mongodb.net/...` | Il tuo MongoDB Atlas URL |
| `DB_NAME` | `real_estate_bot` | Nome database |
| `EMERGENT_LLM_KEY` | `la_tua_chiave` | Per Claude AI |
| `CORS_ORIGINS` | `*` | Permetti tutte le origini |
| `BOT_NAME` | `Emma` | Nome del bot |
| `BOT_AGENCY_NAME` | `Tempocasa Tarquinia` | Nome agenzia |
| `PRIMARY_COLOR` | `#179306` | Colore primario |
| `SECONDARY_COLOR` | `#10b981` | Colore secondario |
| `ACCENT_COLOR` | `#f59e0b` | Colore accent |
| `LOGO_URL` | `` | (lascia vuoto per ora) |

### Step 4: Deploy!

1. Clicca **"Create Web Service"** in fondo
2. ⏳ Render inizierà il build (5-10 minuti)
3. 📊 Puoi seguire i log in tempo reale
4. ✅ Quando vedi "Live" in verde, è pronto!

### Step 5: Copia URL Backend

1. Nella pagina del servizio, in alto trovi l'URL:
   ```
   https://real-estate-backend-xxxx.onrender.com
   ```
2. **📝 COPIA QUESTO URL** - ti servirà per il prossimo step!

---

## 📱 PARTE 3: DEPLOY WHATSAPP SERVICE

### Step 1: Crea Secondo Web Service

1. Torna alla **Dashboard** di Render
2. Clicca **"New +"** → **"Web Service"**
3. Seleziona lo **stesso repository**
4. Clicca **"Connect"**

### Step 2: Configurazione WhatsApp Service

**Basic Info:**
- **Name:** `whatsapp-service`
- **Region:** `Frankfurt (EU Central)` (stesso del backend!)
- **Branch:** `main`
- **Root Directory:** `whatsapp-service`
- **Runtime:** `Node`

**Build & Deploy:**
- **Build Command:**
  ```bash
  npm install
  ```
- **Start Command:**
  ```bash
  node whatsapp-service.js
  ```

**Instance Type:**
- Seleziona: **Free**

### Step 3: Environment Variables WhatsApp

| Key | Value | Note |
|-----|-------|------|
| `BACKEND_URL` | `https://real-estate-backend-xxxx.onrender.com` | URL del backend (Step 2.5) |
| `PORT` | `10000` | Porta per il servizio |

**Se usi Twilio (opzionale per ora):**
| Key | Value |
|-----|-------|
| `TWILIO_ACCOUNT_SID` | `ACxxxxxxxxx` |
| `TWILIO_AUTH_TOKEN` | `xxxxxxxxx` |
| `TWILIO_PHONE_NUMBER` | `whatsapp:+14155238886` |

### Step 4: Deploy WhatsApp Service

1. Clicca **"Create Web Service"**
2. ⏳ Attendi il build (3-5 minuti)
3. ✅ Quando vedi "Live" è pronto!

---

## 🌐 PARTE 4: DEPLOY FRONTEND (Vercel)

Il frontend è meglio deployarlo su Vercel (più veloce per React).

### Step 1: Setup Vercel

1. Vai su **https://vercel.com**
2. **"Sign Up"** con GitHub
3. Clicca **"Add New Project"**
4. Seleziona il repository **"real-estate-whatsapp-bot"**
5. Clicca **"Import"**

### Step 2: Configurazione Frontend

**Framework Preset:** `Create React App` (auto-rilevato)

**Root Directory:** 
- Clicca **"Edit"**
- Inserisci: `frontend`

**Environment Variables:**
- Clicca **"Environment Variables"**
- Aggiungi:
  | Name | Value |
  |------|-------|
  | `REACT_APP_BACKEND_URL` | `https://real-estate-backend-xxxx.onrender.com` |

### Step 3: Deploy Frontend

1. Clicca **"Deploy"**
2. ⏳ Attendi 2-3 minuti
3. 🎉 Frontend live!
4. Clicca sul link per vedere la tua app

---

## ✅ VERIFICA FUNZIONAMENTO

### Test Backend
Apri nel browser:
```
https://real-estate-backend-xxxx.onrender.com/api/settings
```

Dovresti vedere:
```json
{
  "bot_name": "Emma",
  "agency_name": "Tempocasa Tarquinia",
  "primary_color": "#179306",
  ...
}
```

### Test Frontend
Apri nel browser:
```
https://tua-app.vercel.app
```

Dovresti vedere la dashboard funzionante!

---

## ⚠️ PROBLEMA: Servizio Dorme (Cold Start)

Render Free **dorme dopo 15 minuti** di inattività.
Il primo accesso dopo il sonno impiega ~30 secondi.

### 🔧 SOLUZIONE: UptimeRobot (Ping Automatico)

1. Vai su **https://uptimerobot.com**
2. **Sign Up** (gratuito)
3. **Add New Monitor**:
   - **Monitor Type:** HTTP(s)
   - **Friendly Name:** `Backend Ping`
   - **URL:** `https://real-estate-backend-xxxx.onrender.com/api/stats`
   - **Monitoring Interval:** `5 minutes`
4. **Create Monitor**
5. Ripeti per WhatsApp service se necessario

✅ Ora il servizio rimane sempre attivo!

---

## 📊 MONITORAGGIO

### Logs Backend/WhatsApp (Render)
1. Dashboard Render
2. Clicca sul servizio
3. Tab **"Logs"** → logs in tempo reale
4. Tab **"Metrics"** → CPU, RAM, richieste

### Frontend (Vercel)
1. Dashboard Vercel
2. Progetto → **"Deployments"**
3. Clicca su deployment → **"Functions"** → logs

---

## 🔄 AUTO-DEPLOY

Ogni volta che fai push su GitHub:
- ✅ Render rideploya automaticamente backend e WhatsApp
- ✅ Vercel rideploya automaticamente frontend
- ⏱️ Tempo totale: 5-10 minuti

---

## 🆘 TROUBLESHOOTING

### Backend non parte
1. Vai su Render → Servizio → Logs
2. Cerca errori rossi
3. Possibili cause:
   - ❌ MONGO_URL sbagliato
   - ❌ Manca qualche dipendenza in requirements.txt
   - ❌ Environment variable mancante

### Frontend non comunica con backend
1. Verifica che `REACT_APP_BACKEND_URL` sia corretto
2. Controlla CORS nel backend (deve essere `*` o URL Vercel)
3. Apri Console Browser (F12) per vedere errori

### WhatsApp non risponde
1. Verifica che `BACKEND_URL` punti al backend corretto
2. Controlla logs WhatsApp service
3. Verifica credenziali Twilio (se usi Twilio)

---

## 💰 COSTI

| Servizio | Piano | Costo Mensile |
|----------|-------|---------------|
| Render Backend | Free | €0 |
| Render WhatsApp | Free | €0 |
| Vercel Frontend | Hobby | €0 |
| MongoDB Atlas | Free (512MB) | €0 |
| UptimeRobot | Free | €0 |
| **TOTALE** | | **€0/mese** ✅ |

---

## 📈 LIMITI FREE TIER

**Render Free:**
- ✅ 750 ore/mese (sufficienti per 1 servizio 24/7)
- ✅ 512MB RAM
- ✅ 0.1 CPU
- ⚠️ Dorme dopo 15min inattività (risolvibile con UptimeRobot)

**Vercel Hobby:**
- ✅ Deploy illimitati
- ✅ 100GB bandwidth/mese
- ✅ HTTPS automatico
- ✅ CDN globale

---

## 🎯 PROSSIMI PASSI

1. ✅ Deploy completato
2. 🧪 Testa tutte le funzionalità
3. 🎨 Carica il logo dalla dashboard
4. 🤖 Configura WhatsApp (se usi Twilio)
5. 📱 Condividi l'URL con i clienti!

---

**Congratulazioni! La tua app è online! 🎉**

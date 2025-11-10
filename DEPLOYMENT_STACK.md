# 🚀 STACK DEPLOYMENT CONSIGLIATO (100% GRATUITO)

## Architettura Completa

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  FRONTEND (React)                               │
│  ├─ Hosting: Vercel                            │
│  ├─ URL: https://tua-app.vercel.app            │
│  └─ Deploy: Automatico da GitHub               │
│                                                 │
└───────────────────┬─────────────────────────────┘
                    │ API Calls
                    ↓
┌─────────────────────────────────────────────────┐
│                                                 │
│  BACKEND (FastAPI)                              │
│  ├─ Hosting: Render.com                        │
│  ├─ URL: https://backend.onrender.com          │
│  └─ Deploy: Automatico da GitHub               │
│                                                 │
└───────────────────┬─────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
        ↓                       ↓
┌──────────────┐       ┌──────────────┐
│              │       │              │
│  WHATSAPP    │       │  DATABASE    │
│  SERVICE     │       │  MongoDB     │
│              │       │              │
│  Render.com  │       │  Atlas       │
│              │       │  (512MB)     │
└──────────────┘       └──────────────┘
```

## STEP-BY-STEP COMPLETO

### 1️⃣ Database (MongoDB Atlas)
✅ Già configurato
- URL: Usa quello attuale dal tuo .env

### 2️⃣ Backend (Render.com)
1. Vai su render.com
2. New → Web Service
3. Connect GitHub repo
4. Root Directory: `backend`
5. Build: `pip install -r requirements.txt`
6. Start: `uvicorn server:app --host 0.0.0.0 --port $PORT`
7. Environment Variables:
   ```
   MONGO_URL=tuo_mongo_atlas_url
   DB_NAME=real_estate_bot
   EMERGENT_LLM_KEY=tua_chiave
   CORS_ORIGINS=*
   BOT_NAME=Emma
   BOT_AGENCY_NAME=Tempocasa
   PRIMARY_COLOR=#3b82f6
   SECONDARY_COLOR=#10b981
   ACCENT_COLOR=#f59e0b
   LOGO_URL=
   ```
8. Create Web Service
9. ⏳ Attendi 5-10 min
10. 📝 Copia URL: `https://xxx.onrender.com`

### 3️⃣ WhatsApp Service (Render.com)
1. New → Web Service (stesso account Render)
2. Connect stesso repo
3. Root Directory: `whatsapp-service`
4. Build: `npm install`
5. Start: `node whatsapp-service.js`
6. Environment Variables:
   ```
   BACKEND_URL=https://xxx.onrender.com
   TWILIO_ACCOUNT_SID=tuo_sid
   TWILIO_AUTH_TOKEN=tuo_token
   TWILIO_PHONE_NUMBER=whatsapp:+14155238886
   PORT=10000
   ```
7. Create Web Service

### 4️⃣ Frontend (Vercel)
1. Vai su vercel.com
2. Import Project
3. Connect GitHub repo
4. Root Directory: `frontend`
5. Framework: Create React App
6. Environment Variable:
   ```
   REACT_APP_BACKEND_URL=https://xxx.onrender.com
   ```
7. Deploy!
8. 🎉 App live in ~2 minuti!

## ⚠️ IMPORTANTE: Render Free Tier

Il servizio gratuito Render **dorme dopo 15 minuti di inattività**.

### Soluzione: UptimeRobot (Ping automatico)
1. Vai su [uptimerobot.com](https://uptimerobot.com)
2. Registrati (gratuito)
3. Add New Monitor
   - Type: HTTP(s)
   - URL: `https://tuo-backend.onrender.com/api/`
   - Interval: 5 minuti
4. Il servizio rimarrà sempre attivo!

## 💰 COSTI TOTALI

| Servizio | Piano | Costo |
|----------|-------|-------|
| Vercel | Hobby | **€0/mese** |
| Render | Free | **€0/mese** |
| MongoDB Atlas | Free (512MB) | **€0/mese** |
| UptimeRobot | Free | **€0/mese** |
| **TOTALE** | | **€0/mese** ✅ |

## 🔄 Auto-Deploy

Ogni volta che fai push su GitHub:
- ✅ Vercel rideploya frontend automaticamente
- ✅ Render rideploya backend automaticamente
- ✅ Tutto aggiornato in 2-5 minuti!

## 📊 Monitoraggio

- **Render:** Dashboard → Logs in tempo reale
- **Vercel:** Dashboard → Analytics + Logs
- **UptimeRobot:** Email se servizio va down

## 🚀 Performance

- Frontend: ⚡ <1s (CDN Vercel)
- Backend: 🐢 ~30s primo avvio (cold start Render)
- Dopo avvio: ⚡ <100ms

## 🔒 Sicurezza

- ✅ HTTPS automatico su tutto
- ✅ Environment variables protette
- ✅ CORS configurabile

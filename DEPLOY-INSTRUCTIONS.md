# 📦 Istruzioni Deploy - Tempocasa Tarquinia Pro

## 🌐 Sito Pubblico → Vercel

### Quick Start:
1. **Salva su GitHub**: Usa il pulsante "Save to GitHub" nella chat di Emergent
2. **Deploy su Vercel**:
   - Vai su [vercel.com](https://vercel.com)
   - Login con GitHub
   - Import repository
   - **Root Directory**: `public-website`
   - **Environment Variables**:
     - `REACT_APP_BACKEND_URL` = `https://agent-dashboard-82.preview.emergentagent.com`
     - `REACT_APP_TELEGRAM_BOT` = `tempocasa_elettra_bot`
     - `REACT_APP_LOGO_URL` = `https://res.cloudinary.com/dywaykio8/image/upload/v1763064056/logos/logo_b0342083.png`

📖 **Guida completa**: Vedi `public-website/README-VERCEL-DEPLOY.md`

---

## 💼 Dashboard Admin → Vercel/Netlify

### Quick Start:
1. **Salva su GitHub**
2. **Deploy**:
   - Root Directory: `frontend`
   - Build Command: `yarn build`
   - Environment Variables:
     - `REACT_APP_BACKEND_URL` = `[tuo-backend-url]`

---

## 🔧 Backend API → Render/Railway/Heroku

### Quick Start:
1. **Salva su GitHub**
2. **Deploy su Render**:
   - Vai su [render.com](https://render.com)
   - New Web Service
   - Connect repository
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn server:app --host 0.0.0.0 --port $PORT`
   - **Environment Variables**:
     - `MONGO_URL` = `[tuo-mongodb-atlas-url]`
     - `TELEGRAM_BOT_TOKEN` = `[tuo-bot-token]`
     - `TELEGRAM_ADMIN_ID` = `[tuo-telegram-id]`

---

## 📱 App Mobile → Expo EAS

### Quick Start:
1. **Installa EAS CLI**: `npm install -g eas-cli`
2. **Login**: `eas login`
3. **Build Android**: `cd mobile && eas build -p android`
4. **Build iOS**: `eas build -p ios`
5. **Submit**: `eas submit -p android` o `eas submit -p ios`

📖 **Documentazione Expo**: https://docs.expo.dev/build/introduction/

---

## 🗄️ Database → MongoDB Atlas (Gratuito)

1. Vai su [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Crea account gratuito
3. Crea cluster M0 (Free)
4. Crea database user
5. Whitelist IP: `0.0.0.0/0` (per accesso globale)
6. Ottieni connection string
7. Usa nel backend come `MONGO_URL`

---

## 🎯 Architettura Deploy Consigliata

```
┌─────────────────┐
│   Utenti Web    │
└────────┬────────┘
         │
    ┌────▼────┐
    │ Vercel  │ (Sito Pubblico)
    └────┬────┘
         │
    ┌────▼────┐
    │ Vercel  │ (Dashboard Admin)
    └────┬────┘
         │
    ┌────▼────┐
    │ Render  │ (Backend API)
    └────┬────┘
         │
    ┌────▼────┐
    │ MongoDB │ (Database)
    │  Atlas  │
    └─────────┘

┌─────────────────┐
│  Utenti Mobile  │
└────────┬────────┘
         │
    ┌────▼────┐
    │   Expo  │ (App React Native)
    │   EAS   │
    └─────────┘
```

---

## ✅ Checklist Pre-Deploy

- [ ] Codice salvato su GitHub
- [ ] Variabili d'ambiente configurate
- [ ] MongoDB Atlas configurato
- [ ] Backend deployato e testato
- [ ] Frontend deployato e testato
- [ ] Sito pubblico deployato e testato
- [ ] App mobile testata su Expo Go
- [ ] Domini personalizzati configurati (opzionale)
- [ ] SSL/HTTPS attivo
- [ ] CORS configurato correttamente

---

## 🆘 Link Utili

- **Vercel Docs**: https://vercel.com/docs
- **Render Docs**: https://render.com/docs
- **MongoDB Atlas**: https://www.mongodb.com/docs/atlas/
- **Expo Docs**: https://docs.expo.dev/
- **FastAPI Docs**: https://fastapi.tiangolo.com/

---

**Nota**: Tutti i servizi consigliati hanno tier gratuiti sufficienti per iniziare!

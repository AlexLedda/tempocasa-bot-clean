# 🎨 GUIDA: Deploy su Render.com

## STEP 1: Setup Account
1. Vai su [render.com](https://render.com)
2. "Get Started for Free"
3. Login con GitHub

## STEP 2: Deploy Backend FastAPI

1. **New** → **Web Service**
2. **Connect repository** → seleziona il tuo repo
3. **Configurazione:**
   - Name: `real-estate-backend`
   - Region: Frankfurt (o più vicino)
   - Root Directory: `backend`
   - Runtime: Python 3
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn server:app --host 0.0.0.0 --port $PORT`
4. **Plan:** Free
5. **Environment Variables:**
   ```
   MONGO_URL=mongodb+srv://...
   DB_NAME=real_estate_bot
   EMERGENT_LLM_KEY=xxx
   CORS_ORIGINS=*
   ```
6. **Create Web Service**

## STEP 3: Deploy WhatsApp Service

1. **New** → **Web Service**
2. **Connect repository** → stesso repo
3. **Configurazione:**
   - Name: `whatsapp-service`
   - Root Directory: `whatsapp-service`
   - Runtime: Node
   - Build Command: `npm install`
   - Start Command: `node whatsapp-service.js`
4. **Environment Variables:**
   ```
   BACKEND_URL=https://real-estate-backend.onrender.com
   TWILIO_ACCOUNT_SID=xxx
   TWILIO_AUTH_TOKEN=xxx
   TWILIO_PHONE_NUMBER=xxx
   ```
5. **Create Web Service**

## Note Importanti:
- ⚠️ Il servizio gratuito dorme dopo 15 min
- 🔄 Per mantenerlo attivo: usa un servizio di "ping" (UptimeRobot)
- 📊 Monitor da Dashboard → Metrics

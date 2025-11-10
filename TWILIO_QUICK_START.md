# ⚡ GUIDA RAPIDA: Twilio WhatsApp (10 minuti)

## 🎯 SETUP VELOCE

### 1️⃣ TWILIO (3 minuti)
1. Vai su https://www.twilio.com/try-twilio
2. Sign up (email + verifica telefono)
3. Dashboard → Copia:
   - Account SID
   - Auth Token
4. Messaging → WhatsApp Sandbox:
   - Numero: `whatsapp:+14155238886`
   - Dal tuo WhatsApp, manda `join [codice]` a +1 415 523 8886

### 2️⃣ RENDER BACKEND (2 minuti)
1. Render → `real-estate-backend` → Settings → Environment Variables
2. Aggiungi:
   ```
   TWILIO_ACCOUNT_SID = ACxxxxxxxxx
   TWILIO_AUTH_TOKEN = abc123xyz
   TWILIO_PHONE_NUMBER = whatsapp:+14155238886
   ```
3. Save (rideploya automatico)

### 3️⃣ RENDER WHATSAPP SERVICE (3 minuti)
1. Render → New + → Web Service
2. Repository: `real-estate-whatsapp-bot`
3. Config:
   - Name: `whatsapp-service`
   - Root Directory: `whatsapp-service`
   - Build: `npm install`
   - Start: `node whatsapp-twilio.js`
   - Instance: Free
4. Environment Variables:
   ```
   BACKEND_URL = https://real-estate-bot-v2-0.onrender.com
   TWILIO_ACCOUNT_SID = ACxxxxxxxxx
   TWILIO_AUTH_TOKEN = abc123xyz
   TWILIO_PHONE_NUMBER = whatsapp:+14155238886
   PORT = 10000
   ```
5. Create Web Service

### 4️⃣ TWILIO WEBHOOK (1 minuto)
1. Twilio → Messaging → WhatsApp sandbox settings
2. When a message comes in:
   - URL: `https://real-estate-bot-v2-0.onrender.com/api/whatsapp/webhook`
   - Method: POST
3. Save

### 5️⃣ PUSH GITHUB (1 minuto)
1. Emergent → "Save to GitHub"
2. Push!

---

## 🧪 TEST

**WhatsApp:**
1. Apri WhatsApp
2. Chat con +1 415 523 8886
3. Scrivi: "Ciao, cerco casa"
4. ✅ Dovresti ricevere risposta da Emma!

**cURL:**
```bash
curl -X POST https://real-estate-bot-v2-0.onrender.com/api/whatsapp/webhook \
  -H "Content-Type: application/json" \
  -d '{"phone_number":"+393331234567","message":"Ciao","timestamp":1699999999}'
```

---

## 💰 COSTI
- Twilio Trial: **$15 gratis** (~3.000 messaggi)
- WhatsApp Service Render: **€0/mese**
- **TOTALE: €0 per iniziare**

---

## 🆘 PROBLEMI?

**Bot non risponde:**
- Hai fatto "join" al sandbox?
- Variabili Twilio su Render corrette?
- Backend è "Live" su Render?
- Controlla logs backend su Render

**Webhook error:**
- URL webhook corretto su Twilio?
- Backend accessibile pubblicamente?

---

## ✅ CHECKLIST
- [ ] Twilio account
- [ ] Join sandbox WhatsApp
- [ ] Variabili su Render backend
- [ ] WhatsApp service deployed
- [ ] Webhook configurato
- [ ] Test funziona
- [ ] 🎉 FATTO!

# 🚂 GUIDA COMPLETA: Deploy Bot WhatsApp su Railway

## 📋 COSA ABBIAMO PREPARATO

Tutti i file necessari sono pronti in `/app/railway-deploy/`:
- ✅ `package.json` - Dipendenze Node.js
- ✅ `whatsapp-service.js` - Bot ottimizzato per Railway
- ✅ `Dockerfile` - Container configuration
- ✅ `railway.json` - Railway configuration
- ✅ `.env.example` - Variabili ambiente

---

## 🎬 PASSO 1: Crea Account Railway

### 1.1 Vai su Railway
Apri browser e vai su:
```
https://railway.app/
```

### 1.2 Sign Up
- Click **"Login"** (in alto a destra)
- Scegli **"Login with GitHub"**
- Autorizza Railway ad accedere a GitHub
- ✅ Account creato!

---

## 📁 PASSO 2: Crea Repository GitHub

### 2.1 Vai su GitHub
```
https://github.com/new
```

### 2.2 Crea Nuovo Repo
- **Repository name**: `whatsapp-real-estate-bot`
- **Description**: "Bot WhatsApp per Agenzia Immobiliare"
- **Visibilità**: Private (consigliato)
- ✅ **NON** aggiungere README, .gitignore, license
- Click **"Create repository"**

### 2.3 Prendi nota del URL
Vedrai qualcosa come:
```
https://github.com/tuo-username/whatsapp-real-estate-bot
```

---

## 📤 PASSO 3: Carica i File su GitHub

### Opzione A: Da Terminale (Consigliato)

Apri Terminale/Prompt e esegui:

```bash
# Scarica i file dal server Emergent sul tuo computer
# (Ti fornirò i comandi dopo)

# Vai nella cartella
cd ~/Desktop
mkdir whatsapp-railway
cd whatsapp-railway

# Crea i file (copia da /app/railway-deploy/)
# Ti darò i contenuti da copiare

# Inizializza Git
git init
git add .
git commit -m "Initial commit: WhatsApp Bot per Railway"

# Collega al tuo repo GitHub
git remote add origin https://github.com/TUO-USERNAME/whatsapp-real-estate-bot.git

# Push
git branch -M main
git push -u origin main
```

### Opzione B: Caricamento Web (Più Facile)

1. Vai sul tuo repository GitHub
2. Click **"uploading an existing file"**
3. Trascina tutti i file da `/app/railway-deploy/`
4. Click **"Commit changes"**

---

## 🚂 PASSO 4: Deploy su Railway

### 4.1 Crea Nuovo Progetto
1. Torna su https://railway.app/dashboard
2. Click **"New Project"**
3. Scegli **"Deploy from GitHub repo"**

### 4.2 Seleziona Repository
1. Cerca `whatsapp-real-estate-bot`
2. Click sul repository
3. Railway inizia il deploy automaticamente!

### 4.3 Aspetta il Deploy
Vedrai:
```
Building... ⏳
Deploying... ⏳
Live! ✅
```

Ci vogliono 2-3 minuti.

---

## 🔧 PASSO 5: Configura Variabili Ambiente

### 5.1 Apri Settings
1. Nel progetto Railway, click su **Settings** (icona ingranaggio)
2. Scroll fino a **"Variables"**

### 5.2 Aggiungi Variabili
Click **"+ New Variable"** e aggiungi:

**Variable 1:**
- Name: `FASTAPI_URL`
- Value: `https://rebot-tarquinia.preview.emergentagent.com`

**Variable 2:**
- Name: `PORT`
- Value: `3001`

Click **"Add"** per ognuna

### 5.3 Rideploy
Railway rideploya automaticamente dopo aver aggiunto variabili.

---

## 🌍 PASSO 6: Ottieni URL Pubblico

### 6.1 Genera Domain
1. Nel progetto, vai su **Settings**
2. Sezione **"Networking"**
3. Click **"Generate Domain"**
4. Railway ti dà un URL tipo:
   ```
   https://whatsapp-bot-production-xxxx.up.railway.app
   ```

### 6.2 Salva URL
Copia questo URL! Ne avrai bisogno.

---

## 📱 PASSO 7: Scansiona QR Code

### 7.1 Vai su Logs
1. Nel progetto Railway, click **"Deployments"**
2. Click sull'ultimo deployment (con ✅)
3. Click **"View Logs"**

### 7.2 Trova QR Code
Nei logs vedrai:
```
====================================
   QR CODE GENERATO!
====================================
Vai su: http://localhost:3001/qr
Oppure scansiona dal terminale:
====================================

█████████████████████████████
█████████████████████████████
███ ▄▄▄▄▄ █ ▀ █▀▀█ ▄▄▄▄▄ ███
███ █   █ █▀▀▀ ▀▄▀█ █   █ ███
...
```

### 7.3 Opzione 1: Scansiona da Logs
1. Usa il QR che vedi nei logs
2. Apri WhatsApp sul telefono
3. Scansiona direttamente

### 7.4 Opzione 2: Vai su Browser
1. Apri: `https://tuo-railway-url.railway.app/qr`
2. Vedrai un QR grande e bello
3. Scansiona dal telefono

### 7.5 Come Scansionare
**Su iPhone:**
- WhatsApp → Impostazioni → Dispositivi collegati → Collega

**Su Android:**
- WhatsApp → Menu (⋮) → Dispositivi collegati → Collega

✅ **Scansiona il QR code**

---

## ✅ PASSO 8: Verifica Funzionamento

### 8.1 Controlla Connessione
Nei logs Railway vedrai:
```
✅ WhatsApp connesso con successo!
📡 Backend: https://rebot-tarquinia.preview.emergentagent.com
```

### 8.2 Testa il Bot
1. Invia messaggio WhatsApp al numero connesso
2. Scrivi: "Ciao"
3. Il bot dovrebbe rispondere! 🎉

### 8.3 Verifica Dashboard
1. Vai su: https://rebot-tarquinia.preview.emergentagent.com
2. Sezione **Messaggi**
3. Dovresti vedere il messaggio e la risposta!

---

## 📊 GESTIONE RAILWAY

### Vedere Logs
```
Dashboard → Progetto → Deployments → View Logs
```

### Riavviare Bot
```
Dashboard → Progetto → Settings → Restart
```

### Verificare Stato
Vai su: `https://tuo-url.railway.app/status`

Vedrai:
```json
{
  "connected": true,
  "status": "connected",
  "user": {
    "id": "393xxxxxx",
    "name": "Tuo Nome"
  },
  "backend": "https://rebot-tarquinia.preview.emergentagent.com",
  "hasQR": false
}
```

---

## 💰 COSTI RAILWAY

### Piano Gratuito
- ✅ 500 ore/mese
- ✅ $5 di credito gratuito
- ✅ 21 giorni continui circa

### Dopo Piano Gratuito
- 💵 $5/mese per 100 ore
- 💵 $0.000231/minuto (~$10/mese per 24/7)

### Calcolo:
- **21 giorni gratis** → Poi paghi
- Se tieni attivo 24/7 dopo: ~$10/mese
- Alternativa: VPS Hetzner €4.51/mese

---

## 🔧 CONFIGURAZIONE AVANZATA

### Aggiungere Volume Persistente

Per salvare sessione WhatsApp permanentemente:

1. **Settings → Volumes**
2. **Add Volume**
3. **Mount Path**: `/app/auth_info`
4. Questo salva la sessione anche se rideploy!

---

## 🆘 RISOLUZIONE PROBLEMI

### Build Failed
**Problema**: Deploy fallisce durante build
**Soluzione**:
1. Controlla logs per errore specifico
2. Verifica tutti i file siano presenti
3. Rideploy: Settings → Redeploy

### QR Code Non Appare
**Problema**: Logs non mostrano QR
**Soluzione**:
1. Aspetta 30-60 secondi
2. Vai su `/qr` nel browser
3. Refresh logs

### Bot Non Risponde
**Problema**: Scansionato QR ma non risponde
**Soluzione**:
1. Verifica connessione: `/status`
2. Controlla logs per errori
3. Verifica FASTAPI_URL sia corretto

### "Connection Failure"
**Problema**: WhatsApp si disconnette continuamente
**Soluzione**:
1. Aggiungi Volume persistente (vedi sopra)
2. Railway potrebbe avere IP problematici
3. Considera VPS come alternativa

---

## 📈 MONITORING

### Vedere Uso Risorse
```
Dashboard → Progetto → Metrics
```

Monitora:
- CPU Usage
- Memory Usage
- Network Traffic
- Uptime

### Alerts
Puoi configurare alert quando:
- Bot si disconnette
- Errori nei logs
- Uso risorse alto

---

## 🎯 CHECKLIST COMPLETA

- [ ] Account Railway creato
- [ ] Repository GitHub creato
- [ ] File caricati su GitHub
- [ ] Progetto Railway creato
- [ ] Deploy completato con successo
- [ ] Variabili ambiente configurate
- [ ] Domain pubblico generato
- [ ] QR code scansionato
- [ ] Bot connesso (logs confermano)
- [ ] Test messaggio inviato
- [ ] Bot ha risposto correttamente
- [ ] Dashboard mostra conversazione
- [ ] Volume persistente aggiunto (opzionale)

---

## 🎉 COMPLETATO!

Se hai fatto tutti i passi, ora hai:
✅ Bot WhatsApp online 24/7
✅ Accessibile da Internet
✅ Logs visibili in tempo reale
✅ 21 giorni gratis (~500 ore)

**Prossimo passo:** Testa con clienti reali! 🚀

---

## 📞 SUPPORTO

Problemi? Fammi sapere quale passo non funziona e ti aiuto!

# 📦 File Pronti per Railway Deploy

Tutti i file sono nella cartella: `/app/railway-deploy/`

## 📁 Struttura File

```
railway-deploy/
├── package.json              # Dipendenze Node.js
├── whatsapp-service.js       # Bot principale
├── Dockerfile                # Container configuration
├── railway.json              # Railway settings
├── .dockerignore            # File da ignorare
└── .env.example             # Esempio variabili ambiente
```

## 🚀 QUICK START

### Metodo 1: Upload Diretto su GitHub (FACILE)

1. **Crea Repository GitHub**:
   - Vai su https://github.com/new
   - Nome: `whatsapp-real-estate-bot`
   - Visibility: Private
   - Click "Create repository"

2. **Carica i File**:
   - Clicca "uploading an existing file"
   - Scarica e carica tutti i file da `/app/railway-deploy/`
   - Commit changes

3. **Deploy su Railway**:
   - Vai su https://railway.app/
   - "New Project" → "Deploy from GitHub repo"
   - Seleziona il tuo repository
   - ✅ Deploy automatico!

### Metodo 2: Git da Terminale

```bash
# Scarica i file (ti fornirò i link)
cd ~/Desktop
mkdir whatsapp-railway
cd whatsapp-railway

# Copia i 6 file qui dentro

# Git init e push
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/TUO-USERNAME/whatsapp-real-estate-bot.git
git branch -M main
git push -u origin main
```

## 📋 Checklist File

Assicurati di avere tutti questi file:

- [ ] `package.json` (dipendenze)
- [ ] `whatsapp-service.js` (bot principale) 
- [ ] `Dockerfile` (containerizzazione)
- [ ] `railway.json` (config Railway)
- [ ] `.dockerignore` (file da ignorare)
- [ ] `.env.example` (esempio env vars)

## 🔧 Dopo il Deploy

### Configura Variabili Ambiente su Railway:

**FASTAPI_URL**:
```
https://agent-dashboard-82.preview.emergentagent.com
```

**PORT**:
```
3001
```

### Genera Domain Pubblico:
Settings → Networking → Generate Domain

### Vedi QR Code:
1. Logs → Cerca il QR nel terminale
2. Oppure vai su: `https://tuo-url.railway.app/qr`

## 🎯 Endpoint Disponibili

Dopo deploy, avrai questi URL:

- `/` - Homepage con stato bot
- `/qr` - Visualizza QR code per scansione
- `/status` - JSON con stato connessione
- `/logs` - Ultimi 50 log entries

## ⏱️ Tempo Stimato

- Setup GitHub: 2 minuti
- Upload file: 1 minuto
- Deploy Railway: 3 minuti
- Config variabili: 1 minuto
- Scansione QR: 1 minuto

**Totale: ~8 minuti** 🚀

## 💰 Costi

**Prime 500 ore**: GRATIS
**Dopo**: ~$5-10/mese per 24/7

## 📚 Guide Complete

Leggi le guide per dettagli completi:
- `/app/GUIDA_RAILWAY_COMPLETA.md` - Step-by-step completo

## 🆘 Serve Aiuto?

Fammi sapere a che punto sei e ti guido! 😊

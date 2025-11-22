# Vercel Deploy - Frontend React

## 🎯 Build Settings per Vercel

**Framework Preset:** Create React App
**Build Command:** `yarn build`
**Output Directory:** `build`
**Install Command:** `yarn install`
**Node Version:** 18.x

---

## 📁 Files Preparati

✅ `/app/frontend/vercel.json` - Configurazione Vercel
✅ `/app/frontend/package.json` - Dipendenze
✅ `/app/frontend/.env` - Variabile backend URL

---

## 🚀 Guida Deploy su Vercel - Passo per Passo

### **Step 1: Carica il Frontend su GitHub**

#### Opzione A: Nuovo Repository

```bash
# Vai nella cartella frontend
cd /app/frontend

# Inizializza git (se non già fatto)
git init

# Aggiungi i file
git add .

# Commit
git commit -m "Initial commit - Frontend Real Estate Bot"

# Collega a GitHub (sostituisci con il tuo repository)
git remote add origin https://github.com/TUO-USERNAME/real-estate-frontend.git

# Push
git branch -M main
git push -u origin main
```

#### Opzione B: Aggiungi al Repository Esistente

Se hai già un repository con il bot WhatsApp:
```bash
cd /app
git add frontend/
git commit -m "Add frontend for Vercel deployment"
git push
```

---

### **Step 2: Deploy su Vercel**

1. **Vai su Vercel:**
   - Apri https://vercel.com
   - Click **"Sign Up"** o **"Login"** (puoi usare GitHub)

2. **Importa il Progetto:**
   - Click su **"Add New..."** → **"Project"**
   - Click su **"Import Git Repository"**
   - Seleziona il tuo repository GitHub
   - Se hai tutto in un repo: Seleziona **"frontend"** come Root Directory

3. **Configura il Progetto:**
   
   **Framework Preset:** Create React App (auto-rilevato)
   
   **Root Directory:** 
   - Se repo separato: `./`
   - Se monorepo: `frontend`
   
   **Build Settings:**
   - Build Command: `yarn build`
   - Output Directory: `build`
   - Install Command: `yarn install`

4. **Variabili d'Ambiente:**
   
   Click su **"Environment Variables"** e aggiungi:
   
   | Name | Value |
   |------|-------|
   | `REACT_APP_BACKEND_URL` | `https://whatsapp-realty-1.preview.emergentagent.com` |

5. **Deploy:**
   - Click **"Deploy"**
   - Aspetta 2-3 minuti (Vercel installerà dipendenze e farà il build)
   - 🎉 Il tuo frontend sarà live!

---

### **Step 3: Ottieni l'URL del Frontend**

Dopo il deploy, Vercel ti darà un URL tipo:
```
https://real-estate-bot.vercel.app
```

O puoi usare un dominio custom se ne hai uno.

---

### **Step 4: Testa il Frontend**

1. Apri l'URL Vercel nel browser
2. Dovresti vedere la dashboard del bot
3. Verifica che:
   - ✅ Dashboard si carica
   - ✅ Proprietà visualizzate
   - ✅ Messaggi funzionanti
   - ✅ Clienti visualizzati
   - ✅ Impostazioni bot funzionanti

---

## 🔄 Deploy Automatici

Vercel è ora collegato al tuo repository GitHub:

- **Push su GitHub** → **Deploy automatico su Vercel**
- Ogni commit farà un nuovo deploy automaticamente
- Vercel crea anche preview per i branch

---

## ⚙️ Configurazione Avanzata (Opzionale)

### Dominio Custom

1. Vai su Vercel → Il tuo progetto
2. Settings → Domains
3. Aggiungi il tuo dominio
4. Segui le istruzioni per configurare DNS

### Variabili d'Ambiente Multiple

Se hai ambienti diversi (dev, staging, production):
1. Vercel → Settings → Environment Variables
2. Aggiungi variabili per Production, Preview, Development

---

## 🐛 Troubleshooting

### Build Fallisce

**Errore:** `Module not found`
- Soluzione: Verifica che tutte le dipendenze siano in `package.json`
- Run locale: `yarn install && yarn build`

**Errore:** `CRACO not found`
- Soluzione: Già incluso in `devDependencies`, dovrebbe funzionare

### Pagina Bianca

**Problema:** Frontend caricato ma bianco
- Controlla la console browser (F12)
- Verifica `REACT_APP_BACKEND_URL` nelle environment variables
- Controlla che il backend sia raggiungibile

### CORS Errors

**Problema:** Errori CORS dal backend
- Verifica che il backend abbia `CORS_ORIGINS="*"` in `.env`
- Oppure aggiungi specificamente l'URL Vercel

---

## 📊 Monitoring

Vercel offre:
- Analytics gratuiti
- Log delle build
- Log runtime
- Performance monitoring

Accedi dalla dashboard Vercel → Il tuo progetto → Analytics

---

## ✅ Checklist Finale

Prima del deploy:
- [ ] Frontend su GitHub
- [ ] Account Vercel creato
- [ ] Repository importato
- [ ] Root directory corretta (se monorepo)
- [ ] Environment variable `REACT_APP_BACKEND_URL` configurata
- [ ] Build completata con successo
- [ ] URL Vercel funzionante
- [ ] Dashboard accessibile
- [ ] API backend raggiungibile

---

## 🎉 Risultato Finale

Dopo il deploy avrai:

```
📱 Frontend React → https://tuo-bot.vercel.app
🔧 Backend FastAPI → https://whatsapp-realty-1.preview.emergentagent.com
💬 Bot WhatsApp → https://whatsapp-real-estate-bot-production-ab46.up.railway.app
🗄️ MongoDB → Emergent (interno)
```

Tutto connesso e funzionante! 🚀

---

**Hai bisogno di aiuto durante il deploy? Fammi sapere a che punto sei e ti guido!**

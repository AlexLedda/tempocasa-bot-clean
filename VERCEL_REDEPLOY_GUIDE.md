# 🔄 GUIDA: Redeploy Manuale su Vercel

## 🎯 QUANDO USARE

Quando Vercel non fa auto-deploy dopo push GitHub.

Errore tipico: "Deployment request did not have a git author with contributing access"

---

## 📋 PROCEDURA STEP-BY-STEP

### STEP 1: Apri Vercel Dashboard

1. Vai su: **https://vercel.com/dashboard**
2. Login (se necessario)

### STEP 2: Seleziona Progetto

1. Cerca il progetto: **`real-estate-bot-v2-0`** (o nome simile)
2. **Clicca** sul progetto

### STEP 3: Vai su Deployments

1. Clicca su tab **"Deployments"** (in alto)
2. Vedrai lista di tutti i deployment

### STEP 4: Redeploy Ultimo

1. **Trova l'ultimo deployment** (in cima alla lista)
2. **Clicca sui tre puntini** `...` a destra
3. **Seleziona "Redeploy"**
4. **NON** selezionare "Use existing Build Cache"
5. **Clicca "Redeploy"** per confermare

### STEP 5: Attendi Build

Vedrai:
```
🔄 Building...
⏱️ Est. time: 2m 30s
```

Attendi che diventi:
```
✅ Ready
🌐 Visit
```

### STEP 6: Verifica

1. **Clicca "Visit"** per aprire il sito
2. Oppure vai su: `https://real-estate-bot-v2-0.vercel.app`
3. ✅ Dovresti vedere l'app aggiornata!

---

## 🧪 TEST

### Verifica che l'update sia andato:

1. **Vai su Immobili**
2. **"+ Nuovo Immobile"**
3. **Cerca la sezione Immagini**
4. ✅ **Dovresti vedere bottone "📤 Carica dal PC"**

Se lo vedi = Deployment riuscito! 🎉

---

## ⚠️ SE VEDI ANCORA ERRORI

### Problema: Build Failed

**Causa:** Errori nel codice o dipendenze mancanti

**Fix:**
1. Vercel → Deployment → Clicca su quello failed
2. Leggi **"Build Logs"**
3. Cerca errore in rosso
4. Copia errore e chiedi aiuto

### Problema: Environment Variables Missing

**Causa:** Manca `REACT_APP_BACKEND_URL`

**Fix:**
1. Vercel → Progetto → **Settings**
2. **Environment Variables**
3. Aggiungi:
   ```
   REACT_APP_BACKEND_URL = https://real-estate-bot-v2-0.onrender.com
   ```
4. **Save**
5. **Redeploy** (Step 1-6 sopra)

---

## 🔄 AUTO-DEPLOY FUTURO

Se vuoi che Vercel faccia auto-deploy ai prossimi push:

### Fix Permessi:

1. **GitHub** → Settings → Applications
2. **Vercel** → Update permissions
3. Grant access al repository

Poi:

4. **Vercel** → Progetto → Settings → **Git**
5. Verifica che repository sia connesso
6. ✅ Prossimi push = auto-deploy!

---

## 💡 ALTERNATIVE

### Se Redeploy Manuale non funziona:

#### Opzione A: Delete & Reimport
1. Vercel → Progetto → Settings
2. Delete Project (in fondo)
3. Dashboard → New Project
4. Import da GitHub
5. Deploy

#### Opzione B: Usa Vercel CLI
```bash
npm i -g vercel
vercel login
cd frontend
vercel --prod
```

---

## ✅ CHECKLIST

- [ ] Aperto Vercel Dashboard
- [ ] Progetto selezionato
- [ ] Tab "Deployments" aperto
- [ ] Cliccato "..." → "Redeploy"
- [ ] Atteso build (2-3 min)
- [ ] Status: "Ready" ✅
- [ ] Visitato sito
- [ ] Verificato update (bottone upload)
- [ ] 🎉 FUNZIONA!

---

**Tempo totale: 3-5 minuti**

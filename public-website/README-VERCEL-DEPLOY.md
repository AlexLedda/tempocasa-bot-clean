# 🚀 Deploy Sito Pubblico Tempocasa Tarquinia su Vercel

## Passo 1: Salva il Progetto su GitHub

1. Nella chat di Emergent, clicca sul pulsante **"Save to GitHub"**
2. Seleziona il repository o creane uno nuovo (es: `tempocasa-tarquinia`)
3. Clicca **"PUSH TO GITHUB"**
4. Attendi la conferma che il push è completato ✓

## Passo 2: Configura il Deploy su Vercel

### A) Crea Account Vercel (se non ce l'hai)
1. Vai su [vercel.com](https://vercel.com)
2. Clicca **"Sign Up"**
3. Scegli **"Continue with GitHub"**
4. Autorizza Vercel ad accedere al tuo GitHub

### B) Crea Nuovo Progetto
1. Dalla dashboard Vercel, clicca **"Add New..."** → **"Project"**
2. Trova il repository `tempocasa-tarquinia` nella lista
3. Clicca **"Import"**

### C) Configura il Progetto
Nella schermata di configurazione:

**Root Directory:**
```
public-website
```
✅ Clicca su "Edit" e seleziona la cartella `public-website`

**Build Settings:**
- Framework Preset: `Create React App`
- Build Command: `yarn build` (già precompilato)
- Output Directory: `build` (già precompilato)
- Install Command: `yarn install` (già precompilato)

**Environment Variables:**
Clicca su **"Environment Variables"** e aggiungi:

| Name | Value |
|------|-------|
| `REACT_APP_BACKEND_URL` | `https://agent-dashboard-82.preview.emergentagent.com` |
| `REACT_APP_TELEGRAM_BOT` | `tempocasa_elettra_bot` |
| `REACT_APP_LOGO_URL` | `https://res.cloudinary.com/dywaykio8/image/upload/v1763064056/logos/logo_b0342083.png` |

### D) Deploy!
1. Clicca **"Deploy"**
2. Attendi 2-3 minuti per la build e il deploy
3. 🎉 Il tuo sito sarà live su un URL tipo `tempocasa-tarquinia.vercel.app`

## Passo 3: Configura Dominio Personalizzato (Opzionale)

1. Dalla dashboard del progetto su Vercel, vai su **"Settings"** → **"Domains"**
2. Aggiungi il tuo dominio personalizzato (es: `www.tempocasa-tarquinia.it`)
3. Segui le istruzioni per configurare i DNS

## Funzionalità del Sito Pubblico

✅ **Homepage** - Hero section, ricerca, immobili in evidenza
✅ **Catalogo Immobili** - Lista con filtri avanzati
✅ **Dettaglio Immobile** - Galleria foto, mappa OpenStreetMap, form contatti
✅ **Valutazione** - Form per richiedere valutazione gratuita
✅ **Contatti** - Mappa, informazioni, form contatto
✅ **Widget Telegram** - Bot Elettra sempre disponibile

## Deploy Automatici

Ogni volta che fai un push su GitHub (branch main/master), Vercel:
- 🔄 Rileva automaticamente i cambiamenti
- 🏗️ Fa la build del sito
- 🚀 Deploy automatico in produzione
- ✉️ Ti invia una notifica con il link

## Troubleshooting

**Problema: Build fallita**
- Verifica che le variabili d'ambiente siano corrette
- Controlla i log della build su Vercel

**Problema: Pagina bianca**
- Controlla che `REACT_APP_BACKEND_URL` sia impostato
- Verifica che il backend sia raggiungibile

**Problema: Immagini non caricate**
- Verifica che `REACT_APP_LOGO_URL` sia corretto
- Controlla la console del browser per errori

## Supporto

- Documentazione Vercel: https://vercel.com/docs
- Supporto Vercel: https://vercel.com/support

---

**Note:** Dopo il deploy, il sito sarà accessibile pubblicamente. Assicurati che tutti i contenuti siano corretti e che il backend API sia configurato per accettare richieste dal nuovo dominio Vercel.

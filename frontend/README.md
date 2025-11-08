# Real Estate Bot - Frontend Dashboard

Dashboard React per la gestione del bot WhatsApp immobiliare con AI.

## 🚀 Deploy su Vercel

**Guida Rapida:** Vedi [VERCEL_GUIDA_RAPIDA.md](../VERCEL_GUIDA_RAPIDA.md)

**Guida Completa:** Vedi [VERCEL_DEPLOY_GUIDE.md](../VERCEL_DEPLOY_GUIDE.md)

### Quick Start

```bash
# Verifica che tutto sia pronto
./check-vercel-ready.sh

# Push su GitHub
git add .
git commit -m "Ready for Vercel"
git push

# Deploy su Vercel
# 1. Vai su vercel.com
# 2. Importa repository
# 3. Configura REACT_APP_BACKEND_URL
# 4. Deploy!
```

## 🛠️ Sviluppo Locale

```bash
# Installa dipendenze
yarn install

# Avvia dev server
yarn start

# Build per produzione
yarn build
```

## ⚙️ Variabili d'Ambiente

Crea un file `.env` basato su `.env.example`:

```env
REACT_APP_BACKEND_URL=https://your-backend-url.com
```

## 📁 Struttura

```
frontend/
├── public/           # File statici
├── src/
│   ├── components/   # Componenti React
│   │   └── ui/       # Componenti UI (shadcn)
│   ├── pages/        # Pagine dell'app
│   │   ├── Dashboard.js
│   │   ├── Properties.js
│   │   ├── Messages.js
│   │   ├── Clients.js
│   │   ├── Valuations.js
│   │   ├── Appointments.js
│   │   ├── BotSettings.js
│   │   └── WhatsAppSetup.js
│   ├── hooks/        # Custom hooks
│   ├── App.js        # Componente principale
│   └── index.js      # Entry point
├── vercel.json       # Configurazione Vercel
├── package.json      # Dipendenze
└── .env.example      # Template variabili d'ambiente
```

## 🎨 Features

- 📊 Dashboard con statistiche
- 🏠 Gestione proprietà immobiliari
- 💬 Visualizzazione conversazioni WhatsApp
- 👥 Gestione clienti
- 📋 Richieste di valutazione
- 📅 Appuntamenti
- ⚙️ Configurazione bot (nome, agenzia, comportamento)
- 🎨 Temi personalizzabili (colore primario)

## 🔧 Tech Stack

- React 19
- React Router v7
- Tailwind CSS
- Shadcn/UI Components
- Axios per API calls
- Lucide React per icone

## 📝 Note

- Il frontend è ottimizzato per Vercel
- Utilizza Create React App con CRACO
- Supporta hot reload in sviluppo
- Build ottimizzato per produzione

## 🐛 Troubleshooting

### Build Fallisce

```bash
# Pulisci cache
rm -rf node_modules yarn.lock
yarn install
yarn build
```

### CORS Errors

Verifica che il backend abbia:
```env
CORS_ORIGINS="*"
```

### Pagina Bianca

1. Controlla console browser (F12)
2. Verifica `REACT_APP_BACKEND_URL` configurato
3. Testa backend separatamente

## 📞 Support

Per problemi o domande, vedi le guide di deploy o contatta il supporto.

---

**Versione:** 1.0.0  
**Last Update:** Novembre 2024

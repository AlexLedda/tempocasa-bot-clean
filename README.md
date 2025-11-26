# TempoCasa Bot

Italiano / English

## Italiano

### Descrizione
TempoCasa Bot è un bot che aiuta i clienti a vedere le case, prendere appuntamenti e fissare una valutazione dell'immobile. Il progetto contiene componenti JavaScript e Python per gestire la logica del bot, integrazioni esterne e utilità.

### Caratteristiche principali
- Gestione appuntamenti per visite alle proprietà
- Prenotazione appuntamenti di valutazione casa
- Comunicazione con i clienti (notifiche, conferme)
- Architettura modulare per facilitare test e manutenzione

### Requisiti
- Node.js >= 18 (o versione compatibile con le dipendenze del progetto)
- Python >= 3.8
- Git
- Docker (opzionale, per containerizzazione)

### Installazione (sviluppo)
1. Clona il repository:

   git clone https://github.com/AlexLedda/tempocasa-bot-clean.git
   cd tempocasa-bot-clean

2. Configura le dipendenze JavaScript:

   cd path/to/js-component-or-root-if-any
   npm install

3. Configura le dipendenze Python (se presenti):

   cd path/to/python-component-or-root-if-any
   python -m venv .venv
   source .venv/bin/activate  # o .\\venv\\Scripts\\activate su Windows
   pip install -r requirements.txt

### Variabili d'ambiente (esempi)
Crea un file .env nella root (o nella directory del servizio) con le variabili necessarie. Esempi: 

- BOT_TOKEN: token del bot (es. Telegram/WhatsApp/Platform)
- API_KEY: chiave per API esterne (opzionale)
- DATABASE_URL: stringa di connessione al database
- NODE_ENV: development|production

Non committare mai file che contengono segreti. Usa GitHub Secrets per le deploy e GitHub Actions.

### Avvio locale (esempio)
Per avviare il servizio Node.js (esempio):

   npm run start

Per eseguire gli script Python (esempio):

   python run_bot.py

Adatta i comandi alle strutture di cartelle effettive del progetto.

### Docker (opzionale)
Aggiungi un Dockerfile e builda l'immagine:

   docker build -t tempocasa-bot .
   docker run --env-file .env -p 3000:3000 tempocasa-bot

### Test & CI
- Aggiungi test unitari per JS (Jest/Mocha) e Python (pytest).
- Aggiungi workflow GitHub Actions per lint, test e build.

### Contribuire
Se vuoi contribuire, aggiungi una branch feature e apri una pull request. Aggiungeremo in futuro un CONTRIBUTING.md con linee guida dettagliate.

### Licenza
Licenza: da definire. Se vuoi una licenza permissiva, considera MIT.

---

## English

### Description
TempoCasa Bot is a bot that helps clients view properties, schedule visits, and book a home valuation appointment. The repository contains JavaScript and Python components to handle bot logic, external integrations and utilities.

### Key features
- Appointment management for property visits
- Home valuation appointment booking
- Customer communication (notifications, confirmations)
- Modular architecture for easier testing and maintenance

### Requirements
- Node.js >= 18
- Python >= 3.8
- Git
- Docker (optional)

### Installation (development)
1. Clone the repo:

   git clone https://github.com/AlexLedda/tempocasa-bot-clean.git
   cd tempocasa-bot-clean

2. Install JavaScript dependencies:

   cd path/to/js-component-or-root-if-any
   npm install

3. Install Python dependencies (if present):

   cd path/to/python-component-or-root-if-any
   python -m venv .venv
   source .venv/bin/activate  # or .\\venv\\Scripts\\activate on Windows
   pip install -r requirements.txt

### Environment variables (examples)
Create a .env file in the root (or service folder) with required variables. Examples:

- BOT_TOKEN: bot token (e.g., Telegram/WhatsApp/Platform)
- API_KEY: key for external APIs (optional)
- DATABASE_URL: database connection string
- NODE_ENV: development|production

Never commit secrets. Use GitHub Secrets for deployments and Actions.

### Run locally (example)
To run the Node.js service (example):

   npm run start

To run Python scripts (example):

   python run_bot.py

Adjust commands to match the repository layout.

### Docker (optional)
Add a Dockerfile and build the image:

   docker build -t tempocasa-bot .
   docker run --env-file .env -p 3000:3000 tempocasa-bot

### Tests & CI
- Add unit tests for JS (Jest/Mocha) and Python (pytest).
- Add GitHub Actions workflows for linting, testing and build.

### Contributing
If you want to contribute, create a feature branch and open a pull request. We will add a CONTRIBUTING.md with guidelines soon.

### License
License: to be defined. Consider MIT for a permissive license.

---

### Contacts / Author
Alex Ledda – https://github.com/AlexLedda

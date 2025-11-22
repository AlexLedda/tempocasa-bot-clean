# 🏠 Bot WhatsApp per Agenzia Immobiliare

Sistema completo per gestione automatica clienti via WhatsApp con AI.

## 🎯 Funzionalità Implementate

### ✅ Backend (FastAPI + MongoDB)
- **Gestione Immobili**: CRUD completo per proprietà
- **Gestione Clienti**: Tracciamento automatico contatti
- **Storico Messaggi**: Tutte le conversazioni salvate
- **Sistema Appuntamenti**: Prenotazione visite immobili
- **AI Integration**: Claude Sonnet 4 per risposte intelligenti
- **WhatsApp Webhook**: Riceve e processa messaggi automaticamente

### ✅ Frontend (React + Tailwind)
- **Dashboard**: Statistiche in tempo reale
- **Gestione Immobili**: Aggiungi/modifica/elimina proprietà
- **Chat WhatsApp**: Visualizza conversazioni clienti
- **Calendario Appuntamenti**: Gestisci visite
- **WhatsApp Setup**: Guida connessione bot

### ✅ Bot WhatsApp (Baileys Node.js)
- **Connessione WhatsApp Web**: Via QR code
- **Risposte AI Automatiche**: Basate su immobili disponibili
- **Riconoscimento Richieste**: Comprende esigenze clienti
- **Suggerimenti Immobili**: Propone proprietà pertinenti

## 📦 Struttura Progetto

```
/app/
├── backend/
│   ├── server.py          # API FastAPI completa
│   ├── .env              # Variabili ambiente (EMERGENT_LLM_KEY)
│   └── requirements.txt   # Dipendenze Python
├── frontend/
│   └── src/
│       ├── App.js         # Layout principale
│       └── pages/         # Pagine dashboard
└── whatsapp-service/     # Servizio Node.js Baileys
    ├── package.json
    ├── whatsapp-service.js
    └── README.md
```

## 🚀 Come Avviare il Bot WhatsApp

### Passo 1: Installare Dipendenze Node.js

```bash
cd /app/whatsapp-service
npm install
```

### Passo 2: Avviare il Servizio

```bash
node whatsapp-service.js
```

### Passo 3: Scansionare QR Code

1. Vedrai un QR code nel terminale
2. Apri WhatsApp sul telefono
3. Vai su: **Impostazioni → Dispositivi collegati → Collega un dispositivo**
4. Scansiona il QR code

### Passo 4: Bot Attivo! 🎉

Il bot risponderà automaticamente ai messaggi usando l'AI.

## 💬 Esempi di Conversazione

**Cliente:** "Ciao! Cerco un appartamento in centro con 3 camere"

**Bot (AI):** "Buongiorno! Abbiamo proprio quello che sta cercando:

**Appartamento Moderno Centro**
- Prezzo: €280,000.00
- Ubicazione: Centro Storico, Milano
- Caratteristiche: 3 camere, 2 bagni, 95 mq

Desidera maggiori informazioni o vorrebbe prenotare una visita?"

---

**Cliente:** "Quali ville avete disponibili?"

**Bot (AI):** "Abbiamo una splendida villa:

**Villa con Giardino**
- Prezzo: €650,000.00
- Ubicazione: Zona Residenziale, Monza
- Caratteristiche: 5 camere, 3 bagni, 280 mq
- Con giardino privato e piscina"

## 🛠️ Gestione Dashboard

### Aggiungere Immobili
1. Vai su **Immobili**
2. Clicca **Aggiungi Immobile**
3. Compila i dettagli e salva

### Visualizzare Messaggi
1. Vai su **Messaggi**
2. Seleziona un cliente
3. Vedi lo storico completo conversazioni

### Gestire Appuntamenti
1. Vai su **Appuntamenti**
2. Filtra per stato (confermato/completato/cancellato)
3. Aggiorna stati appuntamenti

## 🤖 Come Funziona l'AI

L'AI (Claude Sonnet 4) ha accesso a:
- Tutti gli immobili disponibili nel database
- Caratteristiche dettagliate di ogni proprietà
- Storico conversazioni cliente

**Capacità:**
- ✅ Comprende richieste in linguaggio naturale
- ✅ Suggerisce immobili pertinenti
- ✅ Fornisce informazioni dettagliate
- ✅ Cordiale e professionale
- ✅ Guida prenotazione appuntamenti

## 🔑 Credenziali e Setup

### Backend API
- **URL**: https://whatsapp-realty-1.preview.emergentagent.com/api
- **AI Key**: EMERGENT_LLM_KEY (già configurata)
- **Database**: MongoDB locale

### WhatsApp Service
- **Porta**: 3001
- **Auth**: Salvata in `./auth_info` dopo prima scansione

## 📊 Endpoints API Disponibili

```
GET  /api/properties          # Lista immobili
POST /api/properties          # Crea immobile
GET  /api/clients             # Lista clienti
GET  /api/messages            # Storico messaggi
POST /api/appointments        # Prenota appuntamento
POST /api/whatsapp/webhook    # Ricevi messaggio WhatsApp
GET  /api/stats               # Statistiche dashboard
```

## 🎨 Design UI

- **Colori**: Azzurro/Blu oceano (professionale immobiliare)
- **Font**: Space Grotesk (headings) + Inter (body)
- **Stile**: Moderno, pulito, con animazioni smooth
- **Responsive**: Funziona su mobile e desktop

## ⚙️ Tecnologie Utilizzate

- **Backend**: FastAPI, Motor (MongoDB async), Pydantic
- **AI**: Emergent Integrations + Claude Sonnet 4
- **WhatsApp**: Baileys (WhatsApp Web API)
- **Frontend**: React 19, Tailwind CSS, Shadcn UI
- **Database**: MongoDB

## 🔄 Manutenzione

### Riavviare Backend
```bash
sudo supervisorctl restart backend
```

### Riavviare Frontend
```bash
sudo supervisorctl restart frontend
```

### Verificare Logs
```bash
tail -f /var/log/supervisor/backend.*.log
```

## 📝 Note Importanti

1. **Sessione WhatsApp**: Dopo la prima scansione, il bot si riconnetterà automaticamente
2. **Rate Limits**: WhatsApp ha limiti non documentati, monitora per blocchi
3. **Messaggi**: Tutte le conversazioni sono salvate nel database
4. **AI**: Usa EMERGENT_LLM_KEY (chiave universale fornita)

## 🎯 Prossimi Passi

Per attivare completamente il bot:

1. ✅ Aggiungi i tuoi immobili dalla dashboard
2. ✅ Avvia il servizio WhatsApp Node.js
3. ✅ Scansiona il QR code
4. ✅ Testa inviando un messaggio al numero connesso

Il bot inizierà a rispondere automaticamente! 🚀

## 🆘 Supporto

In caso di problemi:
- Verifica che il backend sia attivo
- Controlla che MongoDB sia avviato
- Assicurati che il servizio Node.js sia in esecuzione
- Controlla i logs per errori

---

**Creato con ❤️ usando Emergent AI**

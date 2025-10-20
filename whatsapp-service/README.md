# WhatsApp Bot Service - Baileys

## Installazione

```bash
cd /app/whatsapp-service
npm install
```

## Avvio

```bash
node whatsapp-service.js
```

## Scansione QR Code

1. Avvia il servizio
2. Scansiona il QR code che appare nel terminale con WhatsApp
3. Il bot sarà attivo e risponderà automaticamente

## API Endpoints

- GET /status - Stato connessione
- GET /qr - Ottieni QR code
- POST /send - Invia messaggio

## Note

- Il servizio salva le credenziali in ./auth_info
- Dopo la prima scansione, si riconnetterà automaticamente
- Il bot usa Claude Sonnet 4 per risposte intelligenti

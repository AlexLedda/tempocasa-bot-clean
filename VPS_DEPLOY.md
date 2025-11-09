# 🚀 Deploy WhatsApp Bot su VPS

## Provider Consigliati

### 1. DigitalOcean (Consigliato)
- **Costo**: $6/mese (droplet basic)
- **Setup**: 5 minuti
- **IP Statico**: Incluso
- Link: https://www.digitalocean.com/

### 2. Hetzner Cloud
- **Costo**: €4.5/mese
- **Performance**: Eccellente
- Link: https://www.hetzner.com/cloud

### 3. AWS Lightsail
- **Costo**: $3.50/mese (primo anno gratis)
- Link: https://aws.amazon.com/lightsail/

## Setup Completo VPS

### Passo 1: Crea VPS
```bash
# Sistema: Ubuntu 22.04 LTS
# RAM: 1GB minimo
# Storage: 25GB
```

### Passo 2: Connetti via SSH
```bash
ssh root@your-vps-ip
```

### Passo 3: Installa Node.js
```bash
# Update sistema
apt update && apt upgrade -y

# Installa Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Verifica
node --version
npm --version
```

### Passo 4: Installa PM2 (Process Manager)
```bash
npm install -g pm2
```

### Passo 5: Clona/Crea Servizio WhatsApp
```bash
# Crea directory
mkdir -p /opt/whatsapp-bot
cd /opt/whatsapp-bot

# Copia il file whatsapp-service.js qui
# (usa scp o git)

# Installa dipendenze
npm init -y
npm install @whiskeysockets/baileys express cors axios dotenv qrcode-terminal
```

### Passo 6: Configura .env
```bash
cat > .env << EOF
FASTAPI_URL=https://realtyai-manager.preview.emergentagent.com
PORT=3001
EOF
```

### Passo 7: Avvia con PM2
```bash
pm2 start whatsapp-service.js --name whatsapp-bot
pm2 save
pm2 startup
```

### Passo 8: Scansiona QR Code
```bash
# Visualizza logs e QR code
pm2 logs whatsapp-bot
```

### Passo 9: Configura Firewall
```bash
ufw allow 3001/tcp
ufw allow ssh
ufw enable
```

## Vantaggi VPS

✅ **IP Statico**: WhatsApp non blocca
✅ **24/7 Uptime**: Sempre attivo
✅ **Controllo Completo**: Full access
✅ **Scalabile**: Aggiungi risorse se serve
✅ **Economico**: $3-6/mese

## Architettura Finale

```
┌─────────────┐
│   Cliente   │
│  (WhatsApp) │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  VPS + Baileys  │ ← Scansiona QR code
│  Node.js        │
└────────┬────────┘
         │ HTTP POST
         ▼
┌──────────────────────┐
│  Emergent Backend    │
│  FastAPI + MongoDB   │
│  AI Claude Sonnet 4  │
└──────────────────────┘
         │
         ▼
┌──────────────────────┐
│  Dashboard Web       │
│  React + Tailwind    │
└──────────────────────┘
```

## Comandi Utili PM2

```bash
# Stato servizio
pm2 status

# Logs in tempo reale
pm2 logs whatsapp-bot

# Restart
pm2 restart whatsapp-bot

# Stop
pm2 stop whatsapp-bot

# Rimuovi
pm2 delete whatsapp-bot
```

## Costi Mensili Totali

- VPS: $6/mese
- Emergent: (già hai)
- Total: **$6/mese** per bot WhatsApp completo! 🎉

# 🚀 GUIDA RAPIDA - Avvio Bot WhatsApp

## Come Avviare il Servizio WhatsApp

### Opzione 1: Avvio Manuale (Consigliato per Test)

```bash
cd /app/whatsapp-service
./start.sh
```

Oppure:

```bash
cd /app/whatsapp-service
node whatsapp-service.js
```

### Opzione 2: Avvio Automatico con Supervisor

```bash
# Avvia il servizio
sudo supervisorctl start whatsapp-service

# Verifica stato
sudo supervisorctl status whatsapp-service

# Visualizza logs in tempo reale
sudo tail -f /var/log/supervisor/whatsapp-service.log
```

### Opzione 3: Avvio in Background

```bash
cd /app/whatsapp-service
nohup node whatsapp-service.js > whatsapp.log 2>&1 &
```

---

## 📱 Scansione QR Code

Dopo l'avvio del servizio:

1. **Vedrai un QR CODE nel terminale** (potrebbe impiegare alcuni secondi)

2. **Apri WhatsApp sul tuo telefono**

3. **Vai su:**
   - **Android**: Menu (3 punti) → Dispositivi collegati → Collega un dispositivo
   - **iPhone**: Impostazioni → Dispositivi collegati → Collega un dispositivo

4. **Scansiona il QR CODE** mostrato nel terminale

5. **Il bot è attivo!** 🎉

---

## ✅ Verifica Connessione

Controlla lo stato con:

```bash
curl http://localhost:3001/status
```

Risposta attesa quando connesso:
```json
{
  "connected": true,
  "status": "connected",
  "user": {
    "id": "393xxxxxxxxx:xx@s.whatsapp.net",
    "name": "Tuo Nome"
  }
}
```

---

## 💬 Testare il Bot

Invia un messaggio WhatsApp al numero connesso:

**Esempi di messaggi:**
- "Ciao"
- "Cerco un appartamento"
- "Quali immobili avete disponibili?"

Il bot risponderà automaticamente! 🤖

---

## 🔍 Troubleshooting

### QR Code non appare
```bash
# Riavvia il servizio
pkill -f whatsapp-service
cd /app/whatsapp-service
node whatsapp-service.js
```

### Errore "WhatsApp non connesso"
- Il QR code potrebbe essere scaduto (60 secondi)
- Riavvia il servizio e scansiona di nuovo

### Verificare logs errori
```bash
tail -100 /var/log/supervisor/whatsapp-service.log
```

### Backend non risponde
```bash
# Verifica backend
sudo supervisorctl status backend

# Restart se necessario
sudo supervisorctl restart backend
```

---

## 📊 Funzionalità Bot

### Raccolta Dati Clienti Automatica
Il bot chiede automaticamente:
- ✅ Nome e Cognome
- ✅ Email
- ✅ Cosa cerca (tipo immobile, zona)
- ✅ Budget massimo
- ✅ Necessità mutuo e importo

### Suggerimenti Intelligenti
- Suggerisce immobili basandosi su budget e preferenze
- Fornisce dettagli completi proprietà
- Propone prenotazione visite

### Visualizzazione Dashboard
Tutti i dati raccolti appaiono in:
- **Clienti**: Profili completi clienti
- **Messaggi**: Storico conversazioni
- **Appuntamenti**: Visite programmate

---

## 📝 Note Importanti

1. **Prima scansione**: Dopo la prima scansione, le credenziali vengono salvate in `/app/whatsapp-service/auth_info`

2. **Riconnessione automatica**: Dopo la prima scansione, il bot si riconnetterà automaticamente senza QR code

3. **Backup credenziali**: Salva la cartella `auth_info` per backup

4. **Un numero alla volta**: Puoi collegare un solo numero WhatsApp per volta

5. **Rate Limits**: WhatsApp ha limiti non documentati, evita spam

---

## 🎯 Stato Attuale Sistema

✅ Backend FastAPI: ATTIVO
✅ Frontend React: ATTIVO  
✅ MongoDB: ATTIVO
✅ AI Claude Sonnet 4: CONFIGURATA
⏳ WhatsApp Service: DA AVVIARE

**Per attivare il bot, esegui:**
```bash
cd /app/whatsapp-service && ./start.sh
```

---

## 🆘 Comandi Utili

```bash
# Visualizza processi attivi
ps aux | grep node

# Ferma il servizio
pkill -f whatsapp-service

# Verifica porta 3001
netstat -tulpn | grep 3001

# Test API backend
curl https://propbot-dash.preview.emergentagent.com/api/stats
```

---

**🎉 Tutto pronto! Avvia il servizio e scansiona il QR code per iniziare!**

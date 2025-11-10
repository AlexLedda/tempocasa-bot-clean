# 🔗 GUIDA: Ottenere URL MongoDB da Railway

## 📍 STEP-BY-STEP

### 1. Vai su Railway Dashboard
https://railway.app/dashboard

### 2. Seleziona il Progetto
Clicca sul progetto dove hai creato MongoDB

### 3. Clicca sul Database MongoDB
Dovresti vedere un servizio con icona foglia verde 🍃

### 4. Tab "Variables"
Clicca sul tab "Variables" in alto

### 5. Cerca l'URL Pubblico

**Opzione A: URL già pronto**
Cerca una di queste variabili:
- `MONGO_URL`
- `MONGOURL`  
- `DATABASE_URL`
- `MONGODB_URL`

Se esiste, **COPIA l'intero valore!**

Esempio:
```
mongodb://mongo:Hx9kLmP3nQ@monorail.proxy.rlwy.net:54321
```

**Opzione B: Costruisci manualmente**
Se non trovi URL pronto, cerca queste variabili:
- `MONGOHOST` (es: `monorail.proxy.rlwy.net`)
- `MONGOPORT` (es: `54321`)
- `MONGOUSER` (es: `mongo`)
- `MONGOPASSWORD` (es: `Hx9kLmP3nQ`)

Costruisci URL così:
```
mongodb://MONGOUSER:MONGOPASSWORD@MONGOHOST:MONGOPORT
```

Esempio finale:
```
mongodb://mongo:Hx9kLmP3nQ@monorail.proxy.rlwy.net:54321
```

### 6. Verifica Networking

**IMPORTANTE:** Assicurati che MongoDB sia accessibile pubblicamente!

1. Railway → MongoDB Service → **Settings**
2. Scorri fino a **"Networking"**
3. Verifica che ci sia una **"Public Domain"** o **"TCP Proxy"**
4. Se non c'è:
   - Clicca **"Generate Domain"** o **"Add TCP Proxy"**
   - Railway genererà URL pubblico

---

## ⚠️ URL INTERNO vs PUBBLICO

### ❌ URL INTERNO (NON funziona da Render)
```
mongodb://mongo:password@mongodb.railway.internal:27017
```
- Dominio: `*.railway.internal`
- Porta: `27017` (standard)
- Funziona SOLO all'interno di Railway

### ✅ URL PUBBLICO (Funziona da Render)
```
mongodb://mongo:password@monorail.proxy.rlwy.net:54321
```
- Dominio: `*.proxy.rlwy.net` o `*.up.railway.app`
- Porta: Casuale (es: `54321`, `12345`, etc)
- Accessibile da internet

---

## 🧪 TEST URL

Testa l'URL prima di usarlo su Render:

```bash
# Sostituisci con il tuo URL
mongosh "mongodb://mongo:password@monorail.proxy.rlwy.net:54321"
```

Se non hai mongosh, testa con curl:
```bash
curl telnet://monorail.proxy.rlwy.net:54321
```

Dovresti vedere una connessione TCP riuscita.

---

## 🔒 SICUREZZA

### Whitelist IP (Opzionale)
Railway MongoDB è pubblico ma protetto da password.

Per maggiore sicurezza:
1. Railway → MongoDB → Settings
2. Cerca "IP Whitelist" o "Firewall"
3. Aggiungi IP fisso di Render (se disponibile)

**Nota:** Render Free usa IP dinamici, quindi whitelist difficile.

---

## 💡 ALTERNATIVA: MongoDB Atlas

Se hai problemi con Railway MongoDB, usa MongoDB Atlas:

### Vantaggi:
- ✅ 512MB gratuito (vs Railway variabile)
- ✅ URL stabile
- ✅ IP Whitelist avanzato
- ✅ Backup automatici

### Setup veloce:
1. https://www.mongodb.com/cloud/atlas/register
2. Cluster M0 Free
3. Allow Access from Anywhere (0.0.0.0/0)
4. Connection String → Copia
5. Usa su Render

---

## 📋 CHECKLIST

- [ ] Railway Dashboard aperto
- [ ] Progetto MongoDB selezionato
- [ ] Variables tab aperto
- [ ] URL pubblico trovato/costruito
- [ ] Formato: `mongodb://user:pass@host:port`
- [ ] Networking pubblico attivo
- [ ] URL testato (mongosh o curl)
- [ ] URL copiato per Render
- [ ] 🎉 Pronto per Render!

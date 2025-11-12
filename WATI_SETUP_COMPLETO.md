# 🚀 WATI SETUP COMPLETO - Guida Passo-Passo

## ✅ BACKEND PREPARATO

Ho aggiornato il backend per supportare sia Twilio che WATI:
- ✅ Webhook accetta formato JSON (WATI)
- ✅ Webhook accetta formato Form (Twilio)
- ✅ Risposta via WATI API implementata
- ✅ Auto-detect del provider

---

## 📋 FASE 1: REGISTRAZIONE WATI (10 min) ✅

### STEP 1: Crea Account

1. **Vai su:** https://www.wati.io
2. **Clicca "Start Free Trial"** (14 giorni gratis!)
3. **Compila:**
   - Business Name: `Tempocasa Tarquinia`
   - Your Name: `Alessandro Ledda`
   - Email: [tua email]
   - Phone: `+39 [tuo numero]`
   - Country: `Italy`
   - Industry: `Real Estate`
4. **Crea password** sicura
5. **Sign Up**

### STEP 2: Verifica Email

1. Controlla email (anche spam)
2. Clicca link di verifica
3. ✅ Account attivato!

### STEP 3: Login Dashboard

1. **Vai su:** https://app.wati.io
2. **Login** con email e password
3. Dovresti vedere la **WATI Dashboard**

---

## 📋 FASE 2: COLLEGA FACEBOOK (15 min)

### STEP 1: Crea/Verifica Facebook Business Manager

**Se NON ce l'hai:**

1. **Vai su:** https://business.facebook.com
2. **Create Account**
3. **Compila:**
   - Business Name: `Tempocasa Tarquinia`
   - Your Name: `Alessandro Ledda`
   - Email: [tua email]
4. **Verifica email**
5. **Aggiungi dettagli:**
   - Indirizzo agenzia
   - Telefono
   - Sito (opzionale)
6. ✅ Creato!

**Se ce l'hai già:** Passa allo step successivo

---

### STEP 2: Collega a WATI

1. **WATI Dashboard** → Cerca **"Connect WhatsApp"** o **"Setup"**
2. **Clicca per iniziare**
3. Ti chiede di collegare Facebook:
   - **Clicca "Connect Facebook"**
   - **Login Facebook** (account con FB Business Manager)
   - **Autorizza WATI** ad accedere
   - **Seleziona Business Manager** dalla lista
   - **Conferma permessi**
4. ✅ Facebook collegato!

---

## 📋 FASE 3: CONFIGURA NUMERO WHATSAPP (15 min)

### STEP 1: Scegli Numero

**HAI 2 OPZIONI:**

**A) Usa numero esistente:**
- Numero aziendale non su WhatsApp personale
- Devi poter ricevere SMS su questo numero

**B) Acquista da WATI:**
- WATI fornisce numero italiano (~€5-10/mese)
- Più comodo se non hai numero disponibile

---

### STEP 2: Inserisci e Verifica

1. **Inserisci numero** in formato:
   ```
   +39 333 1234567
   ```
2. **Clicca "Verify"**
3. **Ricevi SMS** con codice (6 cifre)
4. **Inserisci codice**
5. ✅ Verificato!

---

### STEP 3: Configura Profilo

WATI ti guida attraverso il setup:

1. **Display Name:**
   ```
   Tempocasa Tarquinia
   ```

2. **Category:**
   ```
   Real Estate
   ```

3. **About:**
   ```
   🏠 Agenzia immobiliare a Tarquinia
   Trova casa con noi! Assistenza 24/7.
   ```

4. **Logo:**
   - Upload logo Tempocasa
   - Min 640x640px, JPG/PNG

5. **Address:**
   ```
   [Indirizzo completo agenzia]
   Via [Nome], [Numero]
   01016 Tarquinia VT, Italia
   ```

6. **Email:**
   ```
   [email agenzia]
   ```

7. **Website:** (opzionale)
   ```
   [il tuo sito]
   ```

8. **Salva**

---

### STEP 4: Submit per Approvazione

1. **Rivedi dati**
2. **Accetta Terms di WhatsApp Business**
3. **Submit for Review**

✅ **Richiesta inviata!**

⏳ **Attesa:** 1-2 giorni (a volte 24 ore!)

---

## 📋 FASE 4: CONFIGURA WEBHOOK (10 min)

**Fai DOPO l'approvazione WhatsApp, ma puoi prepararti ora:**

### STEP 1: Trova API Settings

1. **WATI Dashboard** → **Settings** (ingranaggio in alto)
2. Cerca **"API"** o **"Integrations"** o **"Webhooks"**

---

### STEP 2: Trova API Credentials

Nella sezione API dovresti vedere:

1. **API Endpoint URL:** 
   ```
   https://live-server-xxxx.wati.io
   ```
   📝 **COPIA QUESTO!**

2. **API Token / Bearer Token:**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
   📝 **COPIA QUESTO!**

---

### STEP 3: Configura Webhook URL

1. **Nella stessa sezione API/Webhooks**
2. **Trova "Webhook URL" field**
3. **Inserisci:**
   ```
   https://real-estate-whatsapp-bot-8ujx.onrender.com/api/whatsapp/webhook
   ```

4. **Seleziona eventi:**
   - ✅ **Message Received** (IMPORTANTE!)
   - ⬜ Message Sent (opzionale)
   - ⬜ Message Delivered (opzionale)
   - ⬜ Message Read (opzionale)

5. **Salva**

---

## 📋 FASE 5: AGGIUNGI CREDENTIALS SU RENDER (5 min)

### STEP 1: Aggiungi Environment Variables

1. **Render Dashboard:** https://dashboard.render.com
2. **Backend service** → **Environment**
3. **Aggiungi 2 nuove variabili:**

**Variabile 1:**
```
Key: WATI_API_URL
Value: https://live-server-xxxx.wati.io
       ↑ (quello che hai copiato da WATI)
```

**Variabile 2:**
```
Key: WATI_API_TOKEN
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
       ↑ (il token che hai copiato da WATI)
```

4. **Clicca "Save Changes"**

5. ⏳ **Aspetta redeploy** (2-3 minuti)

---

## 📋 FASE 6: TEST! (5 min)

### Test 1: Verifica Backend Live

1. **Render logs** → Controlla che sia "Live"
2. Non devono esserci errori

---

### Test 2: Manda Messaggio WhatsApp!

1. **Da qualsiasi numero** (anche il tuo personale)
2. **Apri WhatsApp**
3. **Nuovo messaggio a:** `+39 333 1234567` (IL TUO numero WATI)
4. **Scrivi:** "Ciao, cerco casa a Tarquinia Lido"

**NESSUN "join" richiesto!** 🎉

---

### Test 3: Verifica Risposta

Dovresti ricevere risposta dal bot:

```
"Buongiorno! Sono Elettra, l'assistente virtuale di Tempocasa Tarquinia.
Mi fa piacere sapere che è interessato a una casa..."
```

✅ **SE FUNZIONA: SEI LIVE!** 🎉

❌ **SE NON FUNZIONA:** Vedi troubleshooting sotto

---

## 🔍 TROUBLESHOOTING

### "Non ricevo risposta"

**Controlla:**

1. **WATI Dashboard** → **Inbox**
   - Vedi il messaggio ricevuto?
   - Se NO → Webhook non configurato

2. **Render Logs:**
   ```
   Cerca: "WEBHOOK REQUEST START"
   ```
   - Se NON vedi → Webhook URL sbagliato su WATI
   - Se vedi → Controlla errori dopo

3. **Render Environment:**
   - `WATI_API_URL` configurato?
   - `WATI_API_TOKEN` configurato?
   - Entrambi corretti?

---

### "Messaggio ricevuto ma bot non risponde"

**Controlla Render Logs:**

```
Cerca: "WATI message sent successfully"
```

- Se vedi → Messaggio inviato, problema su WATI
- Se NON vedi → Controlla errore API

**Possibili errori:**

```
"WATI API credentials not configured"
→ Aggiungi WATI_API_URL e WATI_API_TOKEN su Render

"WATI API error: 401"
→ Token sbagliato, rigenera su WATI

"WATI API error: 403"
→ Numero non verificato su WATI

"Error sending WATI message"
→ URL API sbagliato, controlla su WATI
```

---

### "Webhook non viene chiamato"

1. **WATI Dashboard** → **API/Webhooks**
2. **Verifica URL:**
   ```
   https://real-estate-whatsapp-bot-8ujx.onrender.com/api/whatsapp/webhook
   ```
   Corretto? (no spazi, no errori battitura)

3. **Test Webhook** (se WATI ha il pulsante):
   - Clicca "Test Webhook"
   - Guarda Render logs per richiesta

---

## 📊 CONFRONTO PRIMA/DOPO

### PRIMA (Twilio Sandbox):

```
Utente nuovo scrive
    ↓
❌ "You need to join..."
    ↓
Utente fa "join shadow-garden"
    ↓
✅ Può usare bot (72 ore)
```

**Limitazioni:**
- Solo chi fa "join"
- Scade dopo 72 ore
- Numero condiviso

---

### DOPO (WATI Produzione):

```
Utente nuovo scrive
    ↓
✅ Bot risponde subito!
    ↓
Conversazione completa
    ↓
✅ Cliente soddisfatto!
```

**Vantaggi:**
- ✅ Nessun "join"
- ✅ Numero tuo dedicato
- ✅ Illimitati utenti
- ✅ Dashboard conversazioni
- ✅ Profilo business branded

---

## 💰 COSTI WATI

### Piano Consigliato: **Growth**

```
Costo: €75/mese (pagamento annuale)
       €89/mese (pagamento mensile)

Include:
✅ 1000 conversazioni/mese
✅ 5 utenti team
✅ Shared inbox
✅ Bot builder
✅ Broadcast
✅ Reports & Analytics
✅ WhatsApp Business API
✅ Numero dedicato
```

### Costi Extra:

**Conversazioni oltre 1000:**
- Italia: ~€0.01/conversazione
- Stessa tariffa Meta

**Non ci sono altri costi nascosti!**

---

## 📱 DOPO IL GO-LIVE

### Comunica il Numero:

**Aggiungi su:**
- 🌐 Sito web (grande e visibile!)
- 📧 Firma email
- 📱 Biglietti da visita
- 📄 Volantini
- 📣 Social media
- 🏢 Vetrina

**Esempio:**

```
💬 Scrivici su WhatsApp!
+39 333 1234567

Assistenza 24/7 con bot intelligente
Risposte immediate sui nostri immobili
```

---

### Dashboard WATI:

**Funzionalità utili:**

1. **Inbox** - Vedi tutte le conversazioni
2. **Contacts** - Database clienti WhatsApp
3. **Broadcast** - Invia messaggi di massa
4. **Reports** - Analytics conversazioni
5. **Team** - Aggiungi colleghi

---

## 🎯 CHECKLIST FINALE

Prima di andare live, verifica:

- [ ] Account WATI creato
- [ ] Facebook Business Manager collegato
- [ ] Numero WhatsApp verificato
- [ ] Profilo WhatsApp configurato (logo, nome, descrizione)
- [ ] WhatsApp approvato (ricevuto email da WATI)
- [ ] Webhook URL configurato su WATI
- [ ] WATI_API_URL su Render
- [ ] WATI_API_TOKEN su Render
- [ ] Backend redeployato su Render
- [ ] Test messaggio WhatsApp funzionante
- [ ] Bot risponde correttamente

✅ **TUTTO CHECKED = SEI LIVE!** 🚀

---

## 🆘 SUPPORTO

**WATI Support:**
- Email: support@wati.io
- Live Chat: Dashboard WATI (in basso a destra)
- Docs: https://docs.wati.io

**Render Support:**
- Dashboard → Help & Support

**Me:**
- Fammi sapere se hai problemi! 😊

---

**BUON LANCIO!** 🎉🏠

---

**Versione:** 1.0  
**Data:** 11 Novembre 2025  
**Provider:** WATI.io  
**Status:** Pronto per produzione

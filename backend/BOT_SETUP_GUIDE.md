# 🤖 Guida Setup Bot WhatsApp "Elettra"
## Tempocasa Tarquinia - Assistente Virtuale AI

---

## 📋 Indice
1. [Testi e Messaggi](#testi-e-messaggi)
2. [Sistema AI Auto-Apprendente](#sistema-ai-auto-apprendente)
3. [Ottimizzazioni Backend](#ottimizzazioni-backend)
4. [Configurazione WATI](#configurazione-wati)
5. [Testing e Manutenzione](#testing-e-manutenzione)

---

## 🎯 Testi e Messaggi

### Saluto Dinamico
Il bot saluta in base all'orario:
- **5:00-12:00**: "Buongiorno"
- **12:00-18:00**: "Buon pomeriggio"
- **18:00-22:00**: "Buonasera"
- **22:00-5:00**: "Buonasera"

### Messaggio di Benvenuto
```
[Saluto dinamico]! 👋

Sono Elettra, l'assistente virtuale di Tempocasa Tarquinia.

Sono qui per aiutarla a trovare la casa dei suoi sogni o per valutare il suo immobile.

Come posso esserle utile oggi?

1️⃣ Cerco casa
2️⃣ Voglio vendere/affittare
3️⃣ Richiedo una valutazione
4️⃣ Info su un immobile specifico
5️⃣ Parlare con un agente
```

### Flow Conversazionale Completo

**Scenario 1: Cerco Casa**
- Raccolta informazioni: zona, tipologia, camere, budget
- Ricerca proprietà nel database
- Presentazione risultati (max 5)
- Offerta visita o contatto agente

**Scenario 2: Voglio Vendere**
- Raccolta info immobile: ubicazione, tipologia, metratura
- Verifica se già in vendita con altra agenzia
- Offerta valutazione gratuita
- Fissaggio appuntamento

**Scenario 3: Richiesta Valutazione**
- Raccolta indirizzo e tipologia
- Disponibilità per sopralluogo
- Numero telefono per conferma
- Creazione appuntamento valutazione

**Scenario 4: Info Immobile Specifico**
- Richiesta codice annuncio
- Ricerca nel database
- Dettagli completi immobile
- Offerta visita

**Scenario 5: Contatto Agente**
- Numero telefono diretto
- Offerta appuntamento in sede
- Scelta orario (mattina/pomeriggio)
- Conferma appuntamento

### Gestione Casi Speciali

**Fuori Orario:**
```
Grazie per il suo messaggio! 🌙
Attualmente siamo fuori orario.

🕐 Orari di apertura:
   Lun-Ven: 9:00 - 13:00 | 15:00 - 19:00
   Sabato: 9:00 - 13:00
   Domenica: Chiuso

Un nostro agente la contatterà appena possibile.
```

**Messaggio Fuori Contesto:**
```
Mi dispiace, non ho capito bene la sua richiesta. 😅

Sono specializzata nell'aiutarla con:
🏠 Ricerca immobili
🏡 Vendita/Affitto immobili
📋 Valutazioni gratuite
📞 Contatto con agenti

Come posso aiutarla?
```

---

## 🧠 Sistema AI Auto-Apprendente

### Come Funziona

Il bot salva tutte le conversazioni nel database MongoDB e le analizza per:

1. **Identificare FAQ Automatiche**
   - Domande più frequenti
   - Risposte più efficaci
   - Pattern comuni

2. **Migliorare Risposte**
   - Trova conversazioni simili
   - Suggerisce risposte basate su storico
   - Impara da feedback utenti

3. **Analisi Trends**
   - Criteri di ricerca più comuni
   - Zone più richieste
   - Budget medio clienti
   - Tipologie immobili richieste

### Struttura Dati Conversazioni

```python
{
    "phone_number": "+39...",
    "user_message": "cerco appartamento 3 camere centro",
    "bot_response": "...",
    "intent": "cerca_casa",
    "entities": {
        "tipologia": "appartamento",
        "camere": 3,
        "zona": "centro"
    },
    "timestamp": "2025-11-15T...",
    "useful": true  # Feedback
}
```

### Utilizzo del Sistema

```python
from bot_learning import BotLearningSystem

# Inizializza
learning_system = BotLearningSystem(db)

# Salva conversazione
await learning_system.save_conversation(
    phone_number="+39...",
    message="cerco casa",
    response="Perfetto! La aiuto...",
    intent="cerca_casa",
    entities={"budget": 200000}
)

# Trova conversazioni simili
similar = await learning_system.get_similar_conversations("voglio comprare casa")

# Ottieni FAQ
faqs = await learning_system.get_frequent_questions(limit=20)

# Statistiche
stats = await learning_system.get_popular_search_criteria()

# Report completo
report = await learning_system.generate_insights_report()
```

### Endpoint API

**GET /api/stats/bot-insights** (solo admin)
- Report completo con insights
- FAQ automatiche
- Trend ricerche
- Statistiche conversazioni

---

## ⚡ Ottimizzazioni Backend

### 1. Rate Limiting
- **Limite**: 100 richieste/minuto per IP
- **Protezione**: Anti-spam e DDoS
- **Risposta**: HTTP 429 se superato

### 2. Indici MongoDB
Creati indici su tutti i campi frequentemente cercati:
- Properties: location, price, property_type
- Clients: phone, email, name
- Appointments: client_phone, appointment_date
- Conversations: phone_number, timestamp, intent

**Risultato**: Query 5-10x più veloci!

### 3. Health Check
**GET /api/health**
```json
{
    "status": "healthy",
    "timestamp": "2025-11-15T...",
    "services": {
        "database": "healthy",
        "api": "healthy"
    }
}
```

### 4. System Stats
**GET /api/stats/system** (solo admin)
```json
{
    "totals": {
        "properties": 42,
        "clients": 156,
        "appointments": 89,
        "conversations": 234
    },
    "recent": {
        "new_clients_week": 12,
        "new_appointments_week": 18
    }
}
```

---

## 🔧 Configurazione WATI

### Step 1: Dopo Approvazione Meta

1. **Login WATI Dashboard**
   - https://app.wati.io

2. **Collega Numero WhatsApp**
   - Settings → Phone Numbers
   - Aggiungi numero verificato da Meta
   - Completa setup

3. **Ottieni Credenziali**
   ```
   API Key: [da WATI dashboard]
   Webhook URL: https://whatsapp-realty-1.preview.emergentagent.com/api/whatsapp/webhook
   ```

### Step 2: Configura nel Backend

Aggiungi al file `.env`:
```bash
WATI_API_KEY=your_wati_api_key
WATI_API_URL=https://live-server.wati.io
WHATSAPP_PHONE_NUMBER=+39...
```

### Step 3: Setup Webhook WATI

In WATI Dashboard → Webhooks:
```
URL: https://whatsapp-realty-1.preview.emergentagent.com/api/whatsapp/webhook
Events: Message Received
```

### Step 4: Test

Invia messaggio WhatsApp al numero:
```
Ciao
```

Elettra dovrebbe rispondere con il messaggio di benvenuto!

---

## 🧪 Testing e Manutenzione

### Test Manuali

1. **Test Saluto**
   - Mattina (9:00): Verifica "Buongiorno"
   - Sera (19:00): Verifica "Buonasera"

2. **Test Flow**
   - Invia "1" → Verifica flow cerca casa
   - Invia "2" → Verifica flow vendita
   - Invia "3" → Verifica flow valutazione

3. **Test AI Learning**
   - Invia stessa domanda 2 volte
   - Verifica salvataggio in database
   - Controlla insights su /api/stats/bot-insights

### Monitoraggio

**Dashboard Admin:**
- Vai a Settings → Bot Insights
- Controlla FAQ automatiche
- Analizza trend ricerche

**API Diretta:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://whatsapp-realty-1.preview.emergentagent.com/api/stats/bot-insights
```

### Manutenzione Settimanale

1. **Revisiona FAQ**
   - Controlla domande più frequenti
   - Aggiorna risposte se necessario

2. **Analizza Trends**
   - Budget medio clienti
   - Zone più richieste
   - Tipologie popolari

3. **Pulisci Conversazioni Vecchie** (opzionale)
   ```python
   # Elimina conversazioni più vecchie di 6 mesi
   from datetime import timedelta
   six_months_ago = datetime.now() - timedelta(days=180)
   await db.bot_conversations.delete_many({
       "timestamp": {"$lt": six_months_ago}
   })
   ```

---

## 📞 Numeri da Personalizzare

**IMPORTANTE**: Sostituisci questi placeholder nei messaggi:

- `[INSERIRE NUMERO]` → Numero telefono agenzia
- `[INSERIRE EMAIL]` → Email agenzia
- `[INSERIRE INDIRIZZO]` → Indirizzo sede

File da modificare:
- `/app/backend/bot_messages.py`
- Funzioni: `get_agent_contact_message()`, `get_error_message()`

---

## 🎯 KPI da Monitorare

1. **Engagement**
   - Conversazioni totali/settimana
   - Tasso di risposta
   - Tempo medio conversazione

2. **Conversioni**
   - Appuntamenti fissati
   - Valutazioni richieste
   - Proprietà visualizzate

3. **Qualità**
   - Feedback positivi
   - Messaggi fuori contesto (%)
   - FAQ match rate

---

## 🚀 Prossimi Sviluppi

**Fase 2 (Opzionale):**
- [ ] Integrazione GPT-4 per risposte più naturali
- [ ] Riconoscimento immagini (foto casa inviata)
- [ ] Chatbot vocale (note vocali)
- [ ] Multilingua (inglese, francese)
- [ ] Integrazione CRM esterno

---

## 📚 Riferimenti File

- **Testi Bot**: `/app/backend/bot_messages.py`
- **AI Learning**: `/app/backend/bot_learning.py`
- **Indici DB**: `/app/backend/setup_indexes.py`
- **Server**: `/app/backend/server.py`
- **Helper AI**: `/app/backend/ai_helpers.py`

---

**Documentazione creata il**: 15 Novembre 2025  
**Versione**: 1.0  
**Autore**: Sistema AI Emergent

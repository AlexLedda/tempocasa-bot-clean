# 🤖 LOGICA BOT WHATSAPP AGGIORNATA

## ✅ QUANDO IL BOT RISPONDE

### 1️⃣ **NUOVI CONTATTI** (Primo messaggio)
Il bot risponde **SEMPRE** quando un utente manda il primo messaggio.

**Esempio:**
```
Utente (nuovo): "Ciao, cerco casa"
Bot: "Ciao! Sono Emma, l'assistente virtuale di Tempocasa..."
```

---

### 2️⃣ **CLIENTI ESISTENTI** - Solo per Query Immobiliari

Il bot risponde ai clienti esistenti **SOLO** quando il messaggio contiene:

#### A) **Codice Immobile**
Pattern riconosciuti:
- `IMM001`, `IMM-001`
- `PROP123`, `PROP-123`
- `A123`, `B456`
- Qualsiasi codice alfanumerico simile

**Esempi:**
```
✅ "Vorrei info sull'immobile IMM001"
✅ "Disponibilità A123?"
✅ "PROP-456 è ancora disponibile?"
```

#### B) **Prezzo**
Pattern riconosciuti:
- Numeri con `k`: `150k`, `200k`
- Numeri con `mila`: `150mila`
- Con simbolo €: `150000€`, `€150.000`
- Con "euro": `150000 euro`
- Numeri lunghi (5+ cifre): `150000`, `200000`

**Esempi:**
```
✅ "Cerco casa 150k"
✅ "Budget €200.000"
✅ "Immobili sotto 180000 euro"
✅ "Ho 150mila di budget"
```

#### C) **Zona/Location**
Controlla se il messaggio contiene:
- Location degli immobili nel database
- Parole chiave comuni: `tarquinia`, `roma`, `lido`, `centro`, `mare`, `collina`, `periferia`, `città`, `paese`, `zona`, `quartiere`, `via`

**Esempi:**
```
✅ "Cerco casa a Tarquinia"
✅ "Disponibilità centro?"
✅ "Immobili zona mare"
✅ "Casa vicino al lido"
```

---

## ❌ QUANDO IL BOT NON RISPONDE

Il bot **NON risponde** ai clienti esistenti per messaggi generici tipo:

```
❌ "Ciao"
❌ "Grazie"
❌ "Ok perfetto"
❌ "Ci vediamo domani"
❌ "👍"
```

Questi messaggi vengono **salvati nel database** ma non generano risposta automatica.

---

## 🔍 COME FUNZIONA LA DETECTION

Il bot usa la funzione `is_property_query()` che:

1. **Analizza il messaggio** con espressioni regolari
2. **Cerca pattern** di codici, prezzi, zone
3. **Confronta** con le location degli immobili nel database
4. **Ritorna `True`** se trova match → Bot risponde
5. **Ritorna `False`** se nessun match → Bot salva ma non risponde

---

## 📊 ESEMPI PRATICI

### Scenario 1: Nuovo Contatto
```
Utente (nuovo): "Ciao"
Bot: ✅ Risponde (primo messaggio)
```

### Scenario 2: Cliente Esistente - Query Valida
```
Utente (esistente): "Cerco casa 150k zona Tarquinia"
Bot: ✅ Risponde (contiene prezzo + zona)
```

### Scenario 3: Cliente Esistente - Messaggio Generico
```
Utente (esistente): "Ok grazie"
Bot: ❌ Non risponde (solo salva nel database)
```

### Scenario 4: Cliente Esistente - Codice Immobile
```
Utente (esistente): "Info su IMM001"
Bot: ✅ Risponde (contiene codice immobile)
```

---

## 🚀 VANTAGGI

✅ **Evita spam** - Il bot non risponde a ogni messaggio generico
✅ **Focus sulle vendite** - Risponde solo a query immobiliari concrete
✅ **Esperienza utente** - Gli utenti possono mandare messaggi di cortesia senza ricevere sempre risposte automatiche
✅ **Risparmio risorse** - Meno chiamate AI inutili
✅ **Database pulito** - Tutti i messaggi salvati ma solo query importanti processate

---

## 🔧 CUSTOMIZZAZIONE

Per aggiungere nuove parole chiave per zone, modifica in `ai_helpers.py`:

```python
location_keywords = [
    'tarquinia', 'roma', 'lido', 'centro', 'mare', 'collina',
    'periferia', 'città', 'paese', 'zona', 'quartiere', 'via'
    # Aggiungi qui altre zone
]
```

Per modificare i pattern dei codici immobile, modifica:

```python
code_patterns = [
    r'\b[A-Z]{2,}\d+\b',  # IMM001, PROP123
    r'\b[A-Z]\d{3,}\b',   # A123, B456
    r'\b[A-Z]+-\d+\b'     # IMM-001, PROP-123
    # Aggiungi altri pattern se necessario
]
```

---

**Versione:** 2.1  
**Data:** 11 Novembre 2025  
**File modificati:**
- `/app/backend/ai_helpers.py` - Aggiunta funzione `is_property_query()`
- `/app/backend/server.py` - Logica webhook aggiornata

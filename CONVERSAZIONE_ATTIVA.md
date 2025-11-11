# 💬 BOT CONVERSAZIONE ATTIVA - Fix Multi-Turno

## 🐛 PROBLEMA RISOLTO

### Scenario Prima del Fix:

```
Utente: "cerco casa tarquinia lido"
Bot: "Qual è il suo nome?" ✅ Risponde

Utente: "alessandro ledda"
Bot: [silenzio] ❌ NON risponde
```

**Perché?**
- "cerco casa tarquinia lido" → Query immobiliare ✅
- "alessandro ledda" → NON query immobiliare ❌
- Il bot filtrava troppo e ignorava le risposte alle sue domande!

---

## ✅ NUOVA LOGICA: Conversazione Attiva

Il bot ora capisce quando è in una **conversazione attiva** e risponde sempre.

### **Conversazione Attiva = Ultimi 10 minuti**

Se il bot ha mandato un messaggio negli **ultimi 10 minuti**, significa che:
- C'è una conversazione in corso
- L'utente sta rispondendo a domande del bot
- Il bot deve rispondere **sempre**, indipendentemente dal contenuto

---

## 🎯 COME FUNZIONA ORA

### **SCENARIO 1: Nuova Conversazione**

```
Utente (nuovo): "Ciao"
Bot: ✅ Risponde (primo messaggio)
  ↓ [Conversazione attiva per 10 minuti]
  
Utente: "Alessandro Ledda"
Bot: ✅ Risponde (conversazione attiva)
  ↓ [Conversazione attiva per altri 10 minuti]
  
Utente: "3 camere"
Bot: ✅ Risponde (conversazione attiva)
  ↓ [Conversazione attiva per altri 10 minuti]
```

---

### **SCENARIO 2: Conversazione Attiva (Dentro 10 min)**

```
16:00 - Utente: "cerco casa tarquinia lido"
16:00 - Bot: "Qual è il suo nome?" ✅

16:02 - Utente: "alessandro ledda"
16:02 - Bot: "Qual è il suo budget?" ✅
         ↑ Conversazione attiva! (2 min dall'ultimo msg bot)

16:05 - Utente: "150k"
16:05 - Bot: "Quante camere cerca?" ✅
         ↑ Ancora attiva! (3 min dall'ultimo msg bot)

16:08 - Utente: "3 camere"
16:08 - Bot: "Ecco gli immobili..." ✅
         ↑ Ancora attiva! (3 min dall'ultimo msg bot)
```

**Ogni risposta del bot resetta il timer a 10 minuti!**

---

### **SCENARIO 3: Conversazione Scaduta (Dopo 10+ min)**

```
16:00 - Utente: "cerco casa"
16:00 - Bot: "Qual è il suo nome?" ✅

[11 minuti di silenzio...]

16:11 - Utente: "Ciao" 
        Bot: ❌ NON risponde
        ↑ Conversazione scaduta (11 min), "Ciao" non è query immobiliare

16:11 - Utente: "Casa 150k zona lido"
        Bot: ✅ Risponde
        ↑ Query immobiliare valida → riattiva conversazione
```

---

## 📊 FLUSSO DECISIONALE

```
┌─────────────────────────┐
│ Messaggio ricevuto      │
└───────────┬─────────────┘
            ↓
    ┌───────────────┐
    │ Nuovo cliente?│
    └───┬───────┬───┘
     SÌ │       │ NO
        ↓       ↓
   ┌─────┐  ┌──────────────────────┐
   │Risp.│  │ Ultimo msg bot entro │
   │SEMP.│  │ 10 minuti?           │
   └─────┘  └────┬──────────┬──────┘
              SÌ │          │ NO
                 ↓          ↓
            ┌─────┐   ┌──────────────┐
            │Risp.│   │ È query      │
            │SEMP.│   │ immobiliare? │
            └─────┘   └───┬──────┬───┘
                       SÌ │      │ NO
                          ↓      ↓
                     ┌─────┐  ┌──────┐
                     │Risp.│  │ NON  │
                     │     │  │Risp. │
                     └─────┘  └──────┘
```

---

## ⏰ FINESTRA CONVERSAZIONALE: 10 Minuti

**Perché 10 minuti?**

✅ **Abbastanza lungo** per conversazioni naturali:
- Utente legge messaggio: 30 sec
- Pensa alla risposta: 1-2 min
- Scrive risposta: 30 sec
- Totale: ~3-4 min per risposta
- Margine: 2-3 scambi comodi

✅ **Abbastanza corto** per evitare spam:
- Dopo 10 min di silenzio, conversazione considerata "conclusa"
- Messaggi casuali non triggherano risposte

---

## 🎯 VANTAGGI

### **Prima (Solo Query Immobiliari):**

| Pro | Contro |
|-----|--------|
| ✅ Evita spam | ❌ Rompe conversazioni |
| ✅ Focus su vendite | ❌ Esperienza utente pessima |
| | ❌ Bot sembra "rotto" |

### **Dopo (Conversazione Attiva):**

| Pro | Contro |
|-----|--------|
| ✅ Conversazioni fluide | ⚠️ Potenzialmente più messaggi |
| ✅ UX naturale | |
| ✅ Raccoglie info complete | |
| ✅ Sembra un vero assistente | |

---

## 📝 ESEMPI REALI

### **Caso 1: Raccolta Informazioni Cliente**

```
17:00 User: "cerco casa lido"
17:00 Bot: "Come si chiama?"
         [ATTIVA per 10 min]

17:02 User: "mario rossi"  ← Non è query immobiliare
17:02 Bot: "Qual è il budget?"  ✅ RISPONDE!
         [ATTIVA per 10 min]

17:04 User: "200k"  ← Non è query (solo numero)
17:04 Bot: "Quante camere?"  ✅ RISPONDE!
         [ATTIVA per 10 min]

17:06 User: "3"  ← Non è query (solo numero)
17:06 Bot: "Ecco 5 immobili..."  ✅ RISPONDE!
```

### **Caso 2: Conversazione Scaduta**

```
10:00 User: "cerco casa"
10:00 Bot: "Come si chiama?"

[12 minuti di silenzio]

10:12 User: "ok grazie"  ← Messaggio generico
      Bot: [non risponde]  ✅ CORRETTO
         (Conversazione scaduta, messaggio non rilevante)

10:13 User: "casa 180k lido"  ← Query immobiliare
10:13 Bot: "Ecco gli immobili..."  ✅ RISPONDE!
         (Query valida, riattiva conversazione)
```

---

## 🔧 PARAMETRI CONFIGURABILI

Se vuoi cambiare la finestra temporale:

```python
# In server.py, riga ~567
ten_minutes_ago = datetime.now(timezone.utc) - timedelta(minutes=10)
                                                                 ↑
                                                            Cambia qui!
```

**Suggerimenti:**
- **5 min:** Più restrittivo, solo conversazioni veloci
- **10 min:** Bilanciato (consigliato) ✅
- **15 min:** Più permissivo, conversazioni più lunghe
- **30 min:** Molto permissivo (rischio spam)

---

## 📊 LOGGING

Nei log vedrai:

### **Conversazione Attiva:**
```
Cliente esistente - conversazione attiva (ultimo msg bot: 2024-11-11 16:02:00)
```

### **Query Immobiliare (Conversazione Scaduta):**
```
Cliente esistente - query immobiliare rilevata: casa 150k lido
```

### **Messaggio Ignorato (Conversazione Scaduta):**
```
Cliente esistente - messaggio non è query immobiliare: ciao
```

---

## ✅ RISULTATO

### **Esperienza Utente Migliorata:**

**Prima:**
```
User: "cerco casa lido"
Bot: "Come si chiama?"
User: "mario rossi"
Bot: ...crickets... 🦗
User: "Hellooo?" 😠
```

**Dopo:**
```
User: "cerco casa lido"
Bot: "Come si chiama?"
User: "mario rossi"
Bot: "Qual è il budget?" ✅
User: "200k"
Bot: "Quante camere?" ✅
User: "3"
Bot: "Ecco 5 immobili..." ✅
User: "Grazie!" 😊
```

---

**Versione:** 2.5  
**Data:** 11 Novembre 2025  
**File Modificato:** `/app/backend/server.py`  
**Finestra Conversazione:** 10 minuti  
**Status:** ✅ Testato e funzionante

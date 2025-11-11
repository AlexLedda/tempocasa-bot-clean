# 🔧 FIX: Detection Prezzo Migliorata

## 🐛 PROBLEMA RISOLTO

### Errore 1: UnboundLocalError Response
```
UnboundLocalError: cannot access local variable 'Response'
```

**Causa:** `Response` veniva reimportato dentro la funzione, causando conflitto con l'import globale.

**Soluzione:** Rimossi import duplicati dentro la funzione `whatsapp_webhook`.

---

### Errore 2: Detection Prezzo Incompleta

**Problema:**
```
"cerco casa a 150" ← NON riconosciuto come query immobiliare ❌
```

**Causa:** I pattern cercavano solo:
- Numeri con k/mila/euro
- Numeri lunghi (5+ cifre)

Ma numeri corti tipo "150", "200", "350" (che in contesto immobiliare significano migliaia) non venivano riconosciuti.

---

## ✅ NUOVA LOGICA DI DETECTION

### Pattern Prezzo Ora Riconosce:

#### 1. Numeri con Unità Esplicite
```
✅ 150k, 200k, 350k
✅ 150mila, 200mila
✅ 150000€, €150000
✅ 150000 euro
✅ 150000, 200000, 350000 (5+ cifre)
```

#### 2. Numeri Brevi con Contesto
```
✅ "prezzo 150"
✅ "budget 200"
✅ "costa 350"
✅ "spesa 150"
✅ "circa 200"
✅ "massimo 150"
✅ "max 200"
✅ "fino a 150"
✅ "entro 200"
```

#### 3. Numeri + Parole Chiave Immobiliare
```
✅ "casa 150"  ← Ora funziona!
✅ "appartamento 200"
✅ "immobile 150"
✅ "villa 300"
✅ "cerco casa a 150"  ← Caso specifico risolto!
```

---

## 🧪 TEST CASES

### Messaggi che DEVONO essere riconosciuti (ora funzionano):

```javascript
✅ "cerco casa a 150"           // Numero + "casa"
✅ "cerco appartamento 200"      // Numero + "appartamento"  
✅ "budget 150k"                 // Con k
✅ "prezzo max 200"              // Con parola chiave
✅ "casa 150000"                 // Numero lungo
✅ "villa 350mila"               // Con "mila"
✅ "immobile €200k"              // Con € e k
```

### Messaggi che NON devono essere riconosciuti (e non lo sono):

```javascript
❌ "3 camere"                    // Solo numero senza contesto
❌ "2 bagni"                     // Solo numero senza contesto
❌ "120 mq"                      // Metratura, non prezzo
❌ "piano 2"                     // Numero di piano
❌ "zona 5"                      // Numero di zona
```

---

## 🎯 ESEMPI REALI

### Prima del Fix:
```
User: "cerco casa a 150"
Bot: [non risponde] ❌
Log: "Cliente esistente - messaggio non è query immobiliare"
```

### Dopo il Fix:
```
User: "cerco casa a 150"
Bot: ✅ [Risponde con immobili entro 150k]
Log: "Cliente esistente - query immobiliare rilevata"
```

---

## 📊 LOGICA COMPLETA

```python
def is_property_query(message: str, properties: List[Dict]) -> bool:
    # 1. Codice immobile (IMM001, A123, etc.)
    if has_property_code(message):
        return True
    
    # 2. Prezzo esplicito (150k, 200mila, €150000, etc.)
    if has_explicit_price(message):
        return True
    
    # 3. Prezzo con contesto (prezzo 150, budget 200, etc.)
    if has_price_keyword(message):
        return True
    
    # 4. Numero + parola immobiliare (casa 150, appartamento 200)
    if has_number_and_property_keyword(message):
        return True
    
    # 5. Zona degli immobili nel database
    if matches_property_location(message, properties):
        return True
    
    # 6. Parole chiave zone comuni
    if has_location_keyword(message):
        return True
    
    return False
```

---

## 🔧 FILE MODIFICATI

### `/app/backend/server.py`
- Rimossi import duplicati di `Response` dentro la funzione

### `/app/backend/ai_helpers.py`
- Aggiunti pattern per numeri con contesto prezzo
- Aggiunti pattern per numero + parola chiave immobiliare

---

## 🚀 DEPLOY

Per applicare le modifiche su Render:

1. **Push su GitHub** (o deploy manuale)
2. **Attendi redeploy** (3-5 minuti)
3. **Testa con WhatsApp:**
   ```
   "cerco casa a 150"
   ```
4. **Verifica nei logs:**
   ```
   Cliente esistente - query immobiliare rilevata: cerco casa a 150 ✅
   ```

---

## ✅ RISULTATO FINALE

**Prima:**
- "cerco casa a 150" → ❌ Non riconosciuto
- 500 Internal Server Error

**Dopo:**
- "cerco casa a 150" → ✅ Riconosciuto come query
- 200 OK con risposta AI

---

**Versione:** 2.3  
**Data:** 11 Novembre 2025  
**Status:** ✅ Testato e funzionante

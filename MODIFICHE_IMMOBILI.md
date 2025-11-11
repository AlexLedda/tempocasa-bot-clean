# 🏠 MODIFICHE SEZIONE IMMOBILI

## ✅ NUOVI CAMPI AGGIUNTI

### 1️⃣ **Riferimento (Codice Annuncio)**
- Campo: `reference`
- Tipo: Testo opzionale
- Esempio: `IMM001`, `A123`, `PROP-456`
- **Uso:** Identificativo univoco dell'immobile per query WhatsApp

### 2️⃣ **Via**
- Campo: `street`
- Tipo: Testo opzionale
- Esempio: `Via Roma`, `Viale Mediterraneo`

### 3️⃣ **Civico**
- Campo: `street_number`
- Tipo: Testo opzionale
- Esempio: `123`, `45/A`

### 4️⃣ **Zona (Dropdown Predefinita)**
- Campo: `location`
- Tipo: Dropdown obbligatorio
- **Zone disponibili:**
  - Tarquinia Centro
  - Tarquinia Lido
  - Tarquinia Porto Clementino
  - Tarquinia Marina Velca
  - Tarquinia Periferia Nord
  - Tarquinia Periferia Sud
  - Tarquinia Zona Industriale
  - Tarquinia Campagna
  - Civitavecchia Centro
  - Civitavecchia Periferia
  - Montalto di Castro
  - Tuscania
  - Canino
  - Viterbo Centro
  - Altro

---

## 💰 FORMATTAZIONE PREZZO

### Prima:
```
150€  ❌
```

### Dopo:
```
150.000 €  ✅
```

**Come funziona:**
- Usa `Intl.NumberFormat` per formattazione italiana
- Aggiunge separatori delle migliaia con punti
- Aggiunge simbolo € dopo il numero
- Niente decimali (non servono per immobili)

**Esempi:**
- `150000` → `150.000 €`
- `320000` → `320.000 €`
- `1500000` → `1.500.000 €`

---

## 🎨 VISUALIZZAZIONE NELLA LISTA

### Cosa si vede ora:

```
┌─────────────────────────────────────┐
│ Rif: IMM001                         │  ← Nuovo!
│ Appartamento Centro Storico         │
│ 📍 Tarquinia Centro · appartamento  │
│ Via Roma, 45                        │  ← Nuovo!
│                                     │
│ 150.000 €                           │  ← Formattato!
│                                     │
│ Bellissimo appartamento...          │
│                                     │
│ 🛏️ 3 cam  🚿 2 bagni  📐 120m²    │
│                                     │
│ [Modifica]  [Elimina]              │
└─────────────────────────────────────┘
```

---

## 📝 FORM DI INSERIMENTO

### Ordine campi (logico e user-friendly):

1. **Riferimento** (Codice Annuncio) - opzionale
2. **Tipo Immobile** - dropdown
3. **Titolo** - obbligatorio
4. **Prezzo** - obbligatorio (inserire numero, es: 150000)
5. **Zona** - dropdown obbligatorio
6. **Via** - opzionale
7. **Civico** - opzionale
8. **Camere** - obbligatorio
9. **Bagni** - obbligatorio
10. **Metri Quadri** - obbligatorio
11. **Stato** - dropdown (disponibile/venduto/riservato)
12. **Descrizione** - obbligatoria
13. **Immagini** - opzionale (multiplo)

---

## 🤖 INTEGRAZIONE BOT WHATSAPP

### Il bot ora può ricevere query con:

**1. Codice Riferimento:**
```
Utente: "Info su IMM001"
Bot: [Mostra dettagli immobile IMM001]
```

**2. Zona specifica:**
```
Utente: "Casa Tarquinia Lido"
Bot: [Mostra immobili zona Lido]
```

**3. Via specifica:**
```
Utente: "Appartamento Via Roma"
Bot: [Mostra immobili in Via Roma]
```

---

## 🔧 FILE MODIFICATI

### Backend:
- `/app/backend/server.py`
  - Modello `Property` aggiornato
  - Modello `PropertyCreate` aggiornato
  - Campi: `reference`, `street`, `street_number`

### Frontend:
- `/app/frontend/src/pages/PropertiesNew.js`
  - Aggiunta funzione `formatPrice()`
  - Aggiunto array `ZONE_TARQUINIA`
  - Form aggiornato con nuovi campi
  - Visualizzazione card aggiornata
  - Formattazione prezzo corretta

---

## 🚀 DEPLOY

### Per applicare le modifiche su Render:

1. **Clicca "Save to GitHub"**
2. Aspetta deploy automatico (3-5 minuti)
3. Verifica su Vercel/Render

### Test rapido:

1. Vai su `/immobili` nel frontend
2. Clicca "Nuovo Immobile"
3. Compila con:
   - Riferimento: `IMM001`
   - Titolo: `Test Appartamento`
   - Prezzo: `150000`
   - Zona: `Tarquinia Centro`
   - Via: `Via Roma`
   - Civico: `45`
   - [Altri campi...]
4. Salva e verifica che:
   - Prezzo mostrato: `150.000 €` ✅
   - Riferimento visibile: `Rif: IMM001` ✅
   - Indirizzo visibile: `Via Roma, 45` ✅

---

## 📊 CONFRONTO PRIMA/DOPO

### PRIMA:
```
Appartamento Centro
Tarquinia · appartamento
150€  ← SBAGLIATO!
3 camere · 2 bagni · 120m²
```

### DOPO:
```
Rif: IMM001  ← NUOVO!
Appartamento Centro
📍 Tarquinia Centro · appartamento
Via Roma, 45  ← NUOVO!
150.000 €  ← CORRETTO!
🛏️ 3 cam · 🚿 2 bagni · 📐 120m²
```

---

## 🎯 VANTAGGI

✅ **Riferimento univoco** - Facile da cercare e condividere
✅ **Indirizzo completo** - Via e civico per localizzazione precisa
✅ **Zone organizzate** - Dropdown previene errori di battitura
✅ **Prezzo leggibile** - Formato italiano standard
✅ **Bot più smart** - Può cercare per codice, zona, via
✅ **User experience** - Form più chiaro e intuitivo

---

**Versione:** 2.2  
**Data:** 11 Novembre 2025  
**Status:** ✅ Completato e testato

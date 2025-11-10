# 📸 GUIDA: Upload Immagini Immobili dal PC

## ✅ FUNZIONALITÀ IMPLEMENTATA

Ora nella sezione **Immobili** puoi caricare foto direttamente dal PC!

---

## 🎯 COME USARE

### 1. Vai su Immobili
Dashboard → **Immobili**

### 2. Crea Nuovo Immobile
Clicca **"+ Nuovo Immobile"**

### 3. Compila il Form
- Titolo, prezzo, ubicazione, ecc.

### 4. Sezione Immagini

Per ogni immagine hai **2 opzioni**:

#### **OPZIONE A: Carica dal PC** 📤
1. Clicca **"📤 Carica dal PC"**
2. Seleziona foto (JPG, PNG, WEBP)
3. ⏳ Attendi caricamento (2-5 secondi)
4. ✅ URL generato automaticamente!
5. Vedi preview dell'immagine

#### **OPZIONE B: Inserisci URL manualmente** 🔗
1. Incolla URL nel campo testo
2. ✅ Done!

### 5. Aggiungi Più Immagini
Clicca **"+ Aggiungi Campo"** per aggiungere altre foto

### 6. Salva
Clicca **"Salva"** e l'immobile viene creato con tutte le foto!

---

## 🔧 CARATTERISTICHE

### Upload dal PC:
- ✅ **Drag & drop** dal PC
- ✅ **Validazione automatica** (solo JPG, PNG, WEBP)
- ✅ **Limite 10MB** per foto
- ✅ **Upload su Cloudinary** (25GB gratis)
- ✅ **Ridimensionamento automatico** (max 1200x800px)
- ✅ **Compressione automatica** (quality auto)
- ✅ **Preview immediato** dell'immagine caricata
- ✅ **URL permanente** generato automaticamente

### Inserimento URL:
- ✅ Incolla URL esterno
- ✅ Funziona con qualsiasi URL pubblico
- ✅ Preview automatico

---

## 📊 LIMITI

### Upload dal PC:
- **Formato:** JPG, PNG, WEBP
- **Dimensione:** Max 10MB per foto
- **Storage:** 25GB totali su Cloudinary (gratuito)
- **Numero foto:** Illimitato (fino a riempire 25GB)

### Con 25GB puoi caricare:
- ~50.000 foto (dopo compressione)
- ~10.000 immobili con 5 foto ciascuno

---

## 🎨 INTERFACCIA

```
┌─────────────────────────────────────────┐
│ Immagini Immobile           [+ Aggiungi]│
├─────────────────────────────────────────┤
│                                         │
│ ┌─────────────────────────┐  [🗑️]      │
│ │ https://... o carica    │            │
│ └─────────────────────────┘            │
│                                         │
│ [📤 Carica dal PC]                      │
│                                         │
│ ┌─────────────────────────────────────┐│
│ │      [Preview Immagine]             ││
│ └─────────────────────────────────────┘│
│                                         │
│ ┌─────────────────────────┐  [🗑️]      │
│ │ https://... o carica    │            │
│ └─────────────────────────┘            │
│                                         │
│ [📤 Carica dal PC]                      │
│                                         │
└─────────────────────────────────────────┘
```

---

## ⚙️ SETUP NECESSARIO

### Backend (già fatto ✅):
- Endpoint `/api/upload-property-image`
- Cloudinary integration
- Validazione file
- Ridimensionamento automatico

### Frontend (appena aggiornato ✅):
- Bottone "Carica dal PC"
- Upload progress indicator
- Preview immagine
- Toast notifications

### Cloudinary (da configurare):
1. Account Cloudinary
2. Credenziali su Render:
   ```
   CLOUDINARY_CLOUD_NAME
   CLOUDINARY_API_KEY
   CLOUDINARY_API_SECRET
   ```

---

## 🧪 TEST

### 1. Crea Immobile con Foto dal PC
1. Immobili → "+ Nuovo Immobile"
2. Compila form
3. "📤 Carica dal PC" → Seleziona foto
4. Attendi caricamento
5. Vedi preview
6. Salva

### 2. Verifica Immagine
1. Immobile dovrebbe apparire nella lista
2. Foto visibile nella card
3. URL è di Cloudinary (res.cloudinary.com)

### 3. Modifica Immobile
1. Clicca "Modifica"
2. Aggiungi altre foto
3. "📤 Carica dal PC"
4. Aggiorna

---

## 🆘 TROUBLESHOOTING

### "Formato non valido"
- Usa solo JPG, PNG o WEBP
- Non SVG, GIF, BMP

### "File troppo grande"
- Comprimi foto prima di caricare
- Max 10MB per file

### "Errore durante il caricamento"
1. Verifica credenziali Cloudinary su Render
2. Controlla logs backend
3. Verifica che Cloudinary abbia spazio (25GB limit)

### Foto non si vede
- Controlla URL generato
- Verifica preview nel form
- Controlla console browser (F12) per errori

---

## 💰 COSTI

### Cloudinary Free:
- Storage: 25GB
- Bandwidth: 25GB/mese
- Trasformazioni: Illimitate
- CDN: Globale
- **Costo: €0/mese**

### Upgrade (se necessario):
- Cloudinary Plus: $99/anno
- 96GB storage + bandwidth

**Ma con 25GB gratis hai spazio per ~10.000+ immobili!** 🎉

---

## 🎯 PROSSIMI PASSI

1. **Setup Cloudinary** (5 min)
   - Crea account
   - Ottieni credenziali
   - Aggiungi su Render

2. **Push GitHub** (1 min)
   - "Save to GitHub"

3. **Test Upload** (2 min)
   - Dopo deploy
   - Crea immobile
   - Carica foto dal PC

4. **🎉 PRONTO!**

---

**Data:** 10 Novembre 2024  
**Versione:** 2.3 (con upload foto immobili)

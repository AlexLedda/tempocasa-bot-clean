# Tempocasa Tarquinia Pro - React Native App

App mobile completa per agenti immobiliari e clienti finali.

## 🎯 Due App in Una

### 1. **App Agenti** (Tempocasa Tarquinia Pro)
Gestione completa per agenti immobiliari:
- Dashboard con statistiche
- Gestione appuntamenti (priorità)
- Gestione clienti (priorità)
- Gestione valutazioni (priorità)
- Gestione proprietà
- Messaggi WhatsApp
- Notifiche push
- Impostazioni bot

### 2. **App Clienti** (Tempocasa Tarquinia)
App semplificata per clienti finali:
- Catalogo proprietà
- Ricerca avanzata
- Richiesta appuntamenti
- Richiesta valutazioni
- Preferiti
- Notifiche

---

## 🚀 Setup

### Prerequisites
```bash
# Node.js 18+ e npm/yarn
node -v
npm -v

# Expo CLI
npm install -g expo-cli
```

### Installation
```bash
cd /app/mobile
npm install

# or
yarn install
```

### Development
```bash
# Start Metro bundler
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run on physical device (scan QR with Expo Go)
npm start
```

---

## 📱 Testing con Expo Go

### iOS (iPhone)
1. Scarica "Expo Go" dall'App Store
2. Apri la camera
3. Scansiona il QR code dal terminale
4. L'app si aprirà in Expo Go

### Android
1. Scarica "Expo Go" da Google Play
2. Apri Expo Go
3. Scansiona il QR code
4. L'app si aprirà

---

## 🏗️ Struttura Progetto

```
mobile/
├── App.js                    # Entry point
├── app.json                  # Expo config
├── package.json
├── src/
│   ├── navigation/
│   │   ├── AppNavigator.js   # Main navigation
│   │   ├── AgentNavigator.js # Agent app navigation
│   │   └── ClientNavigator.js# Client app navigation
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.js
│   │   │   └── SplashScreen.js
│   │   ├── agent/
│   │   │   ├── DashboardScreen.js
│   │   │   ├── AppointmentsScreen.js
│   │   │   ├── ClientsScreen.js
│   │   │   ├── ValuationsScreen.js
│   │   │   ├── PropertiesScreen.js
│   │   │   ├── MessagesScreen.js
│   │   │   └── SettingsScreen.js
│   │   └── client/
│   │       ├── HomeScreen.js
│   │       ├── PropertyListScreen.js
│   │       ├── PropertyDetailScreen.js
│   │       ├── FavoritesScreen.js
│   │       └── ProfileScreen.js
│   ├── components/
│   │   ├── common/
│   │   ├── agent/
│   │   └── client/
│   ├── services/
│   │   ├── api.js            # Axios instance
│   │   ├── auth.js           # Auth service
│   │   ├── appointments.js
│   │   ├── clients.js
│   │   ├── valuations.js
│   │   ├── properties.js
│   │   └── notifications.js
│   ├── context/
│   │   ├── AuthContext.js
│   │   └── ThemeContext.js
│   ├── hooks/
│   │   ├── useAuth.js
│   │   └── useTheme.js
│   ├── constants/
│   │   ├── colors.js
│   │   ├── config.js
│   │   └── layout.js
│   └── utils/
│       ├── storage.js        # AsyncStorage wrapper
│       └── helpers.js
└── assets/
    ├── images/
    ├── icons/
    └── fonts/
```

---

## 🎨 Design System

### Colori
- Primary: `#179306` (Verde Tempocasa)
- Secondary: `#10b981`
- Accent: `#f59e0b`
- Background: `#ffffff` / `#1a1a1a` (dark mode)

### Fonts
- Heading: System Bold
- Body: System Regular
- Monospace: System Monospace

---

## 🔐 Autenticazione

### Login
```javascript
POST https://real-estate-whatsapp-bot-8ujx.onrender.com/api/auth/login
{
  "username": "admin",
  "password": "Corneto1."
}
```

### JWT Token
Salvato in AsyncStorage e usato in header Authorization per tutte le richieste API.

---

## 🔔 Notifiche Push

### Firebase Cloud Messaging (FCM)
- Configurato per iOS e Android
- Notifiche per:
  - Nuovi clienti WhatsApp
  - Nuovi appuntamenti
  - Reminder appuntamenti
  - Nuove valutazioni

### Setup
1. Creare progetto Firebase
2. Aggiungere configurazioni iOS/Android
3. Configurare FCM
4. Integrare con backend

---

## 📦 Librerie Principali

```json
{
  "expo": "~51.0.0",
  "react": "18.2.0",
  "react-native": "0.74.0",
  "@react-navigation/native": "^6.1.0",
  "@react-navigation/stack": "^6.3.0",
  "@react-navigation/bottom-tabs": "^6.5.0",
  "axios": "^1.6.0",
  "@react-native-async-storage/async-storage": "^1.21.0",
  "react-native-paper": "^5.12.0",
  "expo-notifications": "~0.28.0",
  "expo-image-picker": "~15.0.0",
  "react-native-chart-kit": "^6.12.0"
}
```

---

## 🚀 Deployment

### Build Production

#### iOS (App Store)
```bash
expo build:ios
# Follow prompts for Apple Developer account
```

#### Android (Google Play)
```bash
expo build:android
# Follow prompts for Google Play Console
```

### Over-The-Air (OTA) Updates
```bash
expo publish
# Pushes updates without app store review
```

---

## 🧪 Testing

### Unit Tests
```bash
npm test
```

### E2E Tests (Detox)
```bash
npm run test:e2e
```

---

## 📱 App Variants

### Agent App
- Accesso completo
- Tutte le funzionalità di gestione
- Dashboard avanzata

### Client App
- Accesso limitato
- Solo visualizzazione e richieste
- UI semplificata

Entrambe condividono lo stesso codebase ma con navigazione e permessi diversi.

---

## 🔧 Configurazione

### Environment Variables
Creare file `.env`:
```
API_BASE_URL=https://real-estate-whatsapp-bot-8ujx.onrender.com
FIREBASE_API_KEY=your_key
FIREBASE_PROJECT_ID=your_project_id
```

---

## 📄 License

Proprietario - Tempocasa Tarquinia

---

## 👥 Team

- Backend API: FastAPI + MongoDB Atlas
- Mobile App: React Native + Expo
- Notifications: Firebase Cloud Messaging

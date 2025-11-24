/**
 * App Configuration
 * Configurazioni globali dell'applicazione
 */

// Determina se siamo in development o production
const ENV = {
  dev: {
    apiUrl: 'http://localhost:8001',
    debug: true,
  },
  prod: {
    apiUrl: 'https://agent-dashboard-82.preview.emergentagent.com',
    debug: false,
  },
};

// Scegli environment basato su __DEV__
const getEnvVars = () => {
  if (__DEV__) {
    return ENV.dev;
  }
  return ENV.prod;
};

export const config = getEnvVars();

// API Configuration
export const API_CONFIG = {
  baseURL: config.apiUrl,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
};

// App Configuration
export const APP_CONFIG = {
  name: 'Tempocasa Tarquinia Pro',
  version: '1.0.0',
  debug: config.debug,
  
  // Pagination
  itemsPerPage: 20,
  
  // Cache
  cacheExpiration: 5 * 60 * 1000, // 5 minutes
  
  // Images
  maxImageSize: 5 * 1024 * 1024, // 5MB
  imageQuality: 0.8,
  
  // Notifications
  notificationChannelId: 'tempocasa-notifications',
  notificationChannelName: 'Tempocasa Notifications',
};

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  AGENT: 'agent',
  VIEWER: 'viewer',
  CLIENT: 'client',
};

// Property Types
export const PROPERTY_TYPES = [
  { value: 'appartamento', label: 'Appartamento' },
  { value: 'villa', label: 'Villa' },
  { value: 'casa', label: 'Casa' },
  { value: 'terreno', label: 'Terreno' },
  { value: 'commerciale', label: 'Commerciale' },
  { value: 'ufficio', label: 'Ufficio' },
  { value: 'garage', label: 'Garage' },
];

// Property Status
export const PROPERTY_STATUS = [
  { value: 'disponibile', label: 'Disponibile', color: '#10b981' },
  { value: 'venduto', label: 'Venduto', color: '#ef4444' },
  { value: 'affittato', label: 'Affittato', color: '#3b82f6' },
  { value: 'riservato', label: 'Riservato', color: '#f59e0b' },
];

// Appointment Status
export const APPOINTMENT_STATUS = [
  { value: 'pending', label: 'In Attesa', color: '#f59e0b' },
  { value: 'confirmed', label: 'Confermato', color: '#10b981' },
  { value: 'cancelled', label: 'Cancellato', color: '#ef4444' },
  { value: 'completed', label: 'Completato', color: '#3b82f6' },
];

// Valuation Status
export const VALUATION_STATUS = [
  { value: 'pending', label: 'In Attesa', color: '#f59e0b' },
  { value: 'in_progress', label: 'In Corso', color: '#3b82f6' },
  { value: 'completed', label: 'Completato', color: '#10b981' },
];

export default config;

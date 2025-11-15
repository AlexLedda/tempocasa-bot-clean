/**
 * Tempocasa Tarquinia Pro - Color System
 * Colori brand e temi dell'applicazione
 */

export const COLORS = {
  // Brand Colors
  primary: '#179306',
  secondary: '#10b981',
  accent: '#f59e0b',
  
  // Semantic Colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  
  // Neutrals - Light Mode
  light: {
    background: '#ffffff',
    surface: '#f9fafb',
    card: '#ffffff',
    text: '#111827',
    textSecondary: '#6b7280',
    border: '#e5e7eb',
    divider: '#f3f4f6',
    placeholder: '#9ca3af',
    disabled: '#d1d5db',
  },
  
  // Neutrals - Dark Mode
  dark: {
    background: '#111827',
    surface: '#1f2937',
    card: '#374151',
    text: '#f9fafb',
    textSecondary: '#9ca3af',
    border: '#4b5563',
    divider: '#374151',
    placeholder: '#6b7280',
    disabled: '#4b5563',
  },
  
  // Status Colors
  status: {
    pending: '#f59e0b',
    confirmed: '#10b981',
    cancelled: '#ef4444',
    completed: '#3b82f6',
  },
  
  // Chart Colors
  chart: {
    primary: '#179306',
    secondary: '#10b981',
    tertiary: '#f59e0b',
    quaternary: '#3b82f6',
    quinary: '#8b5cf6',
  },
};

export const getColorByStatus = (status) => {
  const statusMap = {
    pending: COLORS.status.pending,
    confirmed: COLORS.status.confirmed,
    cancelled: COLORS.status.cancelled,
    completed: COLORS.status.completed,
    disponibile: COLORS.success,
    venduto: COLORS.error,
    affittato: COLORS.info,
  };
  return statusMap[status?.toLowerCase()] || COLORS.primary;
};

export default COLORS;

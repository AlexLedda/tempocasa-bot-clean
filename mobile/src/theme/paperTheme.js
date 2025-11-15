/**
 * React Native Paper Theme
 * Configurazione tema Material Design
 */

import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { COLORS } from '../constants/colors';

export const paperTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: COLORS.primary,
    secondary: COLORS.secondary,
    tertiary: COLORS.accent,
    error: COLORS.error,
    success: COLORS.success,
    warning: COLORS.warning,
    info: COLORS.info,
    background: COLORS.light.background,
    surface: COLORS.light.surface,
    surfaceVariant: COLORS.light.card,
    onSurface: COLORS.light.text,
    onSurfaceVariant: COLORS.light.textSecondary,
    outline: COLORS.light.border,
  },
  roundness: 12,
};

export const paperDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: COLORS.primary,
    secondary: COLORS.secondary,
    tertiary: COLORS.accent,
    error: COLORS.error,
    success: COLORS.success,
    warning: COLORS.warning,
    info: COLORS.info,
    background: COLORS.dark.background,
    surface: COLORS.dark.surface,
    surfaceVariant: COLORS.dark.card,
    onSurface: COLORS.dark.text,
    onSurfaceVariant: COLORS.dark.textSecondary,
    outline: COLORS.dark.border,
  },
  roundness: 12,
};

export default paperTheme;

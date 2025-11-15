/**
 * Authentication Service
 * Gestione login, logout e token management
 */

import { apiClient } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_TOKEN_KEY = '@auth_token';
const USER_DATA_KEY = '@user_data';

/**
 * Login con username e password
 */
export const login = async (username, password) => {
  try {
    const response = await apiClient.post('/api/auth/login', {
      username,
      password,
    });

    const { access_token, user } = response.data;

    // Save token and user data
    await AsyncStorage.multiSet([
      [AUTH_TOKEN_KEY, access_token],
      [USER_DATA_KEY, JSON.stringify(user)],
    ]);

    return {
      success: true,
      token: access_token,
      user,
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      error: error.response?.data?.detail || 'Errore durante il login',
    };
  }
};

/**
 * Logout - Clear auth data
 */
export const logout = async () => {
  try {
    await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, USER_DATA_KEY]);
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get current user data
 */
export const getCurrentUser = async () => {
  try {
    const response = await apiClient.get('/api/auth/me');
    
    // Update stored user data
    await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(response.data));
    
    return {
      success: true,
      user: response.data,
    };
  } catch (error) {
    console.error('Get current user error:', error);
    return {
      success: false,
      error: error.response?.data?.detail || 'Errore recupero utente',
    };
  }
};

/**
 * Get stored token
 */
export const getToken = async () => {
  try {
    return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error('Get token error:', error);
    return null;
  }
};

/**
 * Get stored user data
 */
export const getStoredUser = async () => {
  try {
    const userData = await AsyncStorage.getItem(USER_DATA_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Get stored user error:', error);
    return null;
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = async () => {
  const token = await getToken();
  return !!token;
};

/**
 * Register new user (se necessario)
 */
export const register = async (username, password, fullName, email = null) => {
  try {
    const response = await apiClient.post('/api/auth/register', {
      username,
      password,
      full_name: fullName,
      email,
      role: 'client', // Client by default for registration
    });

    const { access_token, user } = response.data;

    // Save token and user data
    await AsyncStorage.multiSet([
      [AUTH_TOKEN_KEY, access_token],
      [USER_DATA_KEY, JSON.stringify(user)],
    ]);

    return {
      success: true,
      token: access_token,
      user,
    };
  } catch (error) {
    console.error('Register error:', error);
    return {
      success: false,
      error: error.response?.data?.detail || 'Errore durante la registrazione',
    };
  }
};

export default {
  login,
  logout,
  getCurrentUser,
  getToken,
  getStoredUser,
  isAuthenticated,
  register,
};

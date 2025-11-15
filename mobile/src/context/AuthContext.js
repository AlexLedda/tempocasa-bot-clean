/**
 * Authentication Context
 * Gestione globale dello stato di autenticazione
 */

import React, { createContext, useState, useEffect, useContext } from 'react';
import * as authService from '../services/auth';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load user on mount
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const storedUser = await authService.getStoredUser();
      const token = await authService.getToken();

      if (storedUser && token) {
        setUser(storedUser);
        setIsAuthenticated(true);

        // Refresh user data from API
        const result = await authService.getCurrentUser();
        if (result.success) {
          setUser(result.user);
        }
      }
    } catch (error) {
      console.error('Load user error:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const result = await authService.login(username, password);

      if (result.success) {
        setUser(result.user);
        setIsAuthenticated(true);
      }

      return result;
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'Errore durante il login',
      };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return {
        success: false,
        error: 'Errore durante il logout',
      };
    }
  };

  const register = async (username, password, fullName, email) => {
    try {
      const result = await authService.register(username, password, fullName, email);

      if (result.success) {
        setUser(result.user);
        setIsAuthenticated(true);
      }

      return result;
    } catch (error) {
      console.error('Register error:', error);
      return {
        success: false,
        error: 'Errore durante la registrazione',
      };
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    register,
    isAdmin: user?.role === 'admin',
    isAgent: user?.role === 'admin' || user?.role === 'agent',
    isClient: user?.role === 'client',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

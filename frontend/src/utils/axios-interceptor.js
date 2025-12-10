// Frontend API Error Interceptor
// Aggiungere questo codice in App.js per gestire errori API globalmente

import axios from 'axios';

// Configure axios interceptor for error handling
axios.interceptors.response.use(
    response => response,
    error => {
        // Handle 401 Unauthorized - redirect to login
        if (error.response?.status === 401) {
            console.warn('Session expired or unauthorized. Redirecting to login...');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
            return Promise.reject(error);
        }

        // Handle 403 Forbidden
        if (error.response?.status === 403) {
            console.error('Access forbidden:', error.response.data?.detail);
            // Show toast notification
            if (window.toast) {
                window.toast.error(error.response.data?.detail || 'Accesso negato');
            }
        }

        // Handle 500 Server Error
        if (error.response?.status === 500) {
            console.error('Server error:', error);
            if (window.toast) {
                window.toast.error('Errore del server. Riprova più tardi.');
            }
        }

        // Handle network errors
        if (!error.response) {
            console.error('Network error:', error);
            if (window.toast) {
                window.toast.error('Errore di connessione. Controlla la tua rete.');
            }
        }

        return Promise.reject(error);
    }
);

// Set auth token for all requests
const token = localStorage.getItem('token');
if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export default axios;

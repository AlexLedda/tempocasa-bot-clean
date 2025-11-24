import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { User, Mail, Phone, Lock, Save, Upload, Camera } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
      setFormData({
        full_name: response.data.full_name || '',
        email: response.data.email || '',
        phone: response.data.phone || '',
        password: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Errore nel caricamento profilo');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validazione tipo file
    if (!file.type.startsWith('image/')) {
      toast.error('Seleziona un file immagine valido');
      return;
    }

    // Validazione dimensione (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Immagine troppo grande (max 5MB)');
      return;
    }

    try {
      setUploadingAvatar(true);
      const token = localStorage.getItem('token');
      
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(
        `${API_URL}/api/auth/users/${user.id}/avatar`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      toast.success('Foto profilo aggiornata con successo');
      loadProfile(); // Ricarica profilo per mostrare nuovo avatar
      
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error(error.response?.data?.detail || "Errore caricamento foto");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validazione password
    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error('Le password non coincidono');
      return;
    }

    if (formData.password && formData.password.length < 8) {
      toast.error('La password deve essere di almeno 8 caratteri');
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      
      const updateData = {
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone
      };
      
      // Aggiungi password solo se è stata inserita
      if (formData.password) {
        updateData.password = formData.password;
      }

      await axios.put(
        `${API_URL}/api/auth/profile`,
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Profilo aggiornato con successo');
      
      // Ricarica profilo e resetta password fields
      loadProfile();
      setFormData(prev => ({...prev, password: '', confirmPassword: ''}));
      
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.detail || "Errore nell'aggiornamento");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Il Mio Profilo</h1>
        <p className="text-gray-600">Gestisci le tue informazioni personali</p>
      </div>

      {/* User Info Card */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 mb-8 text-white">
        <div className="flex items-center gap-6">
          {/* Avatar */}
          <div className="relative group">
            {user?.avatar ? (
              <img 
                src={user.avatar} 
                alt={user.full_name}
                className="w-24 h-24 rounded-full object-cover border-4 border-white/30"
              />
            ) : (
              <div className="bg-white/20 p-6 rounded-full">
                <User className="w-12 h-12" />
              </div>
            )}
            
            {/* Upload Button Overlay */}
            <label 
              htmlFor="avatar-upload" 
              className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              {uploadingAvatar ? (
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
              ) : (
                <Camera className="w-8 h-8" />
              )}
            </label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
              disabled={uploadingAvatar}
            />
          </div>

          {/* User Info */}
          <div>
            <h2 className="text-2xl font-bold">{user?.full_name}</h2>
            <p className="text-blue-100">@{user?.username}</p>
            <p className="text-sm bg-white/20 px-3 py-1 rounded-full inline-block mt-2">
              {user?.role === 'admin' ? 'Amministratore' : 'Agente'}
            </p>
            <p className="text-sm text-blue-100 mt-2">
              <Camera className="w-4 h-4 inline mr-1" />
              Passa il mouse sulla foto per cambiarla
            </p>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h3 className="text-xl font-bold mb-6">Modifica Informazioni</h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nome Completo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome Completo *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                required
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                placeholder="Mario Rossi"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                placeholder="mario.rossi@email.com"
              />
            </div>
          </div>

          {/* Telefono */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Telefono
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                placeholder="+39 123 456 7890"
              />
            </div>
          </div>

          {/* Divider */}
          <div className="border-t-2 border-gray-200 pt-6">
            <h4 className="text-lg font-semibold mb-4">Cambia Password</h4>
            <p className="text-sm text-gray-600 mb-4">
              Lascia vuoto se non vuoi modificare la password
            </p>
          </div>

          {/* Nuova Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nuova Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                placeholder="Minimo 8 caratteri"
                minLength={8}
              />
            </div>
          </div>

          {/* Conferma Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Conferma Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                placeholder="Ripeti la password"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                Salvataggio...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Salva Modifiche
              </>
            )}
          </button>
        </form>
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Le modifiche al profilo saranno effettive immediatamente. 
          Se cambi la password, dovrai effettuare nuovamente il login.
        </p>
      </div>
    </div>
  );
}

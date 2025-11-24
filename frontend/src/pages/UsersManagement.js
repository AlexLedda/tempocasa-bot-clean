import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Users, UserPlus, Edit, Trash2, Check, X, Shield, User as UserIcon, Download, Camera, Save } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

export default function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    phone: '',
    full_name: '',
    password: '',
    role: 'agent'
  });
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: ''
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/auth/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Errore nel caricamento utenti');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/auth/users`, newUser, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Utente creato con successo');
      setShowCreateModal(false);
      setNewUser({ username: '', email: '', phone: '', full_name: '', password: '', role: 'agent' });
      loadUsers();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Errore nella creazione utente');
    }
  };

  const handleToggleActive = async (userId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/api/auth/users/${userId}/toggle`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Utente ${currentStatus ? 'disabilitato' : 'abilitato'}`);
      loadUsers();
    } catch (error) {
      toast.error("Errore nell'aggiornamento");
    }
  };

  const handleExportUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/auth/users/export`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Crea e scarica file JSON
      const dataStr = JSON.stringify(response.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `users_export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Utenti esportati con successo');
    } catch (error) {
      toast.error("Errore nell'esportazione utenti");
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setEditFormData({
      full_name: user.full_name || '',
      email: user.email || '',
      phone: user.phone || '',
      password: ''
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      const updateData = {
        full_name: editFormData.full_name,
        email: editFormData.email,
        phone: editFormData.phone
      };
      
      // Aggiungi password solo se compilata
      if (editFormData.password) {
        updateData.password = editFormData.password;
      }

      await axios.put(
        `${API_URL}/api/auth/users/${editingUser.id}`,
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Utente aggiornato con successo');
      setShowEditModal(false);
      setEditingUser(null);
      loadUsers();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Errore nell'aggiornamento");
    }
  };

  const handleAvatarUpload = async (e, userId) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Seleziona un file immagine valido');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Immagine troppo grande (max 5MB)');
      return;
    }

    try {
      setUploadingAvatar(true);
      const token = localStorage.getItem('token');
      
      const formData = new FormData();
      formData.append('file', file);

      await axios.post(
        `${API_URL}/api/auth/users/${userId}/avatar`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      toast.success('Foto profilo aggiornata');
      loadUsers();
      
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error(error.response?.data?.detail || "Errore caricamento foto");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (!window.confirm(`Sei sicuro di voler eliminare l'utente ${username}?`)) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/auth/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Utente eliminato');
      loadUsers();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Errore nell'eliminazione");
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestione Utenti</h1>
            <p className="text-gray-600">Gestisci gli agenti e i loro permessi</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExportUsers}
              className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Esporta JSON
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2"
            >
              <UserPlus className="w-5 h-5" />
              Nuovo Utente
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utente
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contatti
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ruolo
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stato
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Azioni
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="relative group">
                        {user.avatar ? (
                          <img 
                            src={user.avatar} 
                            alt={user.full_name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            {user.role === 'admin' ? (
                              <Shield className="w-5 h-5 text-blue-600" />
                            ) : (
                              <UserIcon className="w-5 h-5 text-gray-600" />
                            )}
                          </div>
                        )}
                        {/* Upload Overlay */}
                        <label 
                          htmlFor={`avatar-upload-${user.id}`}
                          className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          {uploadingAvatar ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          ) : (
                            <Camera className="w-4 h-4 text-white" />
                          )}
                        </label>
                        <input
                          id={`avatar-upload-${user.id}`}
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleAvatarUpload(e, user.id)}
                          className="hidden"
                          disabled={uploadingAvatar}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                        <div className="text-sm text-gray-500">@{user.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{user.email || '-'}</div>
                    <div className="text-sm text-gray-500">{user.phone || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {user.role === 'admin' ? 'Admin' : 'Agente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleActive(user.id, user.is_active)}
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full transition-all ${
                        user.is_active
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {user.is_active ? (
                        <>
                          <Check className="w-4 h-4 mr-1" />
                          Attivo
                        </>
                      ) : (
                        <>
                          <X className="w-4 h-4 mr-1" />
                          Disattivo
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Modifica utente"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      {user.role !== 'admin' && (
                        <button
                          onClick={() => handleDeleteUser(user.id, user.username)}
                          className="text-red-600 hover:text-red-900"
                          title="Elimina utente"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-6">Nuovo Utente</h2>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={newUser.full_name}
                  onChange={(e) => setNewUser({...newUser, full_name: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                <input
                  type="text"
                  required
                  value={newUser.username}
                  onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Telefono</label>
                <input
                  type="tel"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ruolo</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                >
                  <option value="agent">Agente</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-xl font-medium hover:bg-gray-50"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-xl font-medium hover:shadow-lg"
                >
                  Crea Utente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Modifica Utente</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingUser(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Avatar Section */}
            <div className="mb-6 flex flex-col items-center">
              <div className="relative group mb-3">
                {editingUser.avatar ? (
                  <img 
                    src={editingUser.avatar} 
                    alt={editingUser.full_name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-blue-100"
                  />
                ) : (
                  <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center border-4 border-blue-200">
                    <UserIcon className="w-12 h-12 text-blue-600" />
                  </div>
                )}
                
                {/* Upload Button Overlay */}
                <label 
                  htmlFor={`edit-avatar-upload-${editingUser.id}`}
                  className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  {uploadingAvatar ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <Camera className="w-8 h-8 text-white" />
                  )}
                </label>
                <input
                  id={`edit-avatar-upload-${editingUser.id}`}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleAvatarUpload(e, editingUser.id)}
                  className="hidden"
                  disabled={uploadingAvatar}
                />
              </div>
              <p className="text-sm text-gray-500 text-center">
                <Camera className="w-4 h-4 inline mr-1" />
                Clicca sulla foto per cambiarla
              </p>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-4">
              {/* Username (readonly) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username (non modificabile)
                </label>
                <input
                  type="text"
                  value={editingUser.username}
                  disabled
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.full_name}
                  onChange={(e) => setEditFormData({...editFormData, full_name: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  placeholder="Mario Rossi"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  placeholder="mario.rossi@email.com"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefono
                </label>
                <input
                  type="tel"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  placeholder="+39 123 456 7890"
                />
              </div>

              {/* Divider */}
              <div className="border-t-2 border-gray-200 pt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Cambia Password</h4>
                <p className="text-xs text-gray-500 mb-3">Lascia vuoto per non modificare</p>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nuova Password
                </label>
                <input
                  type="password"
                  value={editFormData.password}
                  onChange={(e) => setEditFormData({...editFormData, password: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  placeholder="Minimo 8 caratteri"
                  minLength={8}
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingUser(null);
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Salva Modifiche
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

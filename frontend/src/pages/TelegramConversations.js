import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

export default function TelegramConversations() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [conversationDetails, setConversationDetails] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messageText, setMessageText] = useState('');
  const [filter, setFilter] = useState('all'); // all, hot, warm, cold

  useEffect(() => {
    loadConversations();
    loadStats();
  }, []);

  const loadConversations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/telegram/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setConversations(response.data.conversations);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/telegram/dashboard-stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadConversationDetails = async (clientId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/telegram/conversation/${clientId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setConversationDetails(response.data);
      }
    } catch (error) {
      console.error('Error loading conversation details:', error);
    }
  };

  const sendMessage = async () => {
    if (!messageText.trim() || !selectedConversation) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/api/telegram/send-message`,
        {
          chat_id: selectedConversation.chat_id,
          message: messageText
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { chat_id: selectedConversation.chat_id, message: messageText }
        }
      );

      setMessageText('');
      loadConversationDetails(selectedConversation.client_id);
      alert('Messaggio inviato!');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Errore invio messaggio');
    }
  };

  const filteredConversations = conversations.filter(conv => {
    if (filter === 'all') return true;
    if (filter === 'hot') return conv.lead_score >= 70;
    if (filter === 'warm') return conv.lead_score >= 40 && conv.lead_score < 70;
    if (filter === 'cold') return conv.lead_score < 40;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Caricamento conversazioni...</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          💬 Conversazioni Telegram
        </h1>
        <p className="text-gray-600">
          Gestisci tutte le conversazioni del bot in un unico posto
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-gray-500 text-sm">Conversazioni Totali</div>
            <div className="text-2xl font-bold">{stats.totals.conversations}</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg shadow border border-green-200">
            <div className="text-green-700 text-sm">🔥 Lead HOT</div>
            <div className="text-2xl font-bold text-green-700">{stats.leads.hot}</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg shadow border border-yellow-200">
            <div className="text-yellow-700 text-sm">🌡️ Lead WARM</div>
            <div className="text-2xl font-bold text-yellow-700">{stats.leads.warm}</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg shadow border border-blue-200">
            <div className="text-blue-700 text-sm">❄️ Lead COLD</div>
            <div className="text-2xl font-bold text-blue-700">{stats.leads.cold}</div>
          </div>
        </div>
      )}

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversation List */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h2 className="font-bold text-lg mb-3">Conversazioni</h2>
            
            {/* Filter */}
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded text-sm ${
                  filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'
                }`}
              >
                Tutti
              </button>
              <button
                onClick={() => setFilter('hot')}
                className={`px-3 py-1 rounded text-sm ${
                  filter === 'hot' ? 'bg-green-500 text-white' : 'bg-gray-200'
                }`}
              >
                🔥 HOT
              </button>
              <button
                onClick={() => setFilter('warm')}
                className={`px-3 py-1 rounded text-sm ${
                  filter === 'warm' ? 'bg-yellow-500 text-white' : 'bg-gray-200'
                }`}
              >
                🌡️ WARM
              </button>
            </div>
          </div>

          <div className="overflow-y-auto" style={{ maxHeight: '600px' }}>
            {filteredConversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => {
                  setSelectedConversation(conv);
                  loadConversationDetails(conv.client_id);
                }}
                className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                  selectedConversation?.id === conv.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{conv.name}</span>
                      <span className="text-xl">{conv.lead_emoji}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {conv.message_count} messaggi
                      {conv.budget > 0 && ` • €${conv.budget.toLocaleString()}`}
                    </div>
                    <div className="text-sm text-gray-600 mt-2 truncate">
                      {conv.last_message}
                    </div>
                  </div>
                  <div className={`text-xs px-2 py-1 rounded ${
                    conv.lead_score >= 70 ? 'bg-green-100 text-green-700' :
                    conv.lead_score >= 40 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {conv.lead_score}
                  </div>
                </div>
              </div>
            ))}
            
            {filteredConversations.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                Nessuna conversazione trovata
              </div>
            )}
          </div>
        </div>

        {/* Conversation Details */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow">
          {!selectedConversation ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <div className="text-6xl mb-4">💬</div>
                <div>Seleziona una conversazione per visualizzare i dettagli</div>
              </div>
            </div>
          ) : conversationDetails ? (
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-4 border-b bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-bold text-xl">
                      {conversationDetails.client.name} {conversationDetails.client.surname}
                    </h2>
                    <div className="text-sm text-gray-600 mt-1">
                      Score: {conversationDetails.lead_score.temperature} ({conversationDetails.lead_score.score}/100)
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    {conversationDetails.client.email && (
                      <div>📧 {conversationDetails.client.email}</div>
                    )}
                    {conversationDetails.client.budget > 0 && (
                      <div className="font-semibold text-green-600">
                        💰 €{conversationDetails.client.budget.toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>

                {/* Lead Score Reasons */}
                {conversationDetails.lead_score.reasons.length > 0 && (
                  <div className="mt-3 p-3 bg-white rounded border">
                    <div className="text-xs font-semibold text-gray-700 mb-1">
                      Motivi score:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {conversationDetails.lead_score.reasons.map((reason, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                        >
                          {reason}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4" style={{ maxHeight: '400px' }}>
                {conversationDetails.messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`mb-4 flex ${
                      msg.direction === 'outgoing' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        msg.direction === 'outgoing'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-900'
                      }`}
                    >
                      <div className="text-sm">{msg.message}</div>
                      <div
                        className={`text-xs mt-1 ${
                          msg.direction === 'outgoing' ? 'text-blue-100' : 'text-gray-500'
                        }`}
                      >
                        {new Date(msg.timestamp).toLocaleString('it-IT', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Send Message */}
              <div className="p-4 border-t bg-gray-50">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Scrivi un messaggio..."
                    className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!messageText.trim()}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Invia
                  </button>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  💡 Il messaggio sarà inviato direttamente al cliente su Telegram
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-500">Caricamento...</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

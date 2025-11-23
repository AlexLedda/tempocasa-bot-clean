import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { 
  MessageSquare, 
  Save, 
  RefreshCw, 
  Sparkles, 
  Phone, 
  HelpCircle,
  Star,
  Calendar,
  Mail,
  Home,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

// Configurazione dei template con metadati per l'UI
const TEMPLATE_CONFIG = [
  {
    key: 'welcome_message',
    label: 'Messaggio di Benvenuto',
    icon: Sparkles,
    description: 'Primo messaggio che il bot invia quando un utente avvia la conversazione',
    color: 'from-purple-500 to-pink-500',
    defaultValue: 'Benvenuto! 👋 Sono Elettra, l\'assistente virtuale di Tempocasa Tarquinia. Come posso aiutarti oggi?'
  },
  {
    key: 'help_message',
    label: 'Messaggio di Aiuto',
    icon: HelpCircle,
    description: 'Messaggio mostrato quando l\'utente chiede aiuto o digita /help',
    color: 'from-blue-500 to-cyan-500',
    defaultValue: 'Ecco cosa posso fare per te:\n\n/appartamenti - Mostra appartamenti disponibili\n/ville - Mostra ville in vendita\n/contatti - Informazioni di contatto\n/valutazione - Richiedi una valutazione gratuita'
  },
  {
    key: 'contacts_message',
    label: 'Informazioni di Contatto',
    icon: Phone,
    description: 'Messaggio con i contatti dell\'agenzia (comando /contatti)',
    color: 'from-green-500 to-emerald-500',
    defaultValue: '📞 **Contatti Tempocasa Tarquinia**\n\nTelefono: +39 0766 123456\nEmail: info@tempocasa-tarquinia.it\nIndirizzo: Via Roma 123, Tarquinia (VT)\n\nOrari: Lun-Ven 9:00-19:00, Sab 9:00-13:00'
  },
  {
    key: 'valutation_message',
    label: 'Richiesta Valutazione',
    icon: Home,
    description: 'Messaggio per richiedere una valutazione immobiliare',
    color: 'from-orange-500 to-red-500',
    defaultValue: '🏡 **Valutazione Gratuita**\n\nVuoi sapere quanto vale il tuo immobile? Offriamo una valutazione professionale gratuita!\n\nUn nostro esperto ti contatterà entro 24 ore per fissare un appuntamento.'
  },
  {
    key: 'no_properties_message',
    label: 'Nessun Immobile Disponibile',
    icon: AlertCircle,
    description: 'Messaggio mostrato quando non ci sono immobili da mostrare',
    color: 'from-gray-500 to-slate-500',
    defaultValue: 'Al momento non ci sono immobili disponibili in questa categoria. Ti avviserò appena arriveranno nuove opportunità! 🔔'
  },
  {
    key: 'appointment_confirmed',
    label: 'Conferma Appuntamento',
    icon: CheckCircle,
    description: 'Messaggio di conferma appuntamento',
    color: 'from-teal-500 to-green-500',
    defaultValue: '✅ **Appuntamento Confermato!**\n\nIl tuo appuntamento è stato registrato con successo. Riceverai una conferma via email a breve.\n\nA presto!'
  },
  {
    key: 'vip_notification',
    label: 'Notifica VIP (per l\'agente)',
    icon: Star,
    description: 'Messaggio inviato all\'agente quando un lead è classificato come VIP',
    color: 'from-yellow-500 to-amber-500',
    defaultValue: '🌟 **LEAD VIP RILEVATO!**\n\nUn potenziale cliente ad alto valore ha appena interagito con il bot.\n\nScore: {score}/100\nInteresse: {interesse}\nBudget: {budget}'
  },
  {
    key: 'daily_report_header',
    label: 'Intestazione Report Giornaliero',
    icon: Calendar,
    description: 'Intestazione del report giornaliero inviato all\'agente',
    color: 'from-indigo-500 to-purple-500',
    defaultValue: '📊 **Report Giornaliero Elettra**\n\nEcco il riepilogo delle attività di oggi:'
  },
  {
    key: 'takeover_success',
    label: 'Takeover Attivato',
    icon: MessageSquare,
    description: 'Messaggio mostrato quando l\'agente prende il controllo manuale',
    color: 'from-pink-500 to-rose-500',
    defaultValue: '👤 Un operatore umano ha preso in carico la conversazione. A breve riceverai una risposta personalizzata!'
  }
];

export default function MessageTemplates() {
  const [templates, setTemplates] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editedTemplates, setEditedTemplates] = useState({});
  const [activeTemplate, setActiveTemplate] = useState(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/bot-templates`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setTemplates(response.data.templates);
        setEditedTemplates(response.data.templates);
      }
    } catch (error) {
      // Se non ci sono template, inizializza con valori di default
      if (error.response?.status === 404) {
        const defaultTemplates = {};
        TEMPLATE_CONFIG.forEach(config => {
          defaultTemplates[config.key] = config.defaultValue;
        });
        setTemplates(defaultTemplates);
        setEditedTemplates(defaultTemplates);
        toast.info('Template inizializzati con valori predefiniti');
      } else {
        console.error('Error loading templates:', error);
        toast.error('Errore nel caricamento dei template');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateChange = (key, value) => {
    setEditedTemplates(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      
      await axios.put(
        `${API_URL}/api/bot-templates`,
        editedTemplates,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setTemplates(editedTemplates);
      toast.success('✅ Template salvati con successo!');
    } catch (error) {
      console.error('Error saving templates:', error);
      toast.error('❌ Errore nel salvataggio dei template');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = (key) => {
    const config = TEMPLATE_CONFIG.find(c => c.key === key);
    if (config && window.confirm('Vuoi ripristinare il valore predefinito per questo template?')) {
      handleTemplateChange(key, config.defaultValue);
      toast.info('Template ripristinato al valore predefinito');
    }
  };

  const hasChanges = JSON.stringify(templates) !== JSON.stringify(editedTemplates);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento template...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Template Messaggi Bot
            </h1>
            <p className="text-gray-600">
              Personalizza i messaggi che il bot Telegram invia ai tuoi clienti
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={loadTemplates}
              disabled={saving}
              className="px-4 py-2 bg-white border-2 border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className="w-4 h-4" />
              Ricarica
            </button>
            
            <button
              onClick={handleSave}
              disabled={!hasChanges || saving}
              className={`px-6 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${
                hasChanges && !saving
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:scale-105'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Salvataggio...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Salva Modifiche
                </>
              )}
            </button>
          </div>
        </div>

        {hasChanges && (
          <div className="mt-4 bg-amber-50 border-2 border-amber-200 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <p className="text-amber-800 font-medium">
              Hai modifiche non salvate. Clicca su "Salva Modifiche" per applicarle.
            </p>
          </div>
        )}
      </div>

      {/* Template Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {TEMPLATE_CONFIG.map((config) => {
          const Icon = config.icon;
          const value = editedTemplates[config.key] || config.defaultValue;
          const isActive = activeTemplate === config.key;
          const hasChanged = templates[config.key] !== editedTemplates[config.key];

          return (
            <div
              key={config.key}
              className={`bg-white rounded-2xl border-2 transition-all ${
                isActive 
                  ? 'border-blue-400 shadow-xl scale-[1.02]' 
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-lg'
              }`}
            >
              {/* Card Header */}
              <div className={`bg-gradient-to-r ${config.color} p-4 rounded-t-2xl`}>
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{config.label}</h3>
                      <p className="text-sm opacity-90">{config.description}</p>
                    </div>
                  </div>
                  {hasChanged && (
                    <div className="bg-white text-blue-600 px-3 py-1 rounded-full text-xs font-bold">
                      MODIFICATO
                    </div>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5">
                <textarea
                  value={value}
                  onChange={(e) => handleTemplateChange(config.key, e.target.value)}
                  onFocus={() => setActiveTemplate(config.key)}
                  onBlur={() => setActiveTemplate(null)}
                  rows={5}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all resize-none font-mono text-sm leading-relaxed"
                  placeholder={config.defaultValue}
                />
                
                {/* Footer with character count and reset button */}
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-gray-500 font-medium">
                    {value.length} caratteri
                  </span>
                  
                  <button
                    onClick={() => handleReset(config.key)}
                    className="text-xs text-gray-600 hover:text-blue-600 font-medium flex items-center gap-1 transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Ripristina default
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Box */}
      <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="bg-blue-500 p-3 rounded-xl">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-blue-900 mb-2">
              💡 Suggerimenti per i Template
            </h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>• Usa emoji per rendere i messaggi più accattivanti 😊</li>
              <li>• Mantieni un tono professionale ma amichevole</li>
              <li>• I template con variabili (es: {'{score}'}) verranno sostituiti automaticamente</li>
              <li>• Puoi usare Markdown per formattare il testo (**grassetto**, *corsivo*)</li>
              <li>• Testa i messaggi dopo averli salvati per verificare l'impatto</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

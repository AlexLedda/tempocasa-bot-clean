import React, { useState } from 'react';
import axios from 'axios';
import { Home, TrendingUp, Send, CheckCircle } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function Valuation() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    property_type: '',
    location: '',
    square_meters: '',
    bedrooms: '',
    bathrooms: '',
    year_built: '',
    notes: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // In produzione, questo invierebbe i dati al backend
      await axios.post(`${BACKEND_URL}/api/valuations`, formData);
      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        property_type: '',
        location: '',
        square_meters: '',
        bedrooms: '',
        bathrooms: '',
        year_built: '',
        notes: ''
      });
      
      // Reset success message after 5 seconds
      setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      console.error('Error submitting valuation:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <TrendingUp className="w-16 h-16 mx-auto mb-6" />
          <h1 className="text-5xl font-bold mb-6">Valutazione Immobile Gratuita</h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Scopri il valore reale del tuo immobile con una valutazione professionale e gratuita da parte dei nostri esperti
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Info Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-lg space-y-6">
              <h3 className="text-xl font-bold text-gray-900">Perché richiedere una valutazione?</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Valutazione Accurata</h4>
                    <p className="text-sm text-gray-600">Basata su dati di mercato reali e aggiornati</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Completamente Gratuita</h4>
                    <p className="text-sm text-gray-600">Nessun costo, nessun impegno</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Esperti del Territorio</h4>
                    <p className="text-sm text-gray-600">Conoscenza approfondita del mercato locale</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Risposta Rapida</h4>
                    <p className="text-sm text-gray-600">Ti contatteremo entro 24 ore</p>
                  </div>
                </div>
              </div>

              <div className="bg-primary-50 border-2 border-primary-200 rounded-xl p-4 mt-6">
                <p className="text-sm text-gray-700">
                  <strong>Nota:</strong> La valutazione è indicativa e non costituisce impegno all'acquisto o alla vendita.
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              {submitted && (
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 mb-6 flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-green-900 mb-1">Richiesta Inviata!</h3>
                    <p className="text-green-700">
                      Grazie per averci contattato. Un nostro esperto ti contatterà entro 24 ore per fissare un appuntamento.
                    </p>
                  </div>
                </div>
              )}

              <h2 className="text-2xl font-bold text-gray-900 mb-6">Compila il modulo</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Dati Personali */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Dati Personali</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Nome e Cognome *"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
                    />
                    <input
                      type="email"
                      placeholder="Email *"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
                    />
                    <input
                      type="tel"
                      placeholder="Telefono *"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none md:col-span-2"
                    />
                  </div>
                </div>

                {/* Dati Immobile */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Dati Immobile</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select
                      required
                      value={formData.property_type}
                      onChange={(e) => setFormData({...formData, property_type: e.target.value})}
                      className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
                    >
                      <option value="">Tipo Immobile *</option>
                      <option value="Appartamento">Appartamento</option>
                      <option value="Villa">Villa</option>
                      <option value="Casa Indipendente">Casa Indipendente</option>
                      <option value="Terreno">Terreno</option>
                      <option value="Altro">Altro</option>
                    </select>

                    <input
                      type="text"
                      placeholder="Località/Indirizzo *"
                      required
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
                    />

                    <input
                      type="number"
                      placeholder="Superficie (m²) *"
                      required
                      value={formData.square_meters}
                      onChange={(e) => setFormData({...formData, square_meters: e.target.value})}
                      className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
                    />

                    <input
                      type="number"
                      placeholder="Numero Camere"
                      value={formData.bedrooms}
                      onChange={(e) => setFormData({...formData, bedrooms: e.target.value})}
                      className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
                    />

                    <input
                      type="number"
                      placeholder="Numero Bagni"
                      value={formData.bathrooms}
                      onChange={(e) => setFormData({...formData, bathrooms: e.target.value})}
                      className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
                    />

                    <input
                      type="number"
                      placeholder="Anno di Costruzione"
                      value={formData.year_built}
                      onChange={(e) => setFormData({...formData, year_built: e.target.value})}
                      className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Note Aggiuntive */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Note Aggiuntive</h3>
                  <textarea
                    placeholder="Descrivi ulteriori dettagli sull'immobile (stato, ristrutturazioni, pertinenze, ecc.)"
                    rows={4}
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Invio in corso...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Richiedi Valutazione Gratuita
                    </>
                  )}
                </button>

                <p className="text-sm text-gray-500 text-center">
                  * Campi obbligatori
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
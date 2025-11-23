import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

const TELEGRAM_BOT = process.env.REACT_APP_TELEGRAM_BOT;

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // In produzione, questo invierebbe i dati al backend
    console.log('Contact form:', formData);
    setSubmitted(true);
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    setTimeout(() => setSubmitted(false), 5000);
  };

  // Coordinate Tarquinia - Viale Luigi Dasti, 6
  const position = [42.250587, 11.756567];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">Contattaci</h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Siamo qui per aiutarti a trovare la casa dei tuoi sogni. Contattaci per qualsiasi informazione!
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info & Map */}
          <div className="space-y-8">
            {/* Contact Cards */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Informazioni di Contatto</h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary-100 p-3 rounded-xl">
                    <MapPin className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Indirizzo</h3>
                    <p className="text-gray-600">Viale Luigi Dasti, 6</p>
                    <p className="text-gray-600">01016 Tarquinia (VT)</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-primary-100 p-3 rounded-xl">
                    <Phone className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Telefono</h3>
                    <a href="tel:+390766180585" className="text-primary-600 hover:underline block">
                      0766 180585 (Fisso)
                    </a>
                    <a href="tel:+393515290147" className="text-primary-600 hover:underline block">
                      351 529 0147 (Mobile)
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-primary-100 p-3 rounded-xl">
                    <Mail className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                    <a href="mailto:tarquinia@tempocasa.it" className="text-primary-600 hover:underline">
                      tarquinia@tempocasa.it
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-primary-100 p-3 rounded-xl">
                    <Clock className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Orari di Apertura</h3>
                    <p className="text-gray-600">Lunedì - Venerdì: 9:00 - 19:00</p>
                    <p className="text-gray-600">Sabato: 9:00 - 13:00</p>
                    <p className="text-gray-600">Domenica: Chiuso</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <a
                  href={`https://t.me/${TELEGRAM_BOT}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  <Send className="w-5 h-5" />
                  Chat con Elettra su Telegram
                </a>
              </div>
            </div>

            {/* Map */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Dove Siamo</h3>
              <div className="rounded-xl overflow-hidden" style={{ height: '350px' }}>
                <MapContainer
                  center={position}
                  zoom={15}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <Marker position={position}>
                    <Popup>
                      <strong>Tempocasa Tarquinia</strong><br />
                      Viale Luigi Dasti, 6<br />
                      Tarquinia (VT)
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            {submitted && (
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-6 flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-green-900 mb-1">Messaggio Inviato!</h3>
                  <p className="text-green-700 text-sm">Ti risponderemo al più presto.</p>
                </div>
              </div>
            )}

            <h2 className="text-2xl font-bold text-gray-900 mb-6">Inviaci un Messaggio</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="tel"
                  placeholder="Telefono *"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Oggetto"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
                />
              </div>

              <textarea
                placeholder="Messaggio *"
                required
                rows={6}
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
              />

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                Invia Messaggio
              </button>

              <p className="text-sm text-gray-500 text-center">* Campi obbligatori</p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
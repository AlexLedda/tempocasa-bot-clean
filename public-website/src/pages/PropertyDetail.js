import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { MapPin, Bed, Bath, Square, Home, Calendar, Tag, ArrowLeft, Phone, Mail, Send, Check } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const TELEGRAM_BOT = process.env.REACT_APP_TELEGRAM_BOT;

// Fix leaflet icon issue
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function PropertyDetail() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [formSubmitted, setFormSubmitted] = useState(false);

  useEffect(() => {
    loadProperty();
  }, [id]);

  const loadProperty = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/properties/${id}`);
      setProperty(response.data);
    } catch (error) {
      console.error('Error loading property:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Contact form:', contactForm);
      setFormSubmitted(true);
      setTimeout(() => setFormSubmitted(false), 3000);
      setContactForm({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Immobile non trovato</h2>
        <Link to="/immobili" className="text-primary-600 hover:underline">
          Torna al catalogo
        </Link>
      </div>
    );
  }

  const images = property.images && property.images.length > 0 
    ? property.images 
    : ['https://images.unsplash.com/photo-1629964332682-ca2b0b369f42?w=1200'];

  const lat = property.latitude || 42.2496;
  const lng = property.longitude || 11.7567;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link to="/immobili" className="text-primary-600 hover:text-primary-700 flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Torna agli immobili
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
              <div className="relative h-[500px]">
                <img
                  src={images[selectedImage]}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 bg-white text-primary-600 px-6 py-3 rounded-full font-bold text-2xl shadow-lg">
                  €{property.price?.toLocaleString()}
                </div>
              </div>
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-2 p-4 bg-gray-50">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === index ? 'border-primary-600 scale-105' : 'border-gray-200 hover:border-primary-300'
                      }`}
                    >
                      <img src={img} alt={`Vista ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{property.title}</h1>
              <p className="text-gray-600 flex items-center gap-2 text-lg mb-6">
                <MapPin className="w-5 h-5 text-primary-600" />
                {property.location}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {property.bedrooms && (
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <Bed className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                    <p className="font-bold text-lg">{property.bedrooms}</p>
                    <p className="text-sm text-gray-600">Camere</p>
                  </div>
                )}
                {property.bathrooms && (
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <Bath className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                    <p className="font-bold text-lg">{property.bathrooms}</p>
                    <p className="text-sm text-gray-600">Bagni</p>
                  </div>
                )}
                {property.square_meters && (
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <Square className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                    <p className="font-bold text-lg">{property.square_meters}m²</p>
                    <p className="text-sm text-gray-600">Superficie</p>
                  </div>
                )}
                {property.property_type && (
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <Tag className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                    <p className="font-bold text-lg">{property.property_type}</p>
                    <p className="text-sm text-gray-600">Tipo</p>
                  </div>
                )}
              </div>

              {property.description && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Descrizione</h2>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-line">{property.description}</p>
                </div>
              )}

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Dettagli</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {property.year_built && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Calendar className="w-5 h-5 text-primary-600" />
                      <div>
                        <p className="text-sm text-gray-600">Anno di costruzione</p>
                        <p className="font-semibold">{property.year_built}</p>
                      </div>
                    </div>
                  )}
                  {property.status && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Check className="w-5 h-5 text-primary-600" />
                      <div>
                        <p className="text-sm text-gray-600">Stato</p>
                        <p className="font-semibold">{property.status}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Posizione</h2>
              <div className="rounded-xl overflow-hidden" style={{ height: '400px' }}>
                <MapContainer
                  center={[lat, lng]}
                  zoom={15}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <Marker position={[lat, lng]}>
                    <Popup>{property.location}</Popup>
                  </Marker>
                </MapContainer>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-lg sticky top-24 space-y-6">
              <h3 className="text-xl font-bold text-gray-900">Richiedi Informazioni</h3>

              {formSubmitted && (
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 text-green-700 text-sm">
                  ✓ Messaggio inviato! Ti contatteremo presto.
                </div>
              )}

              <form onSubmit={handleContactSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Nome e Cognome"
                  required
                  value={contactForm.name}
                  onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
                />
                <input
                  type="email"
                  placeholder="Email"
                  required
                  value={contactForm.email}
                  onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
                />
                <input
                  type="tel"
                  placeholder="Telefono"
                  required
                  value={contactForm.phone}
                  onChange={(e) => setContactForm({...contactForm, phone: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
                />
                <textarea
                  placeholder="Messaggio..."
                  rows={4}
                  value={contactForm.message}
                  onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Invia Richiesta
                </button>
              </form>

              <div className="border-t-2 border-gray-100 pt-6 space-y-4">
                <h4 className="font-bold text-gray-900">Oppure contattaci</h4>
                <a
                  href="tel:+390766123456"
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Phone className="w-5 h-5 text-primary-600" />
                  <span>+39 0766 123456</span>
                </a>
                <a
                  href="mailto:info@tempocasa-tarquinia.it"
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Mail className="w-5 h-5 text-primary-600" />
                  <span>info@tempocasa-tarquinia.it</span>
                </a>
                <a
                  href={`https://t.me/${TELEGRAM_BOT}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg hover:shadow-lg transition-all"
                >
                  <Send className="w-5 h-5" />
                  <span>Chat con Elettra</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

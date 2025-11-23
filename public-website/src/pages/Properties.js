import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { MapPin, Bed, Bath, Square, Home, SlidersHorizontal, X } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function Properties() {
  const [searchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    property_type: searchParams.get('tipo') || '',
    price_min: '',
    price_max: searchParams.get('prezzo_max') || '',
    location: searchParams.get('location') || '',
    bedrooms: '',
    bathrooms: '',
    square_meters_min: ''
  });

  useEffect(() => {
    loadProperties();
  }, [filters]);

  const loadProperties = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/api/properties`);
      let filtered = response.data;

      // Apply filters
      if (filters.property_type) {
        filtered = filtered.filter(p => p.property_type === filters.property_type);
      }
      if (filters.price_min) {
        filtered = filtered.filter(p => p.price >= parseInt(filters.price_min));
      }
      if (filters.price_max) {
        filtered = filtered.filter(p => p.price <= parseInt(filters.price_max));
      }
      if (filters.location) {
        filtered = filtered.filter(p => p.location?.toLowerCase().includes(filters.location.toLowerCase()));
      }
      if (filters.bedrooms) {
        filtered = filtered.filter(p => p.bedrooms >= parseInt(filters.bedrooms));
      }
      if (filters.bathrooms) {
        filtered = filtered.filter(p => p.bathrooms >= parseInt(filters.bathrooms));
      }
      if (filters.square_meters_min) {
        filtered = filtered.filter(p => p.square_meters >= parseInt(filters.square_meters_min));
      }

      setProperties(filtered);
    } catch (error) {
      console.error('Error loading properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setFilters({
      property_type: '',
      price_min: '',
      price_max: '',
      location: '',
      bedrooms: '',
      bathrooms: '',
      square_meters_min: ''
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Immobili in Vendita</h1>
          <p className="text-xl opacity-90">Trova la casa perfetta tra {properties.length} immobili disponibili</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters - Desktop */}
          <div className="hidden lg:block lg:w-80">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Filtri</h2>
                <button
                  onClick={resetFilters}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Reset
                </button>
              </div>

              <div className="space-y-4">
                {/* Tipo Immobile */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo Immobile</label>
                  <select
                    value={filters.property_type}
                    onChange={(e) => setFilters({...filters, property_type: e.target.value})}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                  >
                    <option value="">Tutti</option>
                    <option value="Appartamento">Appartamento</option>
                    <option value="Villa">Villa</option>
                    <option value="Casa Indipendente">Casa Indipendente</option>
                    <option value="Terreno">Terreno</option>
                  </select>
                </div>

                {/* Prezzo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prezzo (€)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.price_min}
                      onChange={(e) => setFilters({...filters, price_min: e.target.value})}
                      className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.price_max}
                      onChange={(e) => setFilters({...filters, price_max: e.target.value})}
                      className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Località */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Località</label>
                  <input
                    type="text"
                    placeholder="es. Tarquinia"
                    value={filters.location}
                    onChange={(e) => setFilters({...filters, location: e.target.value})}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                  />
                </div>

                {/* Camere */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Camere da letto (min)</label>
                  <select
                    value={filters.bedrooms}
                    onChange={(e) => setFilters({...filters, bedrooms: e.target.value})}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                  >
                    <option value="">Tutte</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                  </select>
                </div>

                {/* Bagni */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bagni (min)</label>
                  <select
                    value={filters.bathrooms}
                    onChange={(e) => setFilters({...filters, bathrooms: e.target.value})}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                  >
                    <option value="">Tutti</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                  </select>
                </div>

                {/* Superficie */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Superficie min (m²)</label>
                  <input
                    type="number"
                    placeholder="es. 80"
                    value={filters.square_meters_min}
                    onChange={(e) => setFilters({...filters, square_meters_min: e.target.value})}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Filters Button */}
          <div className="lg:hidden fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40">
            <button
              onClick={() => setShowFilters(true)}
              className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 font-semibold"
            >
              <SlidersHorizontal className="w-5 h-5" />
              Filtri
            </button>
          </div>

          {/* Mobile Filters Modal */}
          {showFilters && (
            <div className="lg:hidden fixed inset-0 bg-black/50 z-50 flex items-end">
              <div className="bg-white w-full rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Filtri</h2>
                  <button onClick={() => setShowFilters(false)}>
                    <X className="w-6 h-6" />
                  </button>
                </div>
                {/* Same filters as sidebar */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tipo Immobile</label>
                    <select
                      value={filters.property_type}
                      onChange={(e) => setFilters({...filters, property_type: e.target.value})}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg"
                    >
                      <option value="">Tutti</option>
                      <option value="Appartamento">Appartamento</option>
                      <option value="Villa">Villa</option>
                      <option value="Casa Indipendente">Casa Indipendente</option>
                      <option value="Terreno">Terreno</option>
                    </select>
                  </div>
                  {/* Add other mobile filters... */}
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={resetFilters}
                    className="flex-1 py-3 border-2 border-gray-300 rounded-lg font-medium"
                  >
                    Reset
                  </button>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="flex-1 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg font-medium"
                  >
                    Applica
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Properties Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              </div>
            ) : properties.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl">
                <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Nessun immobile trovato</h3>
                <p className="text-gray-600 mb-6">Prova a modificare i filtri di ricerca</p>
                <button
                  onClick={resetFilters}
                  className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
                >
                  Reset Filtri
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {properties.map((property) => (
                  <Link
                    key={property.id}
                    to={`/immobili/${property.id}`}
                    className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
                  >
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={property.images?.[0] || 'https://images.unsplash.com/photo-1629964332682-ca2b0b369f42?w=600'}
                        alt={property.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute top-4 right-4 bg-white text-primary-600 px-4 py-2 rounded-full font-bold text-lg shadow-lg">
                        €{property.price?.toLocaleString()}
                      </div>
                      {property.property_type && (
                        <div className="absolute top-4 left-4 bg-secondary-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                          {property.property_type}
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                        {property.title}
                      </h3>
                      <p className="text-gray-600 flex items-center gap-2 mb-4">
                        <MapPin className="w-4 h-4 text-primary-600" />
                        {property.location}
                      </p>
                      <div className="flex items-center gap-6 text-sm text-gray-600 pt-4 border-t border-gray-100">
                        {property.bedrooms && (
                          <span className="flex items-center gap-1.5">
                            <Bed className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">{property.bedrooms}</span>
                          </span>
                        )}
                        {property.bathrooms && (
                          <span className="flex items-center gap-1.5">
                            <Bath className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">{property.bathrooms}</span>
                          </span>
                        )}
                        {property.square_meters && (
                          <span className="flex items-center gap-1.5">
                            <Square className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">{property.square_meters}m²</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

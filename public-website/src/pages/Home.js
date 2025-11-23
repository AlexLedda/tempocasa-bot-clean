import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Search, Home as HomeIcon, TrendingUp, Award, CheckCircle, ArrowRight, Star, MapPin, Bed, Bath, Square } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function Home() {
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [searchFilters, setSearchFilters] = useState({
    tipo: '',
    prezzo_max: '',
    location: ''
  });

  useEffect(() => {
    loadFeaturedProperties();
  }, []);

  const loadFeaturedProperties = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/properties`);
      // Prendi i primi 6 immobili
      setFeaturedProperties(response.data.slice(0, 6));
    } catch (error) {
      console.error('Error loading properties:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Redirect to properties page with filters
    const params = new URLSearchParams();
    if (searchFilters.tipo) params.append('tipo', searchFilters.tipo);
    if (searchFilters.prezzo_max) params.append('prezzo_max', searchFilters.prezzo_max);
    if (searchFilters.location) params.append('location', searchFilters.location);
    window.location.href = `/immobili?${params.toString()}`;
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section 
        className="relative h-[600px] flex items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://images.unsplash.com/photo-1697107533957-f7e5073bcd77?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBob3VzZSUyMGl0YWx5fGVufDB8fHxibHVlfDE3NjM5MTc1MDZ8MA&ixlib=rb-4.1.0&q=85')`
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white relative z-10">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
            Trova la Casa dei Tuoi Sogni
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-200">
            A Tarquinia e dintorni, con l'esperienza e la professionalità di Tempocasa
          </p>

          {/* Search Bar */}
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-4xl mx-auto">
            <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <select
                value={searchFilters.tipo}
                onChange={(e) => setSearchFilters({...searchFilters, tipo: e.target.value})}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none text-gray-700"
              >
                <option value="">Tipo Immobile</option>
                <option value="Appartamento">Appartamento</option>
                <option value="Villa">Villa</option>
                <option value="Casa Indipendente">Casa Indipendente</option>
                <option value="Terreno">Terreno</option>
              </select>

              <input
                type="number"
                placeholder="Prezzo Max"
                value={searchFilters.prezzo_max}
                onChange={(e) => setSearchFilters({...searchFilters, prezzo_max: e.target.value})}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none text-gray-700"
              />

              <input
                type="text"
                placeholder="Località"
                value={searchFilters.location}
                onChange={(e) => setSearchFilters({...searchFilters, location: e.target.value})}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none text-gray-700"
              />

              <button
                type="submit"
                className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-2"
              >
                <Search className="w-5 h-5" />
                Cerca
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Servizi */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">I Nostri Servizi</h2>
            <p className="text-xl text-gray-600">Soluzioni complete per ogni tua esigenza immobiliare</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Servizio 1 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all hover:scale-105">
              <div className="bg-gradient-to-br from-primary-500 to-primary-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <HomeIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Vendita Immobili</h3>
              <p className="text-gray-600 mb-6">
                Ampia selezione di immobili in vendita a Tarquinia: case, ville, appartamenti e terreni.
              </p>
              <Link to="/immobili" className="text-primary-600 font-semibold flex items-center gap-2 hover:gap-3 transition-all">
                Scopri di più <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            {/* Servizio 2 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all hover:scale-105">
              <div className="bg-gradient-to-br from-secondary-500 to-secondary-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Valutazioni Gratuite</h3>
              <p className="text-gray-600 mb-6">
                Scopri il valore reale del tuo immobile con una valutazione professionale e gratuita.
              </p>
              <Link to="/valutazione" className="text-secondary-600 font-semibold flex items-center gap-2 hover:gap-3 transition-all">
                Richiedi ora <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            {/* Servizio 3 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all hover:scale-105">
              <div className="bg-gradient-to-br from-green-500 to-green-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Consulenza Completa</h3>
              <p className="text-gray-600 mb-6">
                Assistenza a 360° per acquisto, vendita, mutui e pratiche burocratiche.
              </p>
              <Link to="/contatti" className="text-green-600 font-semibold flex items-center gap-2 hover:gap-3 transition-all">
                Contattaci <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Immobili in Evidenza */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Immobili in Evidenza</h2>
            <p className="text-xl text-gray-600">Le nostre migliori proposte selezionate per te</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProperties.map((property) => (
              <Link
                key={property.id}
                to={`/immobili/${property.id}`}
                className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={property.images?.[0] || 'https://images.unsplash.com/photo-1629964332682-ca2b0b369f42?w=600'}
                    alt={property.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4 bg-primary-600 text-white px-4 py-2 rounded-full font-bold text-lg shadow-lg">
                    €{property.price?.toLocaleString()}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                    {property.title}
                  </h3>
                  <p className="text-gray-600 flex items-center gap-2 mb-4">
                    <MapPin className="w-4 h-4 text-primary-600" />
                    {property.location}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    {property.bedrooms && (
                      <span className="flex items-center gap-1">
                        <Bed className="w-4 h-4" />
                        {property.bedrooms}
                      </span>
                    )}
                    {property.bathrooms && (
                      <span className="flex items-center gap-1">
                        <Bath className="w-4 h-4" />
                        {property.bathrooms}
                      </span>
                    )}
                    {property.square_meters && (
                      <span className="flex items-center gap-1">
                        <Square className="w-4 h-4" />
                        {property.square_meters}m²
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/immobili"
              className="inline-block bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-lg transition-all hover:scale-105"
            >
              Vedi Tutti gli Immobili
            </Link>
          </div>
        </div>
      </section>

      {/* Perché Sceglierci */}
      <section className="py-20 bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Perché Scegliere Tarquinia</h2>
            <p className="text-xl text-gray-600">Storia, cultura e qualità della vita nella Maremma Laziale</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <CheckCircle className="w-10 h-10 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Storia Millenaria</h3>
              <p className="text-gray-600">Necropoli etrusche, musei e patrimonio UNESCO</p>
            </div>

            <div className="text-center">
              <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Star className="w-10 h-10 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Posizione Strategica</h3>
              <p className="text-gray-600">Vicino alla via Aurelia e ai collegamenti principali</p>
            </div>

            <div className="text-center">
              <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <HomeIcon className="w-10 h-10 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Servizi Completi</h3>
              <p className="text-gray-600">Scuole, ospedale, impianti sportivi e negozi</p>
            </div>

            <div className="text-center">
              <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Award className="w-10 h-10 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Qualità della Vita</h3>
              <p className="text-gray-600">Tra storia, natura e Maremma Laziale</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Pronto a Trovare la Tua Casa Ideale?</h2>
          <p className="text-xl mb-8 opacity-90">
            Contattaci oggi per una consulenza gratuita o scopri subito i nostri immobili
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/immobili"
              className="bg-white text-primary-600 px-8 py-4 rounded-full font-semibold text-lg hover:shadow-lg transition-all hover:scale-105"
            >
              Esplora Immobili
            </Link>
            <Link
              to="/contatti"
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-primary-600 transition-all hover:scale-105"
            >
              Contattaci Ora
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

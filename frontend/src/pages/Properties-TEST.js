import { useState, useEffect } from "react";
import axios from "axios";
import { API } from "../App";
import { Plus, Trash2, X, Building2, MapPin, Bed, Bath, Square } from "lucide-react";
import { toast } from "sonner";

export default function Properties() {
  const [properties, setProperties] = useState([]);
  const [showForm, setShowForm] = useState(false);

  console.log("🔵 Properties component rendered");
  console.log("🔵 showForm state:", showForm);

  useEffect(() => {
    console.log("🔵 useEffect: Loading properties");
    loadProperties();
  }, []);

  useEffect(() => {
    console.log("🔵 showForm changed:", showForm);
  }, [showForm]);

  const loadProperties = async () => {
    try {
      const response = await axios.get(`${API}/properties`);
      console.log("🔵 Properties loaded:", response.data);
      setProperties(response.data);
    } catch (error) {
      console.error("❌ Error loading properties:", error);
      toast.error("Errore nel caricamento immobili");
    }
  };

  const handleButtonClick = () => {
    console.log("🟢 BUTTON CLICKED!");
    console.log("🟢 Current showForm:", showForm);
    setShowForm(true);
    console.log("🟢 setShowForm(true) called");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Immobili</h1>
          <p className="text-gray-600 mt-2">Gestisci il tuo portfolio immobiliare</p>
        </div>
        <button
          onClick={handleButtonClick}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
          style={{ cursor: 'pointer', zIndex: 10, position: 'relative' }}
        >
          <Plus className="w-5 h-5" />
          <span>Aggiungi Immobile</span>
        </button>
      </div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-2">Nessun immobile ancora</p>
            <p className="text-gray-500 text-sm">Clicca su "Aggiungi Immobile" per iniziare</p>
          </div>
        ) : (
          properties.map((property) => (
            <div key={property.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-blue-100 to-indigo-100 relative">
                {property.images && property.images.length > 0 ? (
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    className="w-full h-full object-cover"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Building2 className="w-16 h-16 text-blue-300" />
                  </div>
                )}
              </div>

              <div className="p-4">
                <h3 className="font-bold text-lg text-gray-900 mb-1">{property.title}</h3>
                <div className="flex items-center text-gray-600 text-sm mb-3">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{property.location}</span>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <Bed className="w-4 h-4 mr-1" />
                    <span>{property.bedrooms}</span>
                  </div>
                  <div className="flex items-center">
                    <Bath className="w-4 h-4 mr-1" />
                    <span>{property.bathrooms}</span>
                  </div>
                  <div className="flex items-center">
                    <Square className="w-4 h-4 mr-1" />
                    <span>{property.square_meters}m²</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <p className="text-2xl font-bold text-blue-600">
                    €{property.price?.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal TEST */}
      {showForm && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
          onClick={() => {
            console.log("🟡 Backdrop clicked");
            setShowForm(false);
          }}
        >
          <div 
            style={{
              backgroundColor: 'white',
              padding: '40px',
              borderRadius: '16px',
              maxWidth: '500px',
              width: '90%'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
              ✅ MODALE APERTA!
            </h2>
            <p style={{ marginBottom: '20px' }}>
              Il form funziona! Ora sto per creare il form completo.
            </p>
            <button
              onClick={() => {
                console.log("🟡 Close button clicked");
                setShowForm(false);
              }}
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Chiudi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from "react";
import axios from "axios";
import { API } from "../App";
import { toast } from "sonner";
import { Building2, Plus, X, Save, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function PropertiesNew() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    location: "",
    bedrooms: "",
    bathrooms: "",
    square_meters: "",
    property_type: "appartamento",
    status: "disponibile",
    images: [""]
  });

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const response = await axios.get(`${API}/properties`);
      setProperties(response.data);
    } catch (error) {
      toast.error("Errore nel caricamento degli immobili");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const propertyData = {
      ...formData,
      price: parseFloat(formData.price),
      bedrooms: parseInt(formData.bedrooms),
      bathrooms: parseInt(formData.bathrooms),
      square_meters: parseFloat(formData.square_meters),
      images: formData.images.filter(img => img.trim() !== "")
    };

    try {
      if (editingId) {
        await axios.put(`${API}/properties/${editingId}`, propertyData);
        toast.success("Immobile aggiornato!");
      } else {
        await axios.post(`${API}/properties`, propertyData);
        toast.success("Immobile aggiunto!");
      }
      fetchProperties();
      resetForm();
    } catch (error) {
      toast.error("Errore nel salvataggio");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Sei sicuro di voler eliminare questo immobile?")) {
      try {
        await axios.delete(`${API}/properties/${id}`);
        toast.success("Immobile eliminato!");
        fetchProperties();
      } catch (error) {
        toast.error("Errore nell'eliminazione");
      }
    }
  };

  const handleEdit = (property) => {
    setFormData({
      title: property.title,
      description: property.description,
      price: property.price.toString(),
      location: property.location,
      bedrooms: property.bedrooms.toString(),
      bathrooms: property.bathrooms.toString(),
      square_meters: property.square_meters.toString(),
      property_type: property.property_type,
      status: property.status,
      images: property.images.length > 0 ? property.images : [""]
    });
    setEditingId(property.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      price: "",
      location: "",
      bedrooms: "",
      bathrooms: "",
      square_meters: "",
      property_type: "appartamento",
      status: "disponibile",
      images: [""]
    });
    setEditingId(null);
    setShowForm(false);
  };

  const addImageField = () => {
    setFormData({
      ...formData,
      images: [...formData.images, ""]
    });
  };

  const removeImageField = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      images: newImages.length > 0 ? newImages : [""]
    });
  };

  const updateImageField = (index, value) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData({
      ...formData,
      images: newImages
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Immobili</h1>
          <p className="text-lg text-gray-600">Gestisci il tuo portafoglio immobiliare</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
        >
          {showForm ? <X className="w-5 h-5 mr-2" /> : <Plus className="w-5 h-5 mr-2" />}
          {showForm ? "Chiudi" : "Nuovo Immobile"}
        </Button>
      </div>

      {showForm && (
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle>{editingId ? "Modifica Immobile" : "Nuovo Immobile"}</CardTitle>
            <CardDescription>Compila tutti i campi per aggiungere un immobile</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Titolo *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="property_type">Tipo Immobile *</Label>
                  <select
                    id="property_type"
                    value={formData.property_type}
                    onChange={(e) => setFormData({ ...formData, property_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="appartamento">Appartamento</option>
                    <option value="villa">Villa</option>
                    <option value="ufficio">Ufficio</option>
                    <option value="negozio">Negozio</option>
                    <option value="terreno">Terreno</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="price">Prezzo (€) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="location">Ubicazione *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="bedrooms">Camere *</Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    value={formData.bedrooms}
                    onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="bathrooms">Bagni *</Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    value={formData.bathrooms}
                    onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="square_meters">Metri Quadri *</Label>
                  <Input
                    id="square_meters"
                    type="number"
                    step="0.01"
                    value={formData.square_meters}
                    onChange={(e) => setFormData({ ...formData, square_meters: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="status">Stato *</Label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="disponibile">Disponibile</option>
                    <option value="venduto">Venduto</option>
                    <option value="riservato">Riservato</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descrizione *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Immagini (URL)</Label>
                  <Button type="button" onClick={addImageField} size="sm" variant="outline">
                    <Plus className="w-4 h-4 mr-1" /> Aggiungi
                  </Button>
                </div>
                {formData.images.map((img, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="https://esempio.com/immagine.jpg"
                      value={img}
                      onChange={(e) => updateImageField(index, e.target.value)}
                    />
                    {formData.images.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeImageField(index)}
                        size="sm"
                        variant="destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <Button type="submit" className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  {editingId ? "Aggiorna" : "Salva"}
                </Button>
                <Button type="button" onClick={resetForm} variant="outline">
                  Annulla
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            {property.images && property.images.length > 0 && property.images[0] && (
              <div className="h-48 overflow-hidden bg-gray-200">
                <img
                  src={property.images[0]}
                  alt={property.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/400x300?text=Immobile";
                  }}
                />
              </div>
            )}
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl">{property.title}</CardTitle>
                  <CardDescription className="mt-1">
                    {property.location} · {property.property_type}
                  </CardDescription>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  property.status === "disponibile" ? "bg-green-100 text-green-800" :
                  property.status === "venduto" ? "bg-red-100 text-red-800" :
                  "bg-yellow-100 text-yellow-800"
                }`}>
                  {property.status}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-600 mb-3">
                €{property.price.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {property.description}
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                <span>🛏️ {property.bedrooms}</span>
                <span>🚿 {property.bathrooms}</span>
                <span>📐 {property.square_meters}m²</span>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleEdit(property)}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Modifica
                </Button>
                <Button
                  onClick={() => handleDelete(property.id)}
                  variant="destructive"
                  size="sm"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {properties.length === 0 && !showForm && (
        <Card className="p-12 text-center">
          <Building2 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Nessun immobile presente
          </h3>
          <p className="text-gray-500 mb-4">
            Inizia aggiungendo il tuo primo immobile al portafoglio
          </p>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-5 h-5 mr-2" />
            Aggiungi Immobile
          </Button>
        </Card>
      )}
    </div>
  );
}

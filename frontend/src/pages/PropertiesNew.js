import { useState, useEffect } from "react";
import axios from "axios";
import { API } from "../App";
import { toast } from "sonner";
import { Building2, Plus, X, Save, Trash2, Edit, Upload, ChevronUp, ChevronDown, GripVertical } from "lucide-react";
import { PROPERTY_TYPES, CATEGORIE_CATASTALI } from '../data/propertyTypes';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Funzione per formattare il prezzo
const formatPrice = (price) => {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};

export default function PropertiesNew() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const [availableZones, setAvailableZones] = useState([]);
  const [showZoneSuggestions, setShowZoneSuggestions] = useState(false);
  const [formData, setFormData] = useState({
    reference: "",
    title: "",
    description: "",
    price: "",
    location: "",
    street: "",
    street_number: "",
    bedrooms: "",
    bathrooms: "",
    square_meters: "",
    property_type: "",
    property_subtype: "",
    categoria_catastale: "",
    rendita_catastale: "",
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
      
      // Estrai zone uniche dagli immobili esistenti
      const zones = [...new Set(response.data.map(p => p.location).filter(Boolean))];
      setAvailableZones(zones.sort());
    } catch (error) {
      toast.error("Errore nel caricamento degli immobili");
    } finally {
      setLoading(false);
    }
  };
  
  // Filtra zone in base all'input
  const getFilteredZones = () => {
    if (!formData.location) return availableZones;
    return availableZones.filter(zone => 
      zone.toLowerCase().includes(formData.location.toLowerCase())
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const propertyData = {
      ...formData,
      price: parseFloat(formData.price),
      bedrooms: parseInt(formData.bedrooms),
      bathrooms: parseInt(formData.bathrooms),
      square_meters: parseFloat(formData.square_meters),
      images: formData.images.filter(img => img.trim() !== ""),
      // Converti stringhe vuote in null per campi opzionali
      property_subtype: formData.property_subtype?.trim() || null,
      categoria_catastale: formData.categoria_catastale?.trim() || null,
      rendita_catastale: formData.rendita_catastale?.trim() ? parseFloat(formData.rendita_catastale) : null,
      reference: formData.reference?.trim() || null,
      street: formData.street?.trim() || null,
      street_number: formData.street_number?.trim() || null
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
      console.error("Errore dettagliato:", error.response?.data);
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
      reference: property.reference || "",
      title: property.title,
      description: property.description,
      price: property.price.toString(),
      location: property.location,
      street: property.street || "",
      street_number: property.street_number || "",
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
      reference: "",
      title: "",
      description: "",
      price: "",
      location: "",
      street: "",
      street_number: "",
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

  const moveImageUp = (index) => {
    if (index === 0) return; // Già in prima posizione
    const newImages = [...formData.images];
    [newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]];
    setFormData({
      ...formData,
      images: newImages
    });
  };

  const moveImageDown = (index) => {
    if (index === formData.images.length - 1) return; // Già in ultima posizione
    const newImages = [...formData.images];
    [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
    setFormData({
      ...formData,
      images: newImages
    });
  };

  // Drag and drop handlers
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (index !== draggedIndex) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newImages = [...formData.images];
    const [draggedImage] = newImages.splice(draggedIndex, 1);
    newImages.splice(dropIndex, 0, draggedImage);

    setFormData({
      ...formData,
      images: newImages
    });

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const updateImageField = (index, value) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData({
      ...formData,
      images: newImages
    });
  };

  const handleImageUpload = async (index, e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Formato non valido. Usa JPG, PNG o WEBP');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Il file è troppo grande. Massimo 10MB');
      return;
    }

    setUploadingImage(true);
    setUploadingIndex(index);

    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API}/upload-property-image`, formDataUpload, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
      });

      const newImages = [...formData.images];
      newImages[index] = response.data.url;
      setFormData({
        ...formData,
        images: newImages
      });

      toast.success('Immagine caricata con successo!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Errore durante il caricamento');
    } finally {
      setUploadingImage(false);
      setUploadingIndex(null);
    }
  };

  const handleMultipleImageUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (!files.length) return;

    if (files.length > 50) {
      toast.error('Massimo 50 immagini per volta');
      return;
    }

    // Validate each file
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const validFiles = [];
    
    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        toast.error(`${file.name}: formato non valido`);
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name}: troppo grande (max 10MB)`);
        continue;
      }
      validFiles.push(file);
    }

    if (!validFiles.length) {
      toast.error('Nessun file valido selezionato');
      return;
    }

    setUploadingImage(true);
    toast.info(`Caricamento di ${validFiles.length} immagini...`);

    const formDataUpload = new FormData();
    validFiles.forEach(file => {
      formDataUpload.append('files', file);
    });

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API}/upload-property-images-multiple`, formDataUpload, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
      });

      if (response.data.uploaded > 0) {
        // Aggiungi le immagini caricate
        const uploadedUrls = response.data.results.map(r => r.url);
        
        // Rimuovi campi vuoti esistenti
        const existingImages = formData.images.filter(img => img);
        
        // Combina immagini esistenti con nuove
        const allImages = [...existingImages, ...uploadedUrls];
        
        setFormData({
          ...formData,
          images: allImages
        });

        toast.success(`${response.data.uploaded} immagini caricate con successo!`);
        
        if (response.data.failed > 0) {
          toast.warning(`${response.data.failed} immagini non caricate`);
        }
      } else {
        toast.error('Nessuna immagine caricata');
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Errore durante il caricamento multiplo');
    } finally {
      setUploadingImage(false);
      // Reset input
      event.target.value = '';
    }
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
                  <Label htmlFor="reference">Riferimento (Codice Annuncio)</Label>
                  <Input
                    id="reference"
                    value={formData.reference}
                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                    placeholder="es: IMM001, A123, PROP-456"
                  />
                </div>

                {/* Tipo Immobile */}
                <div>
                  <Label htmlFor="property_type">Tipo Immobile *</Label>
                  <select
                    id="property_type"
                    value={formData.property_type}
                    onChange={(e) => setFormData({ ...formData, property_type: e.target.value, property_subtype: "" })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Seleziona tipo...</option>
                    {Object.keys(PROPERTY_TYPES).map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Sottocategoria (appare solo dopo aver selezionato il tipo) */}
                {formData.property_type && PROPERTY_TYPES[formData.property_type] && (
                  <div className="animate-fadeIn">
                    <Label htmlFor="property_subtype">Sottocategoria *</Label>
                    <select
                      id="property_subtype"
                      value={formData.property_subtype}
                      onChange={(e) => setFormData({ ...formData, property_subtype: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Seleziona sottocategoria...</option>
                      {PROPERTY_TYPES[formData.property_type].map(subtype => (
                        <option key={subtype} value={subtype}>{subtype}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Categoria Catastale */}
                <div>
                  <Label htmlFor="categoria_catastale">Categoria Catastale</Label>
                  <select
                    id="categoria_catastale"
                    value={formData.categoria_catastale}
                    onChange={(e) => setFormData({ ...formData, categoria_catastale: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleziona categoria...</option>
                    {Object.entries(CATEGORIE_CATASTALI).map(([gruppo, categorie]) => (
                      <optgroup key={gruppo} label={gruppo}>
                        {categorie.map(cat => (
                          <option key={cat} value={cat.split(' - ')[0]}>{cat}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                {/* Rendita Catastale */}
                <div>
                  <Label htmlFor="rendita_catastale">Rendita Catastale (€)</Label>
                  <Input
                    id="rendita_catastale"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Es: 450.00"
                    value={formData.rendita_catastale}
                    onChange={(e) => setFormData({ ...formData, rendita_catastale: e.target.value })}
                  />
                  <p className="text-xs text-gray-500 mt-1">Inserire la rendita catastale annua in euro</p>
                </div>

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
                  <Label htmlFor="price">Prezzo (€) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="150000"
                    required
                  />
                </div>

                <div className="relative">
                  <Label htmlFor="location">Zona *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => {
                      setFormData({ ...formData, location: e.target.value });
                      setShowZoneSuggestions(true);
                    }}
                    onFocus={() => setShowZoneSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowZoneSuggestions(false), 200)}
                    placeholder="es: Tarquinia Centro, Lido, etc..."
                    required
                  />
                  {showZoneSuggestions && getFilteredZones().length > 0 && formData.location && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {getFilteredZones().map(zone => (
                        <div
                          key={zone}
                          className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm"
                          onClick={() => {
                            setFormData({ ...formData, location: zone });
                            setShowZoneSuggestions(false);
                          }}
                        >
                          📍 {zone}
                        </div>
                      ))}
                    </div>
                  )}
                  {availableZones.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      💡 Digita o seleziona dalle zone già usate
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="street">Via</Label>
                  <Input
                    id="street"
                    value={formData.street}
                    onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                    placeholder="Via Roma"
                  />
                </div>

                <div>
                  <Label htmlFor="street_number">Civico</Label>
                  <Input
                    id="street_number"
                    value={formData.street_number}
                    onChange={(e) => setFormData({ ...formData, street_number: e.target.value })}
                    placeholder="123"
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

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Immagini Immobile</Label>
                    <p className="text-sm text-gray-500 mt-1">
                      🎯 Trascina le foto per riordinarle • La prima foto è quella principale
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      multiple
                      onChange={handleMultipleImageUpload}
                      className="hidden"
                      id="multiple-image-upload"
                      disabled={uploadingImage}
                    />
                    <label htmlFor="multiple-image-upload">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={uploadingImage}
                        onClick={() => document.getElementById('multiple-image-upload').click()}
                        className="bg-green-50 hover:bg-green-100 text-green-700 border-green-300"
                      >
                        {uploadingImage ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
                            Caricamento...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            📤 Carica Multiple
                          </>
                        )}
                      </Button>
                    </label>
                    <Button
                      type="button"
                      onClick={addImageField}
                      size="sm"
                      variant="outline"
                    >
                      ➕ Aggiungi URL
                    </Button>
                  </div>
                </div>
                {/* Griglia Drag and Drop */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {formData.images.filter(img => img).map((img, index) => (
                    <div
                      key={index}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, index)}
                      onDragEnd={handleDragEnd}
                      className={`
                        relative group cursor-move border-2 rounded-xl overflow-hidden bg-white
                        transition-all duration-200 hover:shadow-lg
                        ${draggedIndex === index ? 'opacity-50 scale-95' : 'opacity-100'}
                        ${dragOverIndex === index ? 'border-blue-500 scale-105' : 'border-gray-200'}
                        ${index === 0 ? 'ring-2 ring-blue-400' : ''}
                      `}
                      style={{ aspectRatio: '4/3' }}
                    >
                      {/* Badge Numero e Principale */}
                      <div className="absolute top-2 left-2 z-10 flex gap-1">
                        <span className="bg-black/70 text-white text-xs font-bold px-2 py-1 rounded-full">
                          #{index + 1}
                        </span>
                        {index === 0 && (
                          <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            ⭐ Principale
                          </span>
                        )}
                      </div>

                      {/* Icona Drag */}
                      <div className="absolute top-2 right-2 z-10 bg-black/50 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                        <GripVertical className="w-4 h-4 text-white" />
                      </div>

                      {/* Pulsante Elimina */}
                      <button
                        type="button"
                        onClick={() => removeImageField(index)}
                        className="absolute bottom-2 right-2 z-10 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Elimina foto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      {/* Immagine */}
                      <img 
                        src={img} 
                        alt={`Foto ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%" y="50%" text-anchor="middle" dy=".3em"%3ENessuna immagine%3C/text%3E%3C/svg%3E';
                        }}
                      />

                      {/* Overlay drag */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    </div>
                  ))}

                  {/* Placeholder "Aggiungi Foto" */}
                  <label
                    htmlFor="add-photo-input"
                    className="border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all group"
                    style={{ aspectRatio: '4/3' }}
                  >
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      multiple
                      onChange={handleMultipleImageUpload}
                      className="hidden"
                      id="add-photo-input"
                      disabled={uploadingImage}
                    />
                    <Upload className="w-8 h-8 text-gray-400 group-hover:text-blue-500 mb-2" />
                    <span className="text-sm text-gray-500 group-hover:text-blue-600 font-medium">
                      Aggiungi foto
                    </span>
                  </label>
                </div>

                {/* Sezione per aggiungere URL manualmente (collassabile) */}
                {formData.images.some(img => !img) && (
                  <div className="mt-4 space-y-2 border-t pt-4">
                    <p className="text-sm font-medium text-gray-700 mb-3">📎 Aggiungi foto via URL</p>
                    {formData.images.map((img, index) => (
                      !img && (
                        <div key={index} className="flex gap-2">
                          <Input
                            placeholder="https://esempio.com/immagine.jpg"
                            value={img}
                            onChange={(e) => updateImageField(index, e.target.value)}
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            onClick={() => removeImageField(index)}
                            size="sm"
                            variant="outline"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      )
                    ))}
                  </div>
                )}
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
                  {property.reference && (
                    <div className="text-xs font-mono text-gray-500 mb-1">
                      Rif: {property.reference}
                    </div>
                  )}
                  <CardTitle className="text-xl">{property.title}</CardTitle>
                  <CardDescription className="mt-1">
                    📍 {property.location} · {property.property_type}
                    {property.street && (
                      <span className="block mt-1 text-xs">
                        {property.street}{property.street_number && `, ${property.street_number}`}
                      </span>
                    )}
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
                {formatPrice(property.price)}
              </p>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {property.description}
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                <span>🛏️ {property.bedrooms} cam</span>
                <span>🚿 {property.bathrooms} bagni</span>
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

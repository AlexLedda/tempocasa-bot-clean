import { useState, useEffect } from "react";
import axios from "axios";
import { API, applyPrimaryColor } from "../App";
import { toast } from "sonner";
import { Settings, Bot, Building2, Save, Palette, Upload, Image as ImageIcon, Trash2, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function BotSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [settings, setSettings] = useState({
    bot_name: "Emma",
    agency_name: "Agenzia Immobiliare",
    primary_color: "#3b82f6",
    secondary_color: "#10b981",
    accent_color: "#f59e0b",
    logo_url: "",
  });

  // Logo upload method state
  const [logoUploadMethod, setLogoUploadMethod] = useState("upload"); // 'upload', 'url', 'default'
  const [tempLogoUrl, setTempLogoUrl] = useState("");

  // Colori predefiniti
  const presetColors = [
    { name: "Blu", color: "#3b82f6" },
    { name: "Indigo", color: "#6366f1" },
    { name: "Verde", color: "#10b981" },
    { name: "Teal", color: "#14b8a6" },
    { name: "Viola", color: "#8b5cf6" },
    { name: "Rosa", color: "#ec4899" },
    { name: "Rosso", color: "#ef4444" },
    { name: "Arancione", color: "#f97316" },
    { name: "Giallo", color: "#eab308" },
    { name: "Grigio", color: "#6b7280" },
  ];

  // Temi predefiniti con 3 colori
  const presetThemes = [
    { 
      name: "Classico Blu", 
      primary: "#3b82f6", 
      secondary: "#10b981", 
      accent: "#f59e0b" 
    },
    { 
      name: "Moderno Viola", 
      primary: "#8b5cf6", 
      secondary: "#ec4899", 
      accent: "#f59e0b" 
    },
    { 
      name: "Elegante Grigio", 
      primary: "#6b7280", 
      secondary: "#10b981", 
      accent: "#3b82f6" 
    },
    { 
      name: "Fresco Verde", 
      primary: "#10b981", 
      secondary: "#14b8a6", 
      accent: "#3b82f6" 
    },
    { 
      name: "Caldo Arancione", 
      primary: "#f97316", 
      secondary: "#ef4444", 
      accent: "#eab308" 
    },
  ];

  // Logo predefinito Tempocasa
  const defaultLogoUrl = "https://www.tempocasa.it/themes/custom/tempocasa/logo.svg";

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API}/settings`);
      setSettings(response.data);
      // Applica il colore salvato
      if (response.data.primary_color) {
        applyPrimaryColor(response.data.primary_color);
      }
    } catch (error) {
      toast.error("Errore nel caricamento delle impostazioni");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(`${API}/settings`, settings);
      // Applica il nuovo colore
      applyPrimaryColor(settings.primary_color);
      toast.success("Impostazioni salvate! Le modifiche sono attive.");
    } catch (error) {
      toast.error("Errore nel salvataggio");
    } finally {
      setSaving(false);
    }
  };

  const handleColorChange = (color, type = "primary") => {
    const newSettings = { ...settings };
    if (type === "primary") {
      newSettings.primary_color = color;
      applyPrimaryColor(color);
    } else if (type === "secondary") {
      newSettings.secondary_color = color;
    } else if (type === "accent") {
      newSettings.accent_color = color;
    }
    setSettings(newSettings);
  };

  const handleThemeChange = (theme) => {
    setSettings({
      ...settings,
      primary_color: theme.primary,
      secondary_color: theme.secondary,
      accent_color: theme.accent,
    });
    applyPrimaryColor(theme.primary);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Formato non valido. Usa JPG, PNG, WEBP o SVG');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Il file è troppo grande. Massimo 5MB');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API}/upload-logo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setSettings({ ...settings, logo_url: response.data.url });
      toast.success('Logo caricato con successo!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Errore durante il caricamento');
    } finally {
      setUploading(false);
    }
  };

  const handleUrlUpload = () => {
    if (!tempLogoUrl.trim()) {
      toast.error('Inserisci un URL valido');
      return;
    }
    setSettings({ ...settings, logo_url: tempLogoUrl });
    setTempLogoUrl("");
    toast.success('Logo aggiornato!');
  };

  const handleDefaultLogo = () => {
    setSettings({ ...settings, logo_url: defaultLogoUrl });
    toast.success('Logo predefinito Tempocasa applicato!');
  };

  const handleRemoveLogo = () => {
    setSettings({ ...settings, logo_url: "" });
    toast.success('Logo rimosso');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="settings-page">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Impostazioni Bot</h1>
        <p className="text-lg text-gray-600">Personalizza il tuo assistente WhatsApp</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bot Configuration */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${settings.primary_color} 0%, ${settings.primary_color}dd 100%)` }}>
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle>Configurazione Bot</CardTitle>
                <CardDescription>Personalizza nome e identità dell'assistente</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="bot_name">Nome Assistente</Label>
              <Input
                id="bot_name"
                value={settings.bot_name}
                onChange={(e) => setSettings({ ...settings, bot_name: e.target.value })}
                placeholder="Emma"
                data-testid="bot-name-input"
              />
              <p className="text-xs text-gray-500 mt-1">
                Il nome che l'assistente userà nelle conversazioni
              </p>
            </div>

            <div>
              <Label htmlFor="agency_name">Nome Agenzia</Label>
              <Input
                id="agency_name"
                value={settings.agency_name}
                onChange={(e) => setSettings({ ...settings, agency_name: e.target.value })}
                placeholder="Agenzia Immobiliare"
                data-testid="agency-name-input"
              />
              <p className="text-xs text-gray-500 mt-1">
                Nome della tua agenzia immobiliare
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Logo Upload */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${settings.primary_color} 0%, ${settings.primary_color}dd 100%)` }}>
                <ImageIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle>Logo Agenzia</CardTitle>
                <CardDescription>Carica il logo della tua agenzia</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Logo Preview */}
            {settings.logo_url && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium">Anteprima Logo</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveLogo}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="bg-white rounded-lg p-4 flex items-center justify-center">
                  <img 
                    src={settings.logo_url} 
                    alt="Logo" 
                    className="max-h-20 max-w-full object-contain"
                    onError={(e) => {
                      // Previeni loop infinito: rimuovi il gestore onError e usa un placeholder SVG
                      e.target.onerror = null;
                      e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150'%3E%3Crect fill='%23e5e7eb' width='150' height='150'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial, sans-serif' font-size='14' fill='%239ca3af'%3ELogo%3C/text%3E%3C/svg%3E";
                      toast.error("Errore nel caricamento del logo");
                    }}
                  />
                </div>
              </div>
            )}

            {/* Upload Method Selection */}
            <div>
              <Label className="mb-2">Metodo di caricamento</Label>
              <div className="flex gap-2">
                <Button
                  variant={logoUploadMethod === "upload" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setLogoUploadMethod("upload")}
                  className="flex-1"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Da PC
                </Button>
                <Button
                  variant={logoUploadMethod === "url" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setLogoUploadMethod("url")}
                  className="flex-1"
                >
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Da URL
                </Button>
                <Button
                  variant={logoUploadMethod === "default" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setLogoUploadMethod("default")}
                  className="flex-1"
                >
                  <Building2 className="w-4 h-4 mr-2" />
                  Default
                </Button>
              </div>
            </div>

            {/* Upload from PC */}
            {logoUploadMethod === "upload" && (
              <div>
                <Label htmlFor="logo-upload" className="cursor-pointer">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-gray-400 transition-colors text-center">
                    {uploading ? (
                      <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                        <p className="text-sm text-gray-600">Caricamento in corso...</p>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                          Clicca per caricare o trascina qui
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          JPG, PNG, WEBP, SVG (max 5MB)
                        </p>
                      </>
                    )}
                  </div>
                </Label>
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/svg+xml"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </div>
            )}

            {/* Upload from URL */}
            {logoUploadMethod === "url" && (
              <div className="space-y-2">
                <Label htmlFor="logo-url">URL del logo</Label>
                <div className="flex gap-2">
                  <Input
                    id="logo-url"
                    value={tempLogoUrl}
                    onChange={(e) => setTempLogoUrl(e.target.value)}
                    placeholder="https://esempio.com/logo.png"
                    className="flex-1"
                  />
                  <Button onClick={handleUrlUpload} size="sm">
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Carica
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Inserisci l'URL pubblico del tuo logo
                </p>
              </div>
            )}

            {/* Default Logo */}
            {logoUploadMethod === "default" && (
              <div className="space-y-3">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-sm text-blue-800 mb-3">
                    Usa il logo predefinito Tempocasa
                  </p>
                  <Button 
                    onClick={handleDefaultLogo}
                    className="w-full"
                    style={{ background: `linear-gradient(135deg, ${settings.primary_color} 0%, ${settings.primary_color}dd 100%)` }}
                  >
                    <Building2 className="w-4 h-4 mr-2" />
                    Usa Logo Tempocasa
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Theme Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${settings.primary_color} 0%, ${settings.primary_color}dd 100%)` }}>
              <Palette className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle>Tema e Colori</CardTitle>
              <CardDescription>Personalizza l'aspetto completo dell'applicazione</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Preset Themes */}
          <div>
            <Label className="mb-3 block">Temi Predefiniti</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {presetThemes.map((theme) => (
                <button
                  key={theme.name}
                  onClick={() => handleThemeChange(theme)}
                  className={`p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                    settings.primary_color === theme.primary &&
                    settings.secondary_color === theme.secondary &&
                    settings.accent_color === theme.accent
                      ? "border-gray-900 ring-2 ring-gray-900"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex gap-1 mb-2">
                    <div className="w-full h-8 rounded" style={{ backgroundColor: theme.primary }}></div>
                    <div className="w-full h-8 rounded" style={{ backgroundColor: theme.secondary }}></div>
                    <div className="w-full h-8 rounded" style={{ backgroundColor: theme.accent }}></div>
                  </div>
                  <p className="text-xs font-medium text-gray-700 text-center">{theme.name}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Colors */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Primary Color */}
            <div>
              <Label>Colore Primario</Label>
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="color"
                  value={settings.primary_color}
                  onChange={(e) => handleColorChange(e.target.value, "primary")}
                  className="w-12 h-12 rounded-lg border-2 border-gray-200 cursor-pointer"
                />
                <Input
                  value={settings.primary_color}
                  onChange={(e) => handleColorChange(e.target.value, "primary")}
                  placeholder="#3b82f6"
                  className="flex-1"
                />
              </div>
            </div>

            {/* Secondary Color */}
            <div>
              <Label>Colore Secondario</Label>
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="color"
                  value={settings.secondary_color}
                  onChange={(e) => handleColorChange(e.target.value, "secondary")}
                  className="w-12 h-12 rounded-lg border-2 border-gray-200 cursor-pointer"
                />
                <Input
                  value={settings.secondary_color}
                  onChange={(e) => handleColorChange(e.target.value, "secondary")}
                  placeholder="#10b981"
                  className="flex-1"
                />
              </div>
            </div>

            {/* Accent Color */}
            <div>
              <Label>Colore Accent</Label>
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="color"
                  value={settings.accent_color}
                  onChange={(e) => handleColorChange(e.target.value, "accent")}
                  className="w-12 h-12 rounded-lg border-2 border-gray-200 cursor-pointer"
                />
                <Input
                  value={settings.accent_color}
                  onChange={(e) => handleColorChange(e.target.value, "accent")}
                  placeholder="#f59e0b"
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          {/* Color Preview */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-700 font-medium mb-3">✨ Anteprima Colori</p>
            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="flex-1 h-10 rounded-md flex items-center justify-center text-white text-xs font-medium" style={{ backgroundColor: settings.primary_color }}>
                  Primario
                </div>
                <div className="flex-1 h-10 rounded-md flex items-center justify-center text-white text-xs font-medium" style={{ backgroundColor: settings.secondary_color }}>
                  Secondario
                </div>
                <div className="flex-1 h-10 rounded-md flex items-center justify-center text-white text-xs font-medium" style={{ backgroundColor: settings.accent_color }}>
                  Accent
                </div>
              </div>
              <div className="flex gap-1">
                <div className="flex-1 h-6 rounded" style={{ backgroundColor: settings.primary_color, opacity: 0.8 }}></div>
                <div className="flex-1 h-6 rounded" style={{ backgroundColor: settings.primary_color, opacity: 0.6 }}></div>
                <div className="flex-1 h-6 rounded" style={{ backgroundColor: settings.primary_color, opacity: 0.4 }}></div>
                <div className="flex-1 h-6 rounded" style={{ backgroundColor: settings.primary_color, opacity: 0.2 }}></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Card>
        <CardContent className="pt-6">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full h-12 text-lg"
            style={{ background: `linear-gradient(135deg, ${settings.primary_color} 0%, ${settings.secondary_color} 100%)` }}
            data-testid="save-settings-btn"
          >
            <Save className="w-5 h-5 mr-2" />
            {saving ? "Salvataggio..." : "Salva Tutte le Impostazioni"}
          </Button>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Anteprima Messaggio</CardTitle>
          <CardDescription>Come si presenterà il bot ai clienti</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200">
            <div className="flex items-start space-x-3 mb-4">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: settings.primary_color }}
              >
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 mb-1">
                  {settings.bot_name || "Nome Bot"}
                </p>
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <p className="text-sm text-gray-700">
                    Ciao! Sono <strong>{settings.bot_name || "Nome Bot"}</strong>, l'assistente
                    virtuale di <strong>{settings.agency_name || "Agenzia Immobiliare"}</strong>.
                    Sono qui per aiutarti a trovare l'immobile perfetto! 🏠
                  </p>
                </div>
                <p className="text-xs text-gray-500 mt-2">Adesso</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-900">🤖 Comportamento Bot</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-blue-800">
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                <p>
                  Il bot risponde <strong>solo ai nuovi contatti</strong> che scrivono per la prima
                  volta
                </p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                <p>I messaggi di clienti esistenti vengono salvati ma non ricevono risposta automatica</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                <p>Puoi sempre rispondere manualmente dalla dashboard Messaggi</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-900">⚠️ Dopo le Modifiche</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-orange-800">
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-1.5"></div>
                <p>
                  Le modifiche al tema saranno <strong>immediatamente visibili</strong> nella dashboard
                </p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-1.5"></div>
                <p>Il logo apparirà automaticamente nella sidebar dopo il salvataggio</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-1.5"></div>
                <p>Ricarica la pagina se i colori non si aggiornano immediatamente</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

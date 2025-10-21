import { useState, useEffect } from "react";
import axios from "axios";
import { API, applyPrimaryColor } from "../App";
import { toast } from "sonner";
import { Settings, Bot, Building2, Save, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function BotSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    bot_name: "Emma",
    agency_name: "Agenzia Immobiliare",
    primary_color: "#3b82f6",
  });

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

  const handleColorChange = (color) => {
    setSettings({ ...settings, primary_color: color });
    // Preview immediato
    applyPrimaryColor(color);
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

            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full"
              style={{ background: `linear-gradient(135deg, ${settings.primary_color} 0%, ${settings.primary_color}dd 100%)` }}
              data-testid="save-settings-btn"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Salvataggio..." : "Salva Impostazioni"}
            </Button>
          </CardContent>
        </Card>

        {/* Theme Configuration */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${settings.primary_color} 0%, ${settings.primary_color}dd 100%)` }}>
                <Palette className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle>Tema e Colori</CardTitle>
                <CardDescription>Personalizza l'aspetto dell'applicazione</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Colore Primario</Label>
              <div className="flex items-center gap-3 mt-2">
                <input
                  type="color"
                  value={settings.primary_color}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="w-16 h-16 rounded-lg border-2 border-gray-200 cursor-pointer"
                  data-testid="color-picker"
                />
                <div className="flex-1">
                  <Input
                    value={settings.primary_color}
                    onChange={(e) => handleColorChange(e.target.value)}
                    placeholder="#3b82f6"
                    data-testid="color-input"
                  />
                  <p className="text-xs text-gray-500 mt-1">Codice esadecimale del colore</p>
                </div>
              </div>
            </div>

            <div>
              <Label>Colori Predefiniti</Label>
              <div className="grid grid-cols-5 gap-2 mt-2">
                {presetColors.map((preset) => (
                  <button
                    key={preset.color}
                    onClick={() => handleColorChange(preset.color)}
                    className={`relative w-full aspect-square rounded-lg border-2 transition-all hover:scale-110 ${
                      settings.primary_color === preset.color ? "border-gray-900 ring-2 ring-gray-900" : "border-gray-200"
                    }`}
                    style={{ backgroundColor: preset.color }}
                    title={preset.name}
                    data-testid={`preset-${preset.name.toLowerCase()}`}
                  >
                    {settings.primary_color === preset.color && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="w-6 h-6 text-white drop-shadow" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-700 font-medium mb-2">✨ Anteprima</p>
              <div className="space-y-2">
                <div className="h-8 rounded-md" style={{ backgroundColor: settings.primary_color }}></div>
                <div className="flex gap-2">
                  <div className="h-8 flex-1 rounded-md" style={{ backgroundColor: settings.primary_color, opacity: 0.8 }}></div>
                  <div className="h-8 flex-1 rounded-md" style={{ backgroundColor: settings.primary_color, opacity: 0.6 }}></div>
                  <div className="h-8 flex-1 rounded-md" style={{ backgroundColor: settings.primary_color, opacity: 0.4 }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
                  <strong>Riavvia il servizio WhatsApp</strong> sul tuo computer per applicare le
                  modifiche
                </p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-1.5"></div>
                <p>Ferma il servizio (Ctrl+C) e riavvia con: <code className="bg-orange-100 px-2 py-0.5 rounded">node whatsapp-service.js</code></p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-1.5"></div>
                <p>Le modifiche saranno attive immediatamente dopo il riavvio</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

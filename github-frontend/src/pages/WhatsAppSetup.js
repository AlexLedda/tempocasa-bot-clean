import { useState, useEffect } from "react";
import { QrCode, CheckCircle, AlertCircle, Smartphone, Zap, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { API } from "../App";
import axios from "axios";
import { toast } from "sonner";

export default function WhatsAppSetup() {
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusInfo, setStatusInfo] = useState(null);

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const checkStatus = async () => {
    try {
      const response = await axios.get(`${API}/whatsapp/status`);
      setStatusInfo(response.data);
      setConnectionStatus(response.data.connected ? "connected" : "disconnected");
      
      if (!response.data.connected) {
        // Prova a ottenere il QR code
        const qrResponse = await axios.get(`${API}/whatsapp/qr`);
        if (qrResponse.data.qr) {
          setQrCode(qrResponse.data.qr);
        }
      } else {
        setQrCode(null);
      }
    } catch (error) {
      console.error("Errore verifica stato:", error);
      setConnectionStatus("error");
    }
  };

  const startService = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API}/whatsapp/start`);
      toast.success(response.data.message);
      setTimeout(checkStatus, 3000);
    } catch (error) {
      toast.error("Errore avvio servizio: " + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6" data-testid="whatsapp-setup-page">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">WhatsApp Setup</h1>
        <p className="text-lg text-gray-600">Connetti il bot WhatsApp al tuo numero</p>
      </div>

      {/* Setup Instructions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Instructions */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Stato Connessione</h2>
              {connectionStatus === "connected" ? (
                <CheckCircle className="w-6 h-6 text-green-500" />
              ) : (
                <AlertCircle className="w-6 h-6 text-orange-500" />
              )}
            </div>
            <div
              className={`p-4 rounded-xl ${
                connectionStatus === "connected" ? "bg-green-50" : "bg-orange-50"
              }`}
            >
              <p
                className={`text-sm font-medium ${
                  connectionStatus === "connected" ? "text-green-700" : "text-orange-700"
                }`}
              >
                {connectionStatus === "connected"
                  ? "✅ WhatsApp connesso e attivo"
                  : "⏳ In attesa di connessione"}
              </p>
            </div>
          </div>

          {/* Instructions Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Come Connettere</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-blue-600">1</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Installa Node.js Service</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Esegui il servizio Baileys per connettere WhatsApp Web
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-blue-600">2</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Scansiona QR Code</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Apri WhatsApp sul tuo telefono e scansiona il codice QR
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-blue-600">3</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Bot Attivo!</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Il bot inizierà automaticamente a rispondere ai messaggi
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Setup Guide */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
            <div className="flex items-start space-x-3 mb-4">
              <Zap className="w-6 h-6 text-blue-600 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Setup Node.js Service</h3>
                <p className="text-sm text-gray-700 mb-3">
                  Per attivare il bot, devi eseguire il servizio Node.js separato.
                </p>
                <div className="bg-white rounded-lg p-3 border border-blue-100">
                  <p className="text-xs text-gray-500 mb-2">Comandi:</p>
                  <code className="text-xs text-gray-800 block bg-gray-50 p-2 rounded">
                    cd whatsapp-service
                    <br />
                    npm install
                    <br />
                    node whatsapp-service.js
                  </code>
                </div>
                <p className="text-xs text-gray-600 mt-3">
                  Il servizio genererà un QR code che potrai scansionare con WhatsApp.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - QR Code */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Codice QR</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={checkStatus}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Aggiorna
            </Button>
          </div>
          
          {qrCode ? (
            <div>
              <div className="aspect-square bg-white rounded-xl flex items-center justify-center border-2 border-gray-200 p-4">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrCode)}`}
                  alt="QR Code WhatsApp"
                  className="w-full h-full"
                />
              </div>
              <div className="mt-4 bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-700 font-medium text-center">
                  ⏱️ Il QR code scade dopo 60 secondi. Scansiona ora!
                </p>
              </div>
            </div>
          ) : connectionStatus === "connected" ? (
            <div className="aspect-square bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl flex items-center justify-center border-2 border-green-200">
              <div className="text-center">
                <CheckCircle className="w-24 h-24 mx-auto text-green-500 mb-4" />
                <p className="text-green-700 font-semibold text-lg">WhatsApp Connesso!</p>
                <p className="text-sm text-green-600 mt-2">
                  {statusInfo?.user?.name || "Utente connesso"}
                </p>
              </div>
            </div>
          ) : (
            <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
              <div className="text-center p-6">
                <QrCode className="w-24 h-24 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 font-medium mb-3">In attesa del QR code</p>
                <Button 
                  onClick={startService}
                  disabled={loading}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  {loading ? "Avvio in corso..." : "Avvia Servizio WhatsApp"}
                </Button>
                <p className="text-xs text-gray-400 mt-3">
                  Il QR code apparirà automaticamente
                </p>
              </div>
            </div>
          )}

          <div className="mt-6 space-y-3">
            <div className="flex items-start space-x-2 text-sm text-gray-600">
              <Smartphone className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p>
                <strong>Come scansionare:</strong>
                <br />
                Apri WhatsApp → Impostazioni → Dispositivi collegati → Collega un dispositivo
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Overview */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Funzionalità Bot</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-xl">
            <h3 className="font-semibold text-gray-900 mb-2">🤖 Risposte AI</h3>
            <p className="text-sm text-gray-600">
              Il bot usa Claude Sonnet 4 per rispondere intelligentemente alle domande sugli immobili
            </p>
          </div>
          <div className="p-4 bg-indigo-50 rounded-xl">
            <h3 className="font-semibold text-gray-900 mb-2">📅 Appuntamenti</h3>
            <p className="text-sm text-gray-600">
              I clienti possono prenotare visite agli immobili direttamente via WhatsApp
            </p>
          </div>
          <div className="p-4 bg-sky-50 rounded-xl">
            <h3 className="font-semibold text-gray-900 mb-2">📊 Analytics</h3>
            <p className="text-sm text-gray-600">
              Tutte le conversazioni vengono salvate e analizzate nella dashboard
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
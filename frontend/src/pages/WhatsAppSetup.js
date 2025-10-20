import { useState, useEffect } from "react";
import { QrCode, CheckCircle, AlertCircle, Smartphone, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WhatsAppSetup() {
  const [connectionStatus, setConnectionStatus] = useState("disconnected");

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

        {/* Right Column - QR Code Placeholder */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Codice QR</h2>
          <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
            <div className="text-center">
              <QrCode className="w-24 h-24 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium">In attesa del servizio Node.js</p>
              <p className="text-sm text-gray-400 mt-2">Il QR code apparirà qui</p>
            </div>
          </div>

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
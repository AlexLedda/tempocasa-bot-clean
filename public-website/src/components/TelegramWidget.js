import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

const TELEGRAM_BOT = process.env.REACT_APP_TELEGRAM_BOT;

export default function TelegramWidget() {
  const [isOpen, setIsOpen] = useState(false);

  const openTelegram = () => {
    window.open(`https://t.me/${TELEGRAM_BOT}`, '_blank');
  };

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen ? (
          <button
            onClick={() => setIsOpen(true)}
            className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 animate-bounce"
            aria-label="Apri chat Telegram"
          >
            <MessageCircle className="w-7 h-7" />
          </button>
        ) : (
          <div className="bg-white rounded-2xl shadow-2xl w-80 overflow-hidden border-2 border-primary-500">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-full">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold">Elettra - Bot Tempocasa</h3>
                  <p className="text-xs opacity-90">Assistente Virtuale</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 p-1 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 bg-gradient-to-br from-gray-50 to-white">
              <div className="text-center space-y-4">
                <div className="bg-primary-50 border-2 border-primary-200 rounded-xl p-4">
                  <p className="text-gray-700 font-medium mb-2">👋 Ciao! Sono Elettra</p>
                  <p className="text-sm text-gray-600">
                    Sono qui per aiutarti a trovare la casa dei tuoi sogni! Posso mostrarti immobili, prenotare visite e rispondere alle tue domande.
                  </p>
                </div>

                <button
                  onClick={openTelegram}
                  className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  Apri Chat su Telegram
                </button>

                <p className="text-xs text-gray-500">
                  Risposte immediate 24/7
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
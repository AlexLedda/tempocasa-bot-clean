#!/bin/bash

echo "🚀 Avvio Servizio WhatsApp Bot..."
echo ""
echo "=================================="
echo "ISTRUZIONI:"
echo "=================================="
echo ""
echo "1. Il servizio WhatsApp si avvierà ora"
echo "2. Vedrai un QR CODE nel terminale"
echo "3. Apri WhatsApp sul tuo telefono"
echo "4. Vai su: Impostazioni → Dispositivi collegati → Collega un dispositivo"
echo "5. Scansiona il QR CODE che appare qui sotto"
echo ""
echo "=================================="
echo "Avvio in corso..."
echo "=================================="
echo ""

cd /app/whatsapp-service
node whatsapp-service.js

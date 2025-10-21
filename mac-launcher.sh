#!/bin/bash

# ===================================
# WhatsApp Bot Launcher per Mac
# ===================================

echo "🤖 Avvio WhatsApp Bot..."
echo ""

# Percorso alla cartella del bot sul Desktop
BOT_DIR="$HOME/Desktop/whatsapp-bot"

# Verifica che la cartella esista
if [ ! -d "$BOT_DIR" ]; then
    osascript -e 'display dialog "⚠️ Cartella whatsapp-bot non trovata sul Desktop!\n\nAssicurati che la cartella sia in:\n~/Desktop/whatsapp-bot" buttons {"OK"} default button "OK" with icon stop'
    exit 1
fi

# Verifica che Node.js sia installato
if ! command -v node &> /dev/null; then
    osascript -e 'display dialog "⚠️ Node.js non installato!\n\nInstalla Node.js da:\nhttps://nodejs.org" buttons {"OK"} default button "OK" with icon stop'
    open "https://nodejs.org"
    exit 1
fi

# Verifica che il file del bot esista
if [ ! -f "$BOT_DIR/whatsapp-service.js" ]; then
    osascript -e 'display dialog "⚠️ File whatsapp-service.js non trovato!\n\nAssicurati che il file sia in:\n~/Desktop/whatsapp-bot/whatsapp-service.js" buttons {"OK"} default button "OK" with icon stop'
    exit 1
fi

# Mostra notifica di avvio
osascript -e 'display notification "Il bot WhatsApp si sta avviando..." with title "🤖 WhatsApp Bot"'

# Apri un nuovo terminale e avvia il bot
osascript <<EOF
tell application "Terminal"
    activate
    do script "cd '$BOT_DIR' && clear && echo '====================================' && echo '   🤖 WhatsApp Bot Avviato' && echo '====================================' && echo '' && echo '📱 Scansiona il QR code con WhatsApp' && echo '⏹️  Premi Ctrl+C per fermare' && echo '' && node whatsapp-service.js"
end tell
EOF

echo "✅ Bot avviato nel Terminale!"

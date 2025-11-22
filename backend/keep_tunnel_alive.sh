#!/bin/bash
# Script per mantenere localtunnel sempre attivo

while true; do
    echo "[$(date)] Avvio localtunnel..."
    lt --port 8001 --subdomain tempocasa-bot
    echo "[$(date)] Localtunnel disconnesso. Riavvio tra 5 secondi..."
    sleep 5
done

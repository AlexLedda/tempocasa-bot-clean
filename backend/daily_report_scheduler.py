"""
Scheduler per report giornaliero
Esegue il report alle 20:00 ogni giorno
"""
import schedule
import time
import requests
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def send_daily_report():
    """Invia il report giornaliero"""
    try:
        response = requests.get("http://localhost:8001/api/telegram/daily-report", timeout=30)
        if response.status_code == 200:
            logger.info("✅ Report giornaliero inviato con successo")
        else:
            logger.error(f"❌ Errore invio report: {response.status_code}")
    except Exception as e:
        logger.error(f"❌ Errore: {e}")

# Schedula il report alle 20:00 ogni giorno
schedule.every().day.at("20:00").do(send_daily_report)

logger.info("🕐 Scheduler avviato - Report alle 20:00 ogni giorno")

while True:
    schedule.run_pending()
    time.sleep(60)  # Controlla ogni minuto

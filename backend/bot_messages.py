"""
Bot WhatsApp - Sistema di Messaggi con Saluto Dinamico
Elettra - Assistente Virtuale Tempocasa Tarquinia
"""
from datetime import datetime
from typing import Dict, List, Optional


def get_greeting() -> str:
    """
    Restituisce il saluto appropriato in base all'orario
    """
    hour = datetime.now().hour
    
    if 5 <= hour < 12:
        return "Buongiorno"
    elif 12 <= hour < 18:
        return "Buon pomeriggio"
    elif 18 <= hour < 22:
        return "Buonasera"
    else:
        return "Buonasera"


def get_welcome_message(client_name: Optional[str] = None) -> str:
    """
    Messaggio di benvenuto con saluto dinamico
    """
    greeting = get_greeting()
    
    if client_name:
        return f"""{greeting} {client_name}! 👋

Sono *Elettra*, l'assistente virtuale di *Tempocasa Tarquinia*.

Sono qui per aiutarla a trovare la casa dei suoi sogni o per valutare il suo immobile.

Come posso esserle utile oggi?

1️⃣ Cerco casa
2️⃣ Voglio vendere/affittare
3️⃣ Richiedo una valutazione
4️⃣ Info su un immobile specifico
5️⃣ Parlare con un agente

Risponda con il numero o descriva liberamente la sua esigenza! 😊"""
    else:
        return f"""{greeting}! 👋

Sono *Elettra*, l'assistente virtuale di *Tempocasa Tarquinia*.

Sono qui per aiutarla a trovare la casa dei suoi sogni o per valutare il suo immobile.

Come posso esserle utile oggi?

1️⃣ Cerco casa
2️⃣ Voglio vendere/affittare
3️⃣ Richiedo una valutazione
4️⃣ Info su un immobile specifico
5️⃣ Parlare con un agente

Risponda con il numero o descriva liberamente la sua esigenza! 😊"""


def get_searching_house_message() -> str:
    """
    Messaggio per chi cerca casa
    """
    return """Perfetto! La aiuto a trovare l'immobile ideale. 🏠

Per offrirle le migliori soluzioni, ho bisogno di alcune informazioni:

📍 *In quale zona di Tarquinia cerca?*
   (Es: Centro storico, Lido, Tarquinia Scalo...)

🏡 *Che tipo di immobile?*
   (Appartamento, Villa, Ufficio...)

🛏️ *Quante camere?*

💰 *Budget massimo?*

Può rispondere anche con un messaggio unico, tipo:
"Appartamento 3 camere in centro, budget 200.000€" """


def get_selling_house_message() -> str:
    """
    Messaggio per chi vuole vendere
    """
    return """Ottimo! La aiuto a vendere o affittare il suo immobile. 🏠

Per procedere, ho bisogno di sapere:

📍 *Dove si trova l'immobile?*
   (Indirizzo completo o zona)

🏡 *Che tipo di immobile è?*
   (Appartamento, Villa, Ufficio, Terreno...)

📏 *Metratura?*

🛏️ *Numero di camere/locali?*

💰 *Ha già un'idea di prezzo?*

🏢 *È già in vendita con un'altra agenzia?*

Può rispondere liberamente o preferisce fissare un appuntamento per una valutazione gratuita?"""


def get_valuation_message() -> str:
    """
    Messaggio per richiesta valutazione
    """
    return """Richiesta valutazione immobile ricevuta! 📋

I nostri agenti offrono *valutazioni gratuite* e professionali.

Per organizzare un sopralluogo, ho bisogno di:

📍 *Indirizzo dell'immobile*

🏡 *Tipologia*
   (Appartamento, Villa, ecc.)

📅 *Quando è disponibile per il sopralluogo?*
   (Proponga 2-3 date/orari)

📞 *Numero di telefono*
   (per confermare l'appuntamento)

Un nostro agente la contatterà a breve per confermare! 👍"""


def get_specific_property_message() -> str:
    """
    Messaggio per info su immobile specifico
    """
    return """Perfetto! Per darle informazioni dettagliate sull'immobile:

🔢 *Mi fornisca il codice dell'annuncio*
   (Es: RIF123, A456...)

oppure

📍 *Indirizzo o zona dell'immobile*

Controllo subito la disponibilità e le fornisco tutte le informazioni! 🏠"""


def get_agent_contact_message() -> str:
    """
    Messaggio per parlare con agente
    """
    return """Certo! La metto in contatto con un nostro agente. 👨‍💼

📞 *Può chiamare direttamente:*
   Tel: [INSERIRE NUMERO]

📅 *Oppure preferisce fissare un appuntamento?*
   
   Quando è disponibile?
   - Mattina (9:00-13:00)
   - Pomeriggio (15:00-19:00)
   
   Proponga giorno e orario, provvederò a confermarle!

🏢 *Sede:*
   Tempocasa Tarquinia
   [INSERIRE INDIRIZZO]"""


def get_appointment_confirmation(
    client_name: str,
    date: str,
    time: str,
    property_info: Optional[str] = None
) -> str:
    """
    Conferma appuntamento
    """
    property_text = f"\n🏠 *Immobile:* {property_info}" if property_info else ""
    
    return f"""✅ *Appuntamento Confermato!*

Gentile {client_name},

Il suo appuntamento è stato fissato per:

📅 *Data:* {date}
🕐 *Orario:* {time}{property_text}

📍 *Sede:* Tempocasa Tarquinia
   [INSERIRE INDIRIZZO]

Riceverà un promemoria 24h prima dell'appuntamento.

Per qualsiasi necessità, non esiti a contattarci!

A presto! 👋"""


def get_property_match_message(properties: List[Dict]) -> str:
    """
    Messaggio con immobili suggeriti
    """
    if not properties:
        return """Mi dispiace, al momento non ho immobili che corrispondono esattamente ai suoi criteri. 😔

Le suggerisco di:

1️⃣ Ampliare la ricerca (budget, zona, metratura)
2️⃣ Lasciare i suoi contatti per essere avvisato quando arrivano nuovi immobili
3️⃣ Parlare con un agente per soluzioni personalizzate

Cosa preferisce?"""
    
    message = f"""Ho trovato *{len(properties)} immobili* che potrebbero interessarle! 🏠✨\n\n"""
    
    for i, prop in enumerate(properties, 1):
        message += f"""*{i}. {prop.get('title')}*
📍 {prop.get('location')}
💰 € {prop.get('price', 0):,.0f}
🛏️ {prop.get('bedrooms')} camere | 🚿 {prop.get('bathrooms')} bagni | 📏 {prop.get('square_meters')} m²
📝 Rif: {prop.get('reference', 'N/A')}

"""
    
    message += """Quale immobile desidera approfondire?
Risponda con il numero o chieda maggiori dettagli! 😊

Oppure:
🔄 Modificare i criteri di ricerca
📅 Fissare una visita
👨‍💼 Parlare con un agente"""
    
    return message


def get_out_of_context_message() -> str:
    """
    Messaggio per richieste fuori contesto
    """
    return """Mi dispiace, non ho capito bene la sua richiesta. 😅

Sono specializzata nell'aiutarla con:

🏠 Ricerca immobili
🏡 Vendita/Affitto immobili
📋 Valutazioni gratuite
📞 Contatto con agenti
ℹ️ Informazioni su immobili specifici

Come posso aiutarla?"""


def get_thank_you_message() -> str:
    """
    Messaggio di ringraziamento finale
    """
    greeting = get_greeting()
    
    return f"""Grazie per averci contattato! 🙏

Se ha altre domande o necessità, sono sempre qui per aiutarla.

{greeting} e buona giornata da tutto il team Tempocasa Tarquinia! 👋

🏠 www.tempocasatarquinia.it"""


def get_error_message() -> str:
    """
    Messaggio di errore generico
    """
    return """Mi dispiace, si è verificato un problema tecnico. 😔

La prego di riprovare tra qualche istante o contattare direttamente la nostra sede:

📞 [INSERIRE NUMERO]
📧 [INSERIRE EMAIL]

Ci scusiamo per il disagio!"""


def get_business_hours_message() -> str:
    """
    Messaggio fuori orario
    """
    return """Grazie per il suo messaggio! 🌙

Attualmente siamo fuori orario.

🕐 *Orari di apertura:*
   Lun-Ven: 9:00 - 13:00 | 15:00 - 19:00
   Sabato: 9:00 - 13:00
   Domenica: Chiuso

Un nostro agente la contatterà appena possibile.

Per urgenze: [INSERIRE NUMERO EMERGENZA]"""


# Mappatura rapida dei messaggi
MESSAGES = {
    'welcome': get_welcome_message,
    'searching': get_searching_house_message,
    'selling': get_selling_house_message,
    'valuation': get_valuation_message,
    'specific': get_specific_property_message,
    'agent': get_agent_contact_message,
    'out_of_context': get_out_of_context_message,
    'thank_you': get_thank_you_message,
    'error': get_error_message,
    'business_hours': get_business_hours_message,
}

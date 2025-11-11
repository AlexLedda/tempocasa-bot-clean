"""
AI Helper Functions for Smart Property Matching and Calendar Management
"""
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Optional


def filter_properties_by_criteria(
    properties: List[Dict],
    property_type: Optional[str] = None,
    max_budget: Optional[float] = None,
    min_bedrooms: Optional[int] = None,
    location: Optional[str] = None
) -> List[Dict]:
    """
    Filtra immobili in base ai criteri del cliente
    """
    filtered = properties.copy()
    
    # Filtra per tipologia
    if property_type:
        property_type_lower = property_type.lower()
        filtered = [p for p in filtered if property_type_lower in p.get('property_type', '').lower()]
    
    # Filtra per budget
    if max_budget and max_budget > 0:
        filtered = [p for p in filtered if p.get('price', 0) <= max_budget]
    
    # Filtra per camere
    if min_bedrooms:
        filtered = [p for p in filtered if p.get('bedrooms', 0) >= min_bedrooms]
    
    # Filtra per location (match parziale)
    if location:
        location_lower = location.lower()
        filtered = [p for p in filtered if location_lower in p.get('location', '').lower()]
    
    # Ordina per prezzo (dal più economico)
    filtered.sort(key=lambda p: p.get('price', 0))
    
    return filtered[:5]  # Massimo 5 immobili


def format_property_for_whatsapp(property: Dict) -> str:
    """
    Formatta immobile per messaggio WhatsApp
    """
    return f"""
🏠 **{property.get('title')}**
📍 {property.get('location')}
💰 €{property.get('price', 0):,.0f}
🛏️ {property.get('bedrooms')} camere | 🚿 {property.get('bathrooms')} bagni | 📐 {property.get('square_meters')}m²
📝 {property.get('description', '')[:100]}...
"""


def check_calendar_availability(
    appointments: List[Dict],
    requested_date: datetime,
    duration_hours: int = 1
) -> Dict:
    """
    Verifica disponibilità calendario per un appuntamento
    """
    requested_end = requested_date + timedelta(hours=duration_hours)
    
    # Verifica conflitti
    conflicts = []
    for appt in appointments:
        appt_date = appt.get('appointment_date')
        if isinstance(appt_date, str):
            appt_date = datetime.fromisoformat(appt_date)
        
        # Considera appuntamento di 1 ora
        appt_end = appt_date + timedelta(hours=1)
        
        # Check overlap
        if (requested_date < appt_end and requested_end > appt_date):
            conflicts.append(appt)
    
    is_available = len(conflicts) == 0
    
    return {
        "available": is_available,
        "conflicts": conflicts,
        "suggested_times": get_alternative_times(appointments, requested_date) if not is_available else []
    }


def get_alternative_times(
    appointments: List[Dict],
    preferred_date: datetime
) -> List[datetime]:
    """
    Suggerisce orari alternativi nello stesso giorno
    """
    date_only = preferred_date.date()
    
    # Orari lavorativi: 9:00 - 18:00
    possible_times = [
        datetime.combine(date_only, datetime.min.time()).replace(hour=h, tzinfo=timezone.utc)
        for h in range(9, 19)  # 9:00 - 18:00
    ]
    
    # Filtra orari già occupati
    occupied_hours = set()
    for appt in appointments:
        appt_date = appt.get('appointment_date')
        if isinstance(appt_date, str):
            appt_date = datetime.fromisoformat(appt_date)
        
        if appt_date.date() == date_only:
            occupied_hours.add(appt_date.hour)
    
    # Filtra orari liberi
    available_times = [t for t in possible_times if t.hour not in occupied_hours]
    
    return available_times[:3]  # Massimo 3 alternative


def extract_property_preferences(client: Dict) -> Dict:
    """
    Estrae preferenze immobile dal profilo cliente
    """
    looking_for = (client.get('looking_for') or '').lower()
    budget = client.get('budget', 0)
    location_pref = client.get('location_preference') or ''
    
    # Determina tipo immobile da "looking_for"
    property_type = None
    if 'appartamento' in looking_for or 'app' in looking_for:
        property_type = 'appartamento'
    elif 'villa' in looking_for:
        property_type = 'villa'
    elif 'ufficio' in looking_for:
        property_type = 'ufficio'
    elif 'negozio' in looking_for:
        property_type = 'negozio'
    
    # Estrai numero camere (es: "3 camere", "trilocale")
    min_bedrooms = None
    if '1 camera' in looking_for or 'monolocale' in looking_for:
        min_bedrooms = 1
    elif '2 camere' in looking_for or 'bilocale' in looking_for:
        min_bedrooms = 2
    elif '3 camere' in looking_for or 'trilocale' in looking_for:
        min_bedrooms = 3
    elif '4 camere' in looking_for or 'quadrilocale' in looking_for:
        min_bedrooms = 4
    
    return {
        'property_type': property_type,
        'max_budget': budget,
        'min_bedrooms': min_bedrooms,
        'location': location_pref
    }


def parse_date_from_text(text: str) -> Optional[datetime]:
    """
    Estrae data da testo in linguaggio naturale (italiano)
    """
    text_lower = text.lower()
    now = datetime.now(timezone.utc)
    
    # Oggi
    if 'oggi' in text_lower:
        return now.replace(hour=10, minute=0, second=0, microsecond=0)
    
    # Domani
    if 'domani' in text_lower:
        return (now + timedelta(days=1)).replace(hour=10, minute=0, second=0, microsecond=0)
    
    # Dopodomani
    if 'dopodomani' in text_lower:
        return (now + timedelta(days=2)).replace(hour=10, minute=0, second=0, microsecond=0)
    
    # Giorni della settimana
    giorni = {
        'lunedì': 0, 'martedì': 1, 'mercoledì': 2,
        'giovedì': 3, 'venerdì': 4, 'sabato': 5, 'domenica': 6
    }
    
    for giorno, weekday in giorni.items():
        if giorno in text_lower:
            days_ahead = (weekday - now.weekday()) % 7
            if days_ahead == 0:  # Se è oggi
                days_ahead = 7  # Prendi la prossima settimana
            target_date = now + timedelta(days=days_ahead)
            return target_date.replace(hour=10, minute=0, second=0, microsecond=0)
    
    # Estrai orario (es: "15:00", "15.00", "ore 15")
    import re
    time_pattern = r'(\d{1,2})[:.](\d{2})|ore\s+(\d{1,2})'
    match = re.search(time_pattern, text_lower)
    
    base_date = now.replace(hour=10, minute=0, second=0, microsecond=0)
    
    if match:
        if match.group(1):  # HH:MM format
            hour = int(match.group(1))
            minute = int(match.group(2))
        else:  # "ore HH" format
            hour = int(match.group(3))
            minute = 0
        
        # Se l'orario è valido (9-18)
        if 9 <= hour <= 18:
            base_date = base_date.replace(hour=hour, minute=minute)
    
    return base_date


def should_create_valuation(client: Dict) -> bool:
    """
    Determina se creare una valutazione automatica
    """
    needs_to_sell = client.get('needs_to_sell', False)
    wants_evaluation = client.get('wants_evaluation', False)
    property_location = client.get('property_to_sell_location', '')
    
    return needs_to_sell and wants_evaluation and len(property_location) > 0


def format_calendar_suggestion(available_times: List[datetime]) -> str:
    """
    Formatta suggerimenti calendario per WhatsApp
    """
    if not available_times:
        return "Non ci sono orari disponibili oggi. Prova un altro giorno."
    
    formatted_times = []
    for time in available_times:
        day_name = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'][time.weekday()]
        formatted_times.append(f"📅 {day_name} {time.strftime('%d/%m')} alle {time.strftime('%H:%M')}")
    
    return "\n".join(formatted_times)

"""
Utility Helpers
Funzioni di utilità comuni per l'applicazione
"""
from datetime import datetime
from typing import Dict, List, Any


def parse_datetime_fields(doc: Dict[str, Any], fields: List[str]) -> Dict[str, Any]:
    """
    Converte campi datetime da stringa ISO a oggetti datetime
    
    Args:
        doc: Documento da processare
        fields: Lista di nomi campi da convertire
    
    Returns:
        Documento con campi datetime convertiti
    """
    for field in fields:
        if doc.get(field) and isinstance(doc[field], str):
            doc[field] = datetime.fromisoformat(doc[field])
    return doc


def serialize_datetime_fields(doc: Dict[str, Any], fields: List[str]) -> Dict[str, Any]:
    """
    Converte campi datetime da oggetti datetime a stringa ISO
    
    Args:
        doc: Documento da processare
        fields: Lista di nomi campi da convertire
    
    Returns:
        Documento con campi datetime serializzati
    """
    for field in fields:
        if doc.get(field) and isinstance(doc[field], datetime):
            doc[field] = doc[field].isoformat()
    return doc


def validate_file_upload(
    content_type: str,
    file_size: int,
    allowed_types: List[str],
    max_size_mb: int
) -> tuple[bool, str]:
    """
    Valida file upload
    
    Args:
        content_type: MIME type del file
        file_size: Dimensione file in bytes
        allowed_types: Lista di MIME types consentiti
        max_size_mb: Dimensione massima in MB
    
    Returns:
        Tuple (is_valid, error_message)
    """
    # Check type
    if content_type not in allowed_types:
        return False, f"Tipo file non supportato. Usa: {', '.join(allowed_types)}"
    
    # Check size
    max_size_bytes = max_size_mb * 1024 * 1024
    if file_size > max_size_bytes:
        actual_mb = file_size / 1024 / 1024
        return False, f"File troppo grande. Massimo {max_size_mb}MB, ricevuto {actual_mb:.2f}MB"
    
    return True, ""

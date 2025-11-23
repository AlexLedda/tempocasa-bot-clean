"""
Generatore PDF per schede immobili
"""
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from reportlab.lib.units import cm
import io
import requests
from typing import Dict
import logging

logger = logging.getLogger(__name__)


def generate_property_pdf(property_data: Dict) -> bytes:
    """
    Genera PDF professionale per immobile
    
    Args:
        property_data: Dict con dati immobile
        
    Returns:
        bytes: PDF generato
    """
    buffer = io.BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4
    
    # Titolo
    pdf.setFont("Helvetica-Bold", 24)
    pdf.drawString(2*cm, height - 3*cm, f"{property_data.get('property_type', 'Immobile')}")
    
    # Sottotitolo
    pdf.setFont("Helvetica", 16)
    pdf.drawString(2*cm, height - 4*cm, property_data.get('location', ''))
    
    # Prezzo
    pdf.setFont("Helvetica-Bold", 20)
    pdf.setFillColorRGB(0, 0.5, 0)
    price = property_data.get('price', 0)
    pdf.drawString(2*cm, height - 5.5*cm, f"€ {price:,.0f}")
    
    pdf.setFillColorRGB(0, 0, 0)
    
    # Caratteristiche
    y_position = height - 7*cm
    pdf.setFont("Helvetica-Bold", 14)
    pdf.drawString(2*cm, y_position, "CARATTERISTICHE:")
    
    y_position -= 1*cm
    pdf.setFont("Helvetica", 12)
    
    features = [
        f"📐 Superficie: {property_data.get('square_meters', 0)} mq",
        f"🛏️  Camere: {property_data.get('bedrooms', 0)}",
        f"🚿 Bagni: {property_data.get('bathrooms', 0)}",
    ]
    
    for feature in features:
        pdf.drawString(2.5*cm, y_position, feature)
        y_position -= 0.7*cm
    
    # Descrizione
    y_position -= 1*cm
    pdf.setFont("Helvetica-Bold", 14)
    pdf.drawString(2*cm, y_position, "DESCRIZIONE:")
    
    y_position -= 1*cm
    pdf.setFont("Helvetica", 11)
    
    # Word wrap per descrizione
    description = property_data.get('description', 'Nessuna descrizione disponibile')
    words = description.split()
    line = ""
    
    for word in words:
        test_line = line + word + " "
        if pdf.stringWidth(test_line, "Helvetica", 11) < (width - 4*cm):
            line = test_line
        else:
            pdf.drawString(2.5*cm, y_position, line)
            y_position -= 0.6*cm
            line = word + " "
    
    if line:
        pdf.drawString(2.5*cm, y_position, line)
    
    # Footer
    pdf.setFont("Helvetica-Oblique", 10)
    pdf.setFillColorRGB(0.5, 0.5, 0.5)
    pdf.drawString(2*cm, 2*cm, "Tempocasa Tarquinia")
    pdf.drawString(2*cm, 1.5*cm, "Tel: +39 0766 xxx xxx | info@tempocasa-tarquinia.it")
    
    # QR Code (opzionale)
    # TODO: Aggiungere QR code con link immobile
    
    pdf.showPage()
    pdf.save()
    
    buffer.seek(0)
    return buffer.getvalue()

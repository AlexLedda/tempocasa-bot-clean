"""
Cloudinary Helper Functions
Funzioni di utilità per ottimizzare le immagini con Cloudinary
"""
import cloudinary
from typing import Dict, Optional, List


def get_optimized_url(
    public_id: str,
    width: Optional[int] = None,
    height: Optional[int] = None,
    quality: str = "auto:good",
    format: str = "auto",
    crop: str = "fill",
    gravity: str = "auto",
    dpr: str = "auto",
    progressive: bool = True
) -> str:
    """
    Genera URL ottimizzato per un'immagine Cloudinary
    
    Args:
        public_id: ID pubblico dell'immagine su Cloudinary
        width: Larghezza desiderata
        height: Altezza desiderata
        quality: Qualità (auto:eco, auto:good, auto:best)
        format: Formato (auto = WebP/AVIF automatico)
        crop: Modalità crop (fill, fit, limit, scale)
        gravity: Punto focale (auto, face, center)
        dpr: Device Pixel Ratio
        progressive: Progressive loading
    
    Returns:
        URL ottimizzato dell'immagine
    """
    transformation = {
        'quality': quality,
        'fetch_format': format,
        'gravity': gravity,
        'dpr': dpr
    }
    
    if width:
        transformation['width'] = width
    if height:
        transformation['height'] = height
    if width or height:
        transformation['crop'] = crop
    
    if progressive:
        transformation['flags'] = 'progressive'
    
    return cloudinary.CloudinaryImage(public_id).build_url(**transformation)


def get_responsive_urls(
    public_id: str,
    base_width: int = 800,
    quality: str = "auto:good"
) -> Dict[str, str]:
    """
    Genera set di URL responsive per srcset
    
    Args:
        public_id: ID pubblico dell'immagine
        base_width: Larghezza base
        quality: Qualità immagini
    
    Returns:
        Dict con URL per diverse risoluzioni
    """
    widths = [400, 800, 1200, 1600, 2400]
    urls = {}
    
    for width in widths:
        urls[f"{width}w"] = get_optimized_url(
            public_id,
            width=width,
            quality=quality,
            crop='limit'  # Mantiene aspect ratio
        )
    
    return urls


def get_property_image_variants(public_id: str) -> Dict[str, str]:
    """
    Genera tutte le varianti ottimizzate per un'immagine proprietà
    
    Args:
        public_id: ID pubblico dell'immagine
    
    Returns:
        Dict con URL per thumbnail, medium, large, hero
    """
    return {
        # Thumbnail per liste (piccolo, caricamento veloce)
        "thumbnail": get_optimized_url(
            public_id,
            width=300,
            height=200,
            quality="auto:eco",
            crop="fill"
        ),
        
        # Medium per card (bilanciato)
        "medium": get_optimized_url(
            public_id,
            width=800,
            height=600,
            quality="auto:good",
            crop="fill"
        ),
        
        # Large per dettaglio (alta qualità)
        "large": get_optimized_url(
            public_id,
            width=1200,
            height=800,
            quality="auto:best",
            crop="fill"
        ),
        
        # Hero per landing page (massima qualità)
        "hero": get_optimized_url(
            public_id,
            width=1920,
            height=1080,
            quality="auto:best",
            crop="fill"
        ),
        
        # Blur placeholder (per lazy loading)
        "placeholder": get_optimized_url(
            public_id,
            width=40,
            height=30,
            quality="auto:low",
            crop="fill"
        )
    }


def get_logo_url(public_id: str, size: int = 200) -> str:
    """
    Genera URL ottimizzato per logo
    
    Args:
        public_id: ID pubblico del logo
        size: Dimensione (max width/height)
    
    Returns:
        URL ottimizzato del logo
    """
    return get_optimized_url(
        public_id,
        width=size,
        height=size,
        quality="auto:best",
        crop="limit",  # Mantiene aspect ratio del logo
        format="auto"
    )


def add_watermark(
    public_id: str,
    watermark_text: str = "Tempocasa Tarquinia",
    opacity: int = 30,
    position: str = "south_east"
) -> str:
    """
    Aggiunge watermark text a un'immagine
    
    Args:
        public_id: ID pubblico dell'immagine
        watermark_text: Testo del watermark
        opacity: Opacità (0-100)
        position: Posizione (north_west, north_east, south_west, south_east, center)
    
    Returns:
        URL con watermark applicato
    """
    return cloudinary.CloudinaryImage(public_id).build_url(
        transformation=[
            {'width': 1200, 'height': 800, 'crop': 'fill'},
            {
                'overlay': {
                    'font_family': 'Arial',
                    'font_size': 40,
                    'font_weight': 'bold',
                    'text': watermark_text
                },
                'gravity': position,
                'opacity': opacity,
                'color': 'white'
            }
        ],
        quality='auto:best',
        fetch_format='auto'
    )


def generate_srcset(public_id: str) -> str:
    """
    Genera stringa srcset per responsive images
    
    Args:
        public_id: ID pubblico dell'immagine
    
    Returns:
        Stringa srcset per tag <img>
    """
    urls = get_responsive_urls(public_id)
    srcset_parts = [f"{url} {width}" for width, url in urls.items()]
    return ", ".join(srcset_parts)


def delete_image(public_id: str) -> bool:
    """
    Elimina un'immagine da Cloudinary
    
    Args:
        public_id: ID pubblico dell'immagine da eliminare
    
    Returns:
        True se eliminata con successo
    """
    try:
        result = cloudinary.uploader.destroy(public_id)
        return result.get('result') == 'ok'
    except Exception as e:
        print(f"Error deleting image: {e}")
        return False


def get_image_metadata(public_id: str) -> Optional[Dict]:
    """
    Ottiene metadata di un'immagine
    
    Args:
        public_id: ID pubblico dell'immagine
    
    Returns:
        Dict con metadata o None se errore
    """
    try:
        result = cloudinary.api.resource(public_id)
        return {
            "width": result.get('width'),
            "height": result.get('height'),
            "format": result.get('format'),
            "size_bytes": result.get('bytes'),
            "created_at": result.get('created_at'),
            "url": result.get('secure_url'),
            "colors": result.get('colors', [])
        }
    except Exception as e:
        print(f"Error getting metadata: {e}")
        return None


def bulk_delete_folder(folder: str) -> Dict:
    """
    Elimina tutte le immagini in una cartella
    
    Args:
        folder: Nome della cartella
    
    Returns:
        Dict con risultati eliminazione
    """
    try:
        result = cloudinary.api.delete_resources_by_prefix(folder)
        return {
            "success": True,
            "deleted": result.get('deleted', {}),
            "partial": result.get('partial', False)
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

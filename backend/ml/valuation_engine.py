"""
AI Property Valuation Engine
Valuta immobili usando dati storici e comparable properties
"""
import logging
from typing import List, Dict
from datetime import datetime, timezone
import statistics

logger = logging.getLogger(__name__)


class PropertyValuationEngine:
    """
    Engine per valutazione automatica immobili
    Usa comparable properties e fattori di mercato
    """
    
    def __init__(self, db):
        self.db = db
        
        # Pesi fattori (totale = 1.0)
        self.weights = {
            'location': 0.35,
            'size': 0.25,
            'condition': 0.15,
            'features': 0.15,
            'market_trend': 0.10
        }
    
    async def estimate_value(self, property_data: dict) -> dict:
        """
        Stima valore immobile
        
        Returns:
            {
                'estimated_value': float,
                'confidence_score': float,
                'value_range_min': float,
                'value_range_max': float,
                'comparable_properties': list,
                'factors': dict,
                'recommendation': str
            }
        """
        logger.info(f"Estimating value for property in {property_data.get('property_location')}")
        
        # 1. Trova immobili comparabili
        comparables = await self._find_comparable_properties(property_data)
        
        if len(comparables) < 3:
            logger.warning("Not enough comparable properties found")
            return self._low_confidence_estimate(property_data)
        
        # 2. Calcola prezzo base da comparables
        base_price = self._calculate_base_price(comparables)
        
        # 3. Applica aggiustamenti
        adjustments = self._calculate_adjustments(property_data, comparables)
        
        # 4. Calcola prezzo finale
        estimated_value = base_price * (1 + adjustments['total_adjustment'])
        
        # 5. Calcola confidence score
        confidence = self._calculate_confidence(comparables, adjustments)
        
        # 6. Calcola range
        variance = 0.10 if confidence > 0.7 else 0.15  # ±10% o ±15%
        value_range_min = estimated_value * (1 - variance)
        value_range_max = estimated_value * (1 + variance)
        
        # 7. Genera raccomandazione per admin
        recommendation = self._generate_recommendation(
            estimated_value, confidence, adjustments
        )
        
        return {
            'estimated_value': round(estimated_value, -3),  # Arrotonda a migliaia
            'confidence_score': round(confidence, 2),
            'value_range_min': round(value_range_min, -3),
            'value_range_max': round(value_range_max, -3),
            'comparable_properties': [
                {
                    'id': c['id'],
                    'title': c['title'],
                    'price': c['price'],
                    'similarity_score': c.get('similarity_score', 0)
                }
                for c in comparables[:5]  # Top 5
            ],
            'factors': adjustments,
            'recommendation': recommendation
        }
    
    async def _find_comparable_properties(self, property_data: dict) -> List[dict]:
        """Trova immobili simili venduti di recente"""
        query = {
            'property_type': property_data['property_type'],
            'location': {'$regex': property_data['property_location'], '$options': 'i'},
            'status': 'venduto',  # Solo venduti
            'square_meters': {
                '$gte': property_data['square_meters'] * 0.8,
                '$lte': property_data['square_meters'] * 1.2
            }
        }
        
        comparables = await self.db.properties.find(query).to_list(50)
        
        # Calcola similarity score per ogni comparable
        for comp in comparables:
            comp['similarity_score'] = self._calculate_similarity(
                property_data, comp
            )
        
        # Ordina per similarity (più simili prima)
        comparables.sort(key=lambda x: x['similarity_score'], reverse=True)
        
        return comparables[:10]  # Top 10
    
    def _calculate_similarity(self, target: dict, comparable: dict) -> float:
        """Calcola quanto un immobile è simile (0-1)"""
        score = 0.0
        
        # Location match (peso alto)
        if target['property_location'].lower() in comparable['location'].lower():
            score += 0.3
        
        # Size similarity
        size_diff = abs(target['square_meters'] - comparable['square_meters'])
        size_score = max(0, 1 - (size_diff / target['square_meters']))
        score += size_score * 0.3
        
        # Bedrooms match
        if target['bedrooms'] == comparable['bedrooms']:
            score += 0.2
        
        # Bathrooms match
        if target['bathrooms'] == comparable['bathrooms']:
            score += 0.1
        
        # Condition match
        if target.get('condition') == comparable.get('condition'):
            score += 0.1
        
        return score
    
    def _calculate_base_price(self, comparables: List[dict]) -> float:
        """Calcola prezzo base da comparables"""
        # Usa mediana per ridurre impatto outliers
        prices = [c['price'] for c in comparables]
        return statistics.median(prices)
    
    def _calculate_adjustments(self, property_data: dict, comparables: List[dict]) -> dict:
        """Calcola aggiustamenti al prezzo base"""
        adjustments = {
            'location_adjustment': 0.0,
            'size_adjustment': 0.0,
            'condition_adjustment': 0.0,
            'features_adjustment': 0.0,
            'total_adjustment': 0.0
        }
        
        # Location premium/discount
        location = property_data['property_location'].lower()
        if 'centro' in location:
            adjustments['location_adjustment'] = 0.10  # +10%
        elif 'lido' in location or 'mare' in location:
            adjustments['location_adjustment'] = 0.15  # +15%
        
        # Condition adjustment
        condition = property_data.get('condition', 'buono')
        condition_map = {
            'ottimo': 0.10,
            'buono': 0.0,
            'da ristrutturare': -0.15
        }
        adjustments['condition_adjustment'] = condition_map.get(condition, 0.0)
        
        # Features bonus
        features_bonus = 0.0
        if property_data.get('has_parking'):
            features_bonus += 0.05
        if property_data.get('has_garden'):
            features_bonus += 0.08
        if property_data.get('has_elevator'):
            features_bonus += 0.03
        
        adjustments['features_adjustment'] = features_bonus
        
        # Total
        adjustments['total_adjustment'] = sum([
            adjustments['location_adjustment'],
            adjustments['condition_adjustment'],
            adjustments['features_adjustment']
        ])
        
        return adjustments
    
    def _calculate_confidence(self, comparables: List[dict], adjustments: dict) -> float:
        """Calcola confidence score (0-1)"""
        confidence = 0.5  # Base
        
        # Più comparables = più confidence
        if len(comparables) >= 10:
            confidence += 0.2
        elif len(comparables) >= 5:
            confidence += 0.1
        
        # Alta similarity = più confidence
        avg_similarity = statistics.mean([c['similarity_score'] for c in comparables])
        confidence += avg_similarity * 0.2
        
        # Pochi aggiustamenti = più confidence
        if abs(adjustments['total_adjustment']) < 0.1:
            confidence += 0.1
        
        return min(confidence, 1.0)
    
    def _generate_recommendation(
        self, 
        estimated_value: float, 
        confidence: float, 
        adjustments: dict
    ) -> str:
        """Genera raccomandazione per admin"""
        if confidence >= 0.8:
            return f"Alta confidenza. Valutazione affidabile basata su {len(adjustments)} fattori."
        elif confidence >= 0.6:
            return "Confidenza media. Consigliato verificare comparables manualmente."
        else:
            return "Bassa confidenza. Richiede review approfondita e possibili aggiustamenti."
    
    def _low_confidence_estimate(self, property_data: dict) -> dict:
        """Stima con bassa confidenza (pochi comparables)"""
        # Usa prezzo medio al mq per zona
        avg_price_per_sqm = 2000  # Default, dovrebbe venire da DB
        
        estimated_value = property_data['square_meters'] * avg_price_per_sqm
        
        return {
            'estimated_value': round(estimated_value, -3),
            'confidence_score': 0.3,
            'value_range_min': round(estimated_value * 0.8, -3),
            'value_range_max': round(estimated_value * 1.2, -3),
            'comparable_properties': [],
            'factors': {'warning': 'Pochi dati comparabili'},
            'recommendation': 'ATTENZIONE: Stima basata su dati limitati. Review manuale obbligatoria.'
        }

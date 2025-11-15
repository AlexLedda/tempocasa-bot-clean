"""
Bot Learning System - AI Auto-Apprendente
Sistema che impara dalle conversazioni per migliorare le risposte
"""
from datetime import datetime, timezone
from typing import Dict, List, Optional
from collections import Counter
import re


class BotLearningSystem:
    """
    Sistema di apprendimento per il bot WhatsApp
    Analizza conversazioni passate per migliorare risposte future
    """
    
    def __init__(self, db):
        """
        Inizializza il sistema con riferimento al database MongoDB
        """
        self.db = db
        
    async def save_conversation(
        self,
        phone_number: str,
        message: str,
        response: str,
        intent: Optional[str] = None,
        entities: Optional[Dict] = None
    ):
        """
        Salva una conversazione nel database per apprendimento futuro
        
        Args:
            phone_number: Numero telefono cliente
            message: Messaggio del cliente
            response: Risposta del bot
            intent: Intenzione riconosciuta (cerca_casa, vende, valutazione, etc)
            entities: Entità estratte (budget, zona, tipologia, etc)
        """
        conversation = {
            "phone_number": phone_number,
            "user_message": message.lower().strip(),
            "bot_response": response,
            "intent": intent,
            "entities": entities or {},
            "timestamp": datetime.now(timezone.utc),
            "useful": None,  # Sarà aggiornato con feedback utente
        }
        
        await self.db.bot_conversations.insert_one(conversation)
    
    async def get_similar_conversations(
        self,
        message: str,
        limit: int = 5
    ) -> List[Dict]:
        """
        Trova conversazioni simili nel database
        Usa keyword matching semplice per ora
        """
        # Estrai keyword dal messaggio
        keywords = self._extract_keywords(message)
        
        if not keywords:
            return []
        
        # Cerca conversazioni con keyword simili
        query = {
            "$or": [
                {"user_message": {"$regex": keyword, "$options": "i"}}
                for keyword in keywords
            ],
            "useful": {"$ne": False}  # Escludi conversazioni segnate come non utili
        }
        
        conversations = await self.db.bot_conversations.find(
            query
        ).sort("timestamp", -1).limit(limit).to_list(limit)
        
        return conversations
    
    async def get_frequent_questions(self, limit: int = 20) -> List[Dict]:
        """
        Restituisce le domande più frequenti (FAQ automatiche)
        """
        # Aggrega per messaggi simili
        pipeline = [
            {
                "$group": {
                    "_id": "$user_message",
                    "count": {"$sum": 1},
                    "last_response": {"$last": "$bot_response"},
                    "intent": {"$last": "$intent"}
                }
            },
            {"$sort": {"count": -1}},
            {"$limit": limit}
        ]
        
        faqs = await self.db.bot_conversations.aggregate(pipeline).to_list(limit)
        return faqs
    
    async def mark_conversation_useful(self, conversation_id: str, useful: bool):
        """
        Marca una conversazione come utile o non utile
        Feedback per migliorare il sistema
        """
        await self.db.bot_conversations.update_one(
            {"_id": conversation_id},
            {"$set": {"useful": useful}}
        )
    
    async def get_intent_statistics(self) -> Dict:
        """
        Statistiche sugli intent più comuni
        Utile per capire cosa cercano i clienti
        """
        pipeline = [
            {"$match": {"intent": {"$ne": None}}},
            {
                "$group": {
                    "_id": "$intent",
                    "count": {"$sum": 1}
                }
            },
            {"$sort": {"count": -1}}
        ]
        
        stats = await self.db.bot_conversations.aggregate(pipeline).to_list(100)
        
        return {
            item["_id"]: item["count"]
            for item in stats
        }
    
    async def get_popular_search_criteria(self) -> Dict:
        """
        Analizza i criteri di ricerca più comuni
        (budget, zone, tipologie immobili)
        """
        # Cerca nelle entities salvate
        conversations = await self.db.bot_conversations.find(
            {"intent": "cerca_casa", "entities": {"$ne": {}}}
        ).to_list(1000)
        
        budgets = []
        zones = []
        property_types = []
        
        for conv in conversations:
            entities = conv.get("entities", {})
            
            if "budget" in entities:
                budgets.append(entities["budget"])
            
            if "zona" in entities:
                zones.append(entities["zona"])
            
            if "tipologia" in entities:
                property_types.append(entities["tipologia"])
        
        return {
            "budget_medio": sum(budgets) / len(budgets) if budgets else 0,
            "zone_popolari": self._most_common(zones, 5),
            "tipologie_richieste": self._most_common(property_types, 5),
            "totale_ricerche": len(conversations)
        }
    
    async def suggest_response(self, message: str) -> Optional[str]:
        """
        Suggerisce una risposta basata su conversazioni simili passate
        """
        similar = await self.get_similar_conversations(message, limit=3)
        
        if not similar:
            return None
        
        # Prendi la risposta più recente tra quelle simili
        # con più alta probabilità di essere rilevante
        return similar[0].get("bot_response")
    
    def _extract_keywords(self, text: str, min_length: int = 4) -> List[str]:
        """
        Estrae keyword rilevanti da un testo
        """
        # Rimuovi punteggiatura e converti a lowercase
        text = re.sub(r'[^\w\s]', ' ', text.lower())
        
        # Split in parole
        words = text.split()
        
        # Filtra parole comuni italiane (stop words)
        stop_words = {
            'sono', 'essere', 'avere', 'fare', 'potere', 'dovere', 'volere',
            'questo', 'quello', 'questi', 'quegli', 'mio', 'tuo', 'suo',
            'anche', 'ancora', 'dove', 'quando', 'come', 'perche', 'cosa',
            'molto', 'poco', 'tutto', 'niente', 'ogni', 'qualche',
            'buongiorno', 'buonasera', 'grazie', 'prego', 'salve', 'ciao'
        }
        
        # Filtra e mantieni solo parole significative
        keywords = [
            word for word in words
            if len(word) >= min_length and word not in stop_words
        ]
        
        return keywords[:5]  # Massimo 5 keyword
    
    def _most_common(self, items: List, limit: int = 5) -> List[tuple]:
        """
        Restituisce gli elementi più comuni in una lista
        """
        if not items:
            return []
        
        counter = Counter(items)
        return counter.most_common(limit)
    
    async def generate_insights_report(self) -> Dict:
        """
        Genera un report con insights dalle conversazioni
        Utile per gli agenti per capire trends
        """
        # Totale conversazioni
        total = await self.db.bot_conversations.count_documents({})
        
        # Conversazioni ultime 7 giorni
        from datetime import timedelta
        week_ago = datetime.now(timezone.utc) - timedelta(days=7)
        recent = await self.db.bot_conversations.count_documents({
            "timestamp": {"$gte": week_ago}
        })
        
        # Intent statistics
        intents = await self.get_intent_statistics()
        
        # Search criteria
        search_stats = await self.get_popular_search_criteria()
        
        # FAQ
        faqs = await self.get_frequent_questions(limit=10)
        
        return {
            "totale_conversazioni": total,
            "conversazioni_ultima_settimana": recent,
            "intent_popolari": intents,
            "criteri_ricerca": search_stats,
            "domande_frequenti": [
                {
                    "domanda": faq["_id"],
                    "volte_chiesta": faq["count"],
                    "intent": faq.get("intent")
                }
                for faq in faqs
            ],
            "generato_il": datetime.now(timezone.utc).isoformat()
        }

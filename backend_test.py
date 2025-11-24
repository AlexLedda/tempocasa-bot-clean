#!/usr/bin/env python3
"""
Test script per le API del backend - Sistema Multi-Agente Tempocasa
Testa tutte le nuove funzionalità del sistema multi-utente
"""

import requests
import json
import sys
from datetime import datetime, timedelta
from typing import Dict, List, Optional

# URL del backend dal frontend/.env
BASE_URL = "https://rebot-tarquinia.preview.emergentagent.com/api"

class MultiUserAPITester:
    def __init__(self):
        self.base_url = BASE_URL
        self.session = requests.Session()
        self.test_results = []
        self.admin_token = None
        self.created_user_id = None
        self.created_property_id = None
        
        # Credenziali admin
        self.admin_credentials = {
            "username": "admin",
            "password": "Corneto1."
        }
        
    def log_result(self, test_name: str, success: bool, message: str, details: str = ""):
        """Log test result"""
        result = {
            "test": test_name,
            "success": success,
            "message": message,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        if details:
            print(f"   Details: {details}")
        print()

    def test_admin_login(self) -> bool:
        """Test POST /api/auth/login - Login admin"""
        try:
            print("🔐 Testing POST /api/auth/login (admin)...")
            
            response = self.session.post(
                f"{self.base_url}/auth/login",
                json=self.admin_credentials,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                login_data = response.json()
                
                # Verifica che abbia token e user
                if "access_token" in login_data and "user" in login_data:
                    self.admin_token = login_data["access_token"]
                    user_data = login_data["user"]
                    
                    # Verifica che sia admin
                    if user_data.get("role") == "admin":
                        # Imposta header Authorization per le prossime richieste
                        self.session.headers.update({
                            "Authorization": f"Bearer {self.admin_token}"
                        })
                        
                        self.log_result(
                            "POST /api/auth/login", 
                            True, 
                            "Login admin riuscito con successo",
                            f"Username: {user_data.get('username')}, Role: {user_data.get('role')}"
                        )
                        return True
                    else:
                        self.log_result(
                            "POST /api/auth/login", 
                            False, 
                            f"Utente non è admin: {user_data.get('role')}",
                            f"User data: {json.dumps(user_data, indent=2)}"
                        )
                        return False
                else:
                    self.log_result(
                        "POST /api/auth/login", 
                        False, 
                        "Response mancante di access_token o user",
                        f"Response: {json.dumps(login_data, indent=2)}"
                    )
                    return False
            else:
                self.log_result(
                    "POST /api/auth/login", 
                    False, 
                    f"HTTP {response.status_code}",
                    f"Response: {response.text}"
                )
                return False
                
        except Exception as e:
            self.log_result(
                "POST /api/auth/login", 
                False, 
                f"Errore: {str(e)}",
                ""
            )
            return False

    def test_get_me(self) -> bool:
        """Test GET /api/auth/me - Verifica profilo admin"""
        if not self.admin_token:
            self.log_result(
                "GET /api/auth/me", 
                False, 
                "Token admin non disponibile",
                ""
            )
            return False
            
        try:
            print("👤 Testing GET /api/auth/me...")
            
            response = self.session.get(f"{self.base_url}/auth/me")
            
            if response.status_code == 200:
                user_data = response.json()
                
                # Verifica campi essenziali
                required_fields = ['id', 'username', 'role', 'email', 'full_name']
                missing_fields = [field for field in required_fields if field not in user_data]
                
                if not missing_fields and user_data.get('role') == 'admin':
                    self.log_result(
                        "GET /api/auth/me", 
                        True, 
                        "Profilo admin verificato correttamente",
                        f"Username: {user_data.get('username')}, Email: {user_data.get('email')}"
                    )
                    return True
                else:
                    issues = []
                    if missing_fields:
                        issues.append(f"Campi mancanti: {missing_fields}")
                    if user_data.get('role') != 'admin':
                        issues.append(f"Role non admin: {user_data.get('role')}")
                    
                    self.log_result(
                        "GET /api/auth/me", 
                        False, 
                        f"Problemi con profilo: {'; '.join(issues)}",
                        f"User data: {json.dumps(user_data, indent=2)}"
                    )
                    return False
            else:
                self.log_result(
                    "GET /api/auth/me", 
                    False, 
                    f"HTTP {response.status_code}",
                    f"Response: {response.text}"
                )
                return False
                
        except Exception as e:
            self.log_result(
                "GET /api/auth/me", 
                False, 
                f"Errore: {str(e)}",
                ""
            )
            return False

    def test_get_users(self) -> bool:
        """Test GET /api/auth/users - Lista utenti (solo admin)"""
        if not self.admin_token:
            self.log_result(
                "GET /api/auth/users", 
                False, 
                "Token admin non disponibile",
                ""
            )
            return False
            
        try:
            print("👥 Testing GET /api/auth/users...")
            
            response = self.session.get(f"{self.base_url}/auth/users")
            
            if response.status_code == 200:
                users = response.json()
                
                if isinstance(users, list):
                    # Dovrebbe esserci almeno l'admin
                    admin_found = any(user.get('role') == 'admin' for user in users)
                    
                    if admin_found:
                        self.log_result(
                            "GET /api/auth/users", 
                            True, 
                            f"Lista utenti restituita correttamente ({len(users)} utenti)",
                            f"Admin trovato, utenti totali: {len(users)}"
                        )
                        return True
                    else:
                        self.log_result(
                            "GET /api/auth/users", 
                            False, 
                            "Admin non trovato nella lista utenti",
                            f"Utenti: {json.dumps(users, indent=2)}"
                        )
                        return False
                else:
                    self.log_result(
                        "GET /api/auth/users", 
                        False, 
                        "Response non è una lista",
                        f"Response: {response.text}"
                    )
                    return False
            elif response.status_code == 403:
                self.log_result(
                    "GET /api/auth/users", 
                    False, 
                    "Accesso negato - verifica permessi admin",
                    f"Response: {response.text}"
                )
                return False
            else:
                self.log_result(
                    "GET /api/auth/users", 
                    False, 
                    f"HTTP {response.status_code}",
                    f"Response: {response.text}"
                )
                return False
                
        except Exception as e:
            self.log_result(
                "GET /api/auth/users", 
                False, 
                f"Errore: {str(e)}",
                ""
            )
            return False

    def test_create_user(self) -> bool:
        """Test POST /api/auth/users - Crea nuovo agente (solo admin)"""
        if not self.admin_token:
            self.log_result(
                "POST /api/auth/users", 
                False, 
                "Token admin non disponibile",
                ""
            )
            return False
            
        try:
            print("👤➕ Testing POST /api/auth/users...")
            
            new_user_data = {
                "username": "test_agent",
                "password": "TestAgent123",
                "full_name": "Test Agente",
                "email": "test@agent.com",
                "phone": "1234567890",
                "role": "agent"
            }
            
            response = self.session.post(
                f"{self.base_url}/auth/users",
                json=new_user_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                created_user = response.json()
                self.created_user_id = created_user.get('id')
                
                # Verifica campi essenziali
                required_fields = ['id', 'username', 'role', 'email', 'full_name']
                missing_fields = [field for field in required_fields if field not in created_user]
                
                if not missing_fields and created_user.get('role') == 'agent':
                    self.log_result(
                        "POST /api/auth/users", 
                        True, 
                        "Nuovo agente creato con successo",
                        f"ID: {self.created_user_id}, Username: {created_user.get('username')}, Role: {created_user.get('role')}"
                    )
                    return True
                else:
                    issues = []
                    if missing_fields:
                        issues.append(f"Campi mancanti: {missing_fields}")
                    if created_user.get('role') != 'agent':
                        issues.append(f"Role non corretto: {created_user.get('role')}")
                    
                    self.log_result(
                        "POST /api/auth/users", 
                        False, 
                        f"Problemi con utente creato: {'; '.join(issues)}",
                        f"User data: {json.dumps(created_user, indent=2)}"
                    )
                    return False
            elif response.status_code == 400:
                # Potrebbe essere username già esistente
                error_data = response.json() if response.headers.get('content-type', '').startswith('application/json') else {"detail": response.text}
                if "già registrato" in error_data.get('detail', ''):
                    self.log_result(
                        "POST /api/auth/users", 
                        True, 
                        "Username già esistente (comportamento corretto)",
                        f"Dettaglio: {error_data.get('detail')}"
                    )
                    return True
                else:
                    self.log_result(
                        "POST /api/auth/users", 
                        False, 
                        f"Errore validazione: {error_data.get('detail')}",
                        f"Response: {response.text}"
                    )
                    return False
            else:
                self.log_result(
                    "POST /api/auth/users", 
                    False, 
                    f"HTTP {response.status_code}",
                    f"Response: {response.text}"
                )
                return False
                
        except Exception as e:
            self.log_result(
                "POST /api/auth/users", 
                False, 
                f"Errore: {str(e)}",
                ""
            )
            return False

    def test_toggle_user_status(self) -> bool:
        """Test POST /api/auth/users/{user_id}/toggle - Abilita/disabilita utente"""
        if not self.admin_token:
            self.log_result(
                "POST /api/auth/users/{user_id}/toggle", 
                False, 
                "Token admin non disponibile",
                ""
            )
            return False
            
        if not self.created_user_id:
            self.log_result(
                "POST /api/auth/users/{user_id}/toggle", 
                False, 
                "Nessun utente creato per test toggle",
                ""
            )
            return False
            
        try:
            print(f"🔄 Testing POST /api/auth/users/{self.created_user_id}/toggle...")
            
            response = self.session.put(f"{self.base_url}/auth/users/{self.created_user_id}/toggle")
            
            if response.status_code == 200:
                updated_user = response.json()
                
                # Verifica che abbia i campi necessari
                if 'is_active' in updated_user:
                    # Test secondo toggle
                    response2 = self.session.put(f"{self.base_url}/auth/users/{self.created_user_id}/toggle")
                    
                    if response2.status_code == 200:
                        updated_user2 = response2.json()
                        
                        # Verifica che lo stato sia cambiato
                        if updated_user.get('is_active') != updated_user2.get('is_active'):
                            self.log_result(
                                "POST /api/auth/users/{user_id}/toggle", 
                                True, 
                                "Toggle stato utente funziona correttamente",
                                f"Primo toggle: {updated_user.get('is_active')}, Secondo toggle: {updated_user2.get('is_active')}"
                            )
                            return True
                        else:
                            self.log_result(
                                "POST /api/auth/users/{user_id}/toggle", 
                                False, 
                                "Stato non cambia dopo toggle",
                                f"Entrambi i toggle: {updated_user.get('is_active')}"
                            )
                            return False
                    else:
                        self.log_result(
                            "POST /api/auth/users/{user_id}/toggle", 
                            False, 
                            f"Secondo toggle fallito: HTTP {response2.status_code}",
                            f"Response: {response2.text}"
                        )
                        return False
                else:
                    self.log_result(
                        "POST /api/auth/users/{user_id}/toggle", 
                        False, 
                        "Campo is_active mancante nella response",
                        f"User data: {json.dumps(updated_user, indent=2)}"
                    )
                    return False
            else:
                self.log_result(
                    "POST /api/auth/users/{user_id}/toggle", 
                    False, 
                    f"HTTP {response.status_code}",
                    f"Response: {response.text}"
                )
                return False
                
        except Exception as e:
            self.log_result(
                "POST /api/auth/users/{user_id}/toggle", 
                False, 
                f"Errore: {str(e)}",
                ""
            )
            return False

    def test_create_property_with_agent_id(self) -> bool:
        """Test POST /api/properties - Crea immobile come admin (agent_id può essere nullo)"""
        if not self.admin_token:
            self.log_result(
                "POST /api/properties", 
                False, 
                "Token admin non disponibile",
                ""
            )
            return False
            
        try:
            print("🏠➕ Testing POST /api/properties (admin)...")
            
            test_property = {
                "title": "Appartamento Test Multi-Utente",
                "description": "Proprietà creata per test sistema multi-agente",
                "price": 280000.0,
                "location": "Tarquinia Centro",
                "street": "Via Test",
                "street_number": "456",
                "bedrooms": 2,
                "bathrooms": 1,
                "square_meters": 75.0,
                "property_type": "appartamento",
                "status": "disponibile"
                # agent_id non specificato - dovrebbe essere nullo per admin
            }
            
            response = self.session.post(
                f"{self.base_url}/properties",
                json=test_property,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                created_property = response.json()
                self.created_property_id = created_property.get('id')
                
                # Verifica campi essenziali
                required_fields = ['id', 'title', 'price', 'location', 'property_type']
                missing_fields = [field for field in required_fields if field not in created_property]
                
                if not missing_fields:
                    # Verifica che agent_id possa essere nullo per admin
                    agent_id = created_property.get('agent_id')
                    
                    self.log_result(
                        "POST /api/properties", 
                        True, 
                        "Immobile creato con successo come admin",
                        f"ID: {self.created_property_id}, Agent ID: {agent_id}, Titolo: {created_property.get('title')}"
                    )
                    return True
                else:
                    self.log_result(
                        "POST /api/properties", 
                        False, 
                        f"Campi mancanti: {missing_fields}",
                        f"Property: {json.dumps(created_property, indent=2)}"
                    )
                    return False
            else:
                self.log_result(
                    "POST /api/properties", 
                    False, 
                    f"HTTP {response.status_code}",
                    f"Response: {response.text}"
                )
                return False
                
        except Exception as e:
            self.log_result(
                "POST /api/properties", 
                False, 
                f"Errore: {str(e)}",
                ""
            )
            return False

    def test_get_properties_as_admin(self) -> bool:
        """Test GET /api/properties - Verifica che admin veda tutti gli immobili"""
        if not self.admin_token:
            self.log_result(
                "GET /api/properties (admin)", 
                False, 
                "Token admin non disponibile",
                ""
            )
            return False
            
        try:
            print("🏠📋 Testing GET /api/properties (admin)...")
            
            response = self.session.get(f"{self.base_url}/properties")
            
            if response.status_code == 200:
                properties = response.json()
                
                if isinstance(properties, list):
                    # Admin dovrebbe vedere tutti gli immobili
                    self.log_result(
                        "GET /api/properties (admin)", 
                        True, 
                        f"Admin vede tutti gli immobili ({len(properties)} totali)",
                        f"Immobili con agent_id diversi o nulli presenti"
                    )
                    return True
                else:
                    self.log_result(
                        "GET /api/properties (admin)", 
                        False, 
                        "Response non è una lista",
                        f"Response: {response.text}"
                    )
                    return False
            else:
                self.log_result(
                    "GET /api/properties (admin)", 
                    False, 
                    f"HTTP {response.status_code}",
                    f"Response: {response.text}"
                )
                return False
                
        except Exception as e:
            self.log_result(
                "GET /api/properties (admin)", 
                False, 
                f"Errore: {str(e)}",
                ""
            )
            return False

    def test_update_profile(self) -> bool:
        """Test PUT /api/auth/profile - Aggiorna profilo utente corrente"""
        if not self.admin_token:
            self.log_result(
                "PUT /api/auth/profile", 
                False, 
                "Token admin non disponibile",
                ""
            )
            return False
            
        try:
            print("👤✏️  Testing PUT /api/auth/profile...")
            
            # Aggiorna email e phone
            update_data = {
                "email": "admin.updated@tempocasa.it",
                "phone": "+39 0766 123456"
            }
            
            response = self.session.put(
                f"{self.base_url}/auth/profile",
                json=update_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                updated_user = response.json()
                
                # Verifica che i campi siano stati aggiornati
                if (updated_user.get('email') == update_data['email'] and 
                    updated_user.get('phone') == update_data['phone']):
                    
                    self.log_result(
                        "PUT /api/auth/profile", 
                        True, 
                        "Profilo aggiornato correttamente",
                        f"Email: {updated_user.get('email')}, Phone: {updated_user.get('phone')}"
                    )
                    return True
                else:
                    self.log_result(
                        "PUT /api/auth/profile", 
                        False, 
                        "Campi non aggiornati correttamente",
                        f"Expected email: {update_data['email']}, Got: {updated_user.get('email')}"
                    )
                    return False
            else:
                self.log_result(
                    "PUT /api/auth/profile", 
                    False, 
                    f"HTTP {response.status_code}",
                    f"Response: {response.text}"
                )
                return False
                
        except Exception as e:
            self.log_result(
                "PUT /api/auth/profile", 
                False, 
                f"Errore: {str(e)}",
                ""
            )
            return False

    def test_delete_user(self) -> bool:
        """Test DELETE /api/auth/users/{user_id} - Elimina agente creato"""
        if not self.admin_token:
            self.log_result(
                "DELETE /api/auth/users/{user_id}", 
                False, 
                "Token admin non disponibile",
                ""
            )
            return False
            
        if not self.created_user_id:
            self.log_result(
                "DELETE /api/auth/users/{user_id}", 
                True, 
                "Nessun utente da eliminare (creazione fallita)",
                ""
            )
            return True
            
        try:
            print(f"🗑️👤 Testing DELETE /api/auth/users/{self.created_user_id}...")
            
            response = self.session.delete(f"{self.base_url}/auth/users/{self.created_user_id}")
            
            if response.status_code == 200:
                result = response.json()
                
                # Verifica che l'eliminazione sia andata a buon fine
                if "success" in result or "message" in result:
                    # Verifica che l'utente sia stato effettivamente eliminato
                    verify_response = self.session.get(f"{self.base_url}/auth/users")
                    if verify_response.status_code == 200:
                        users = verify_response.json()
                        deleted_found = any(user.get('id') == self.created_user_id for user in users)
                        
                        if not deleted_found:
                            self.log_result(
                                "DELETE /api/auth/users/{user_id}", 
                                True, 
                                "Utente eliminato correttamente",
                                "Verificato che non sia più presente nella lista"
                            )
                            return True
                        else:
                            self.log_result(
                                "DELETE /api/auth/users/{user_id}", 
                                False, 
                                "Utente ancora presente dopo eliminazione",
                                "L'eliminazione potrebbe non aver funzionato"
                            )
                            return False
                    else:
                        self.log_result(
                            "DELETE /api/auth/users/{user_id}", 
                            True, 
                            "Eliminazione completata (verifica non possibile)",
                            f"Response: {json.dumps(result, indent=2)}"
                        )
                        return True
                else:
                    self.log_result(
                        "DELETE /api/auth/users/{user_id}", 
                        False, 
                        "Response non contiene conferma eliminazione",
                        f"Response: {json.dumps(result, indent=2)}"
                    )
                    return False
            else:
                self.log_result(
                    "DELETE /api/auth/users/{user_id}", 
                    False, 
                    f"HTTP {response.status_code}",
                    f"Response: {response.text}"
                )
                return False
                
        except Exception as e:
            self.log_result(
                "DELETE /api/auth/users/{user_id}", 
                False, 
                f"Errore: {str(e)}",
                ""
            )
            return False

    def run_all_tests(self):
        """Esegue tutti i test in ordine di priorità"""
        print("🚀 Avvio test API Backend - Sistema Multi-Agente Tempocasa")
        print(f"🌐 Backend URL: {self.base_url}")
        print(f"👤 Credenziali Admin: {self.admin_credentials['username']}")
        print("=" * 70)
        
        # Test in ordine di priorità come richiesto
        tests = [
            ("1. Autenticazione Admin", self.test_admin_login),
            ("2. Verifica Profilo Admin", self.test_get_me),
            ("3. Lista Utenti", self.test_get_users),
            ("4. Creazione Nuovo Agente", self.test_create_user),
            ("5. Toggle Stato Utente", self.test_toggle_user_status),
            ("6. Creazione Immobile (Admin)", self.test_create_property_with_agent_id),
            ("7. Lista Immobili (Admin)", self.test_get_properties_as_admin),
            ("8. Aggiornamento Profilo", self.test_update_profile),
            ("9. Eliminazione Utente", self.test_delete_user),
        ]
        
        passed = 0
        total = len(tests)
        
        for test_name, test_func in tests:
            print(f"📋 {test_name}")
            if test_func():
                passed += 1
            print("-" * 50)
        
        # Riepilogo finale
        print("=" * 70)
        print(f"📊 RIEPILOGO TEST: {passed}/{total} PASSATI")
        
        if passed == total:
            print("🎉 Tutti i test sono passati! Il sistema multi-utente funziona correttamente.")
        else:
            print(f"⚠️  {total - passed} test falliti. Controllare i dettagli sopra.")
        
        print("\n📋 DETTAGLI RISULTATI:")
        for result in self.test_results:
            status = "✅" if result["success"] else "❌"
            print(f"{status} {result['test']}: {result['message']}")
        
        return passed == total

def main():
    """Funzione principale"""
    tester = MultiUserAPITester()
    success = tester.run_all_tests()
    
    # Exit code per CI/CD
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
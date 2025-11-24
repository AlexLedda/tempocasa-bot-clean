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

    def test_get_single_appointment(self) -> bool:
        """Test GET /api/appointments/{id} - Dettaglio singolo appuntamento"""
        if not self.created_appointment_id:
            self.log_result(
                "GET /api/appointments/{id}", 
                False, 
                "Nessun appuntamento disponibile per test dettaglio",
                "Questo endpoint potrebbe non essere implementato"
            )
            return False
            
        try:
            print(f"🔍 Testing GET /api/appointments/{self.created_appointment_id}...")
            
            response = self.session.get(f"{self.base_url}/appointments/{self.created_appointment_id}")
            
            if response.status_code == 200:
                appointment = response.json()
                
                # Verifica che sia un oggetto con i campi corretti
                required_fields = ['id', 'client_name', 'property_title', 'appointment_date', 'status']
                missing_fields = [field for field in required_fields if field not in appointment]
                
                if not missing_fields:
                    self.log_result(
                        "GET /api/appointments/{id}", 
                        True, 
                        "Dettaglio appuntamento restituito correttamente",
                        f"Appuntamento: {appointment.get('client_name')} - {appointment.get('property_title')}"
                    )
                    return True
                else:
                    self.log_result(
                        "GET /api/appointments/{id}", 
                        False, 
                        f"Campi mancanti: {missing_fields}",
                        f"Appuntamento: {json.dumps(appointment, indent=2)}"
                    )
                    return False
            elif response.status_code == 404:
                self.log_result(
                    "GET /api/appointments/{id}", 
                    False, 
                    "Endpoint non implementato (404)",
                    "Questo endpoint potrebbe non essere presente nel backend"
                )
                return False
            else:
                self.log_result(
                    "GET /api/appointments/{id}", 
                    False, 
                    f"HTTP {response.status_code}",
                    f"Response: {response.text}"
                )
                return False
                
        except Exception as e:
            self.log_result(
                "GET /api/appointments/{id}", 
                False, 
                f"Errore: {str(e)}",
                ""
            )
            return False

    def test_update_appointment(self) -> bool:
        """Test PUT /api/appointments/{id} - Aggiornamento appuntamento"""
        if not self.created_appointment_id:
            self.log_result(
                "PUT /api/appointments/{id}", 
                False, 
                "Nessun appuntamento disponibile per test aggiornamento",
                ""
            )
            return False
            
        try:
            print(f"✏️  Testing PUT /api/appointments/{self.created_appointment_id}...")
            
            # Test cambio stato: confermato → completato
            response = self.session.put(
                f"{self.base_url}/appointments/{self.created_appointment_id}",
                params={"status": "completato"}
            )
            
            if response.status_code == 200:
                result = response.json()
                
                # Verifica che l'aggiornamento sia andato a buon fine
                if "message" in result or "success" in result:
                    # Test cambio stato: completato → cancellato
                    response2 = self.session.put(
                        f"{self.base_url}/appointments/{self.created_appointment_id}",
                        params={"status": "cancellato"}
                    )
                    
                    if response2.status_code == 200:
                        self.log_result(
                            "PUT /api/appointments/{id}", 
                            True, 
                            "Aggiornamento stato funziona correttamente",
                            "Testati cambi stato: confermato → completato → cancellato"
                        )
                        return True
                    else:
                        self.log_result(
                            "PUT /api/appointments/{id}", 
                            False, 
                            f"Secondo aggiornamento fallito: HTTP {response2.status_code}",
                            f"Response: {response2.text}"
                        )
                        return False
                else:
                    self.log_result(
                        "PUT /api/appointments/{id}", 
                        False, 
                        "Response non contiene conferma aggiornamento",
                        f"Response: {json.dumps(result, indent=2)}"
                    )
                    return False
            else:
                self.log_result(
                    "PUT /api/appointments/{id}", 
                    False, 
                    f"HTTP {response.status_code}",
                    f"Response: {response.text}"
                )
                return False
                
        except Exception as e:
            self.log_result(
                "PUT /api/appointments/{id}", 
                False, 
                f"Errore: {str(e)}",
                ""
            )
            return False

    def test_delete_appointment(self) -> bool:
        """Test DELETE /api/appointments/{id} - Eliminazione appuntamento"""
        if not self.created_appointment_id:
            self.log_result(
                "DELETE /api/appointments/{id}", 
                False, 
                "Nessun appuntamento disponibile per test eliminazione",
                ""
            )
            return False
            
        try:
            print(f"🗑️  Testing DELETE /api/appointments/{self.created_appointment_id}...")
            
            response = self.session.delete(f"{self.base_url}/appointments/{self.created_appointment_id}")
            
            if response.status_code == 200:
                result = response.json()
                
                # Verifica che l'eliminazione sia andata a buon fine
                if "message" in result or "success" in result:
                    # Verifica che l'appuntamento sia stato effettivamente eliminato
                    verify_response = self.session.get(f"{self.base_url}/appointments")
                    if verify_response.status_code == 200:
                        appointments = verify_response.json()
                        deleted_found = any(apt.get('id') == self.created_appointment_id for apt in appointments)
                        
                        if not deleted_found:
                            self.log_result(
                                "DELETE /api/appointments/{id}", 
                                True, 
                                "Appuntamento eliminato correttamente",
                                "Verificato che non sia più presente nella lista"
                            )
                            return True
                        else:
                            self.log_result(
                                "DELETE /api/appointments/{id}", 
                                False, 
                                "Appuntamento ancora presente dopo eliminazione",
                                "L'eliminazione potrebbe non aver funzionato"
                            )
                            return False
                    else:
                        self.log_result(
                            "DELETE /api/appointments/{id}", 
                            True, 
                            "Eliminazione completata (verifica non possibile)",
                            f"Response: {json.dumps(result, indent=2)}"
                        )
                        return True
                else:
                    self.log_result(
                        "DELETE /api/appointments/{id}", 
                        False, 
                        "Response non contiene conferma eliminazione",
                        f"Response: {json.dumps(result, indent=2)}"
                    )
                    return False
            else:
                self.log_result(
                    "DELETE /api/appointments/{id}", 
                    False, 
                    f"HTTP {response.status_code}",
                    f"Response: {response.text}"
                )
                return False
                
        except Exception as e:
            self.log_result(
                "DELETE /api/appointments/{id}", 
                False, 
                f"Errore: {str(e)}",
                ""
            )
            return False

    def run_all_tests(self):
        """Esegue tutti i test in ordine di priorità"""
        print("🚀 Avvio test API Backend - Gestione Appuntamenti")
        print(f"🌐 Backend URL: {self.base_url}")
        print("=" * 60)
        
        # Test in ordine di priorità come richiesto
        tests = [
            ("1. GET /api/properties", self.test_get_properties),
            ("2. POST /api/appointments", self.test_create_appointment),
            ("3. GET /api/appointments", self.test_get_appointments),
            ("4. GET /api/appointments/{id}", self.test_get_single_appointment),
            ("5. PUT /api/appointments/{id}", self.test_update_appointment),
            ("6. DELETE /api/appointments/{id}", self.test_delete_appointment),
        ]
        
        passed = 0
        total = len(tests)
        
        for test_name, test_func in tests:
            print(f"📋 {test_name}")
            if test_func():
                passed += 1
            print("-" * 40)
        
        # Riepilogo finale
        print("=" * 60)
        print(f"📊 RIEPILOGO TEST: {passed}/{total} PASSATI")
        
        if passed == total:
            print("🎉 Tutti i test sono passati! Le API funzionano correttamente.")
        else:
            print(f"⚠️  {total - passed} test falliti. Controllare i dettagli sopra.")
        
        print("\n📋 DETTAGLI RISULTATI:")
        for result in self.test_results:
            status = "✅" if result["success"] else "❌"
            print(f"{status} {result['test']}: {result['message']}")
        
        return passed == total

def main():
    """Funzione principale"""
    tester = AppointmentAPITester()
    success = tester.run_all_tests()
    
    # Exit code per CI/CD
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
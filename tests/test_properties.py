"""
Test Suite for Properties API
"""
import pytest
from fastapi.testclient import TestClient
from backend.server import app
import os

os.environ["JWT_SECRET_KEY"] = "test-secret-key-for-testing-only"
os.environ["MONGO_URL"] = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
os.environ["DB_NAME"] = "tempocasa_test"

client = TestClient(app)


@pytest.fixture
def auth_token():
    """Fixture to get authentication token"""
    response = client.post("/api/auth/register", json={
        "username": "proptest",
        "password": "testpass123",
        "full_name": "Property Test",
        "role": "agent"
    })
    return response.json()["access_token"]


class TestProperties:
    """Test properties endpoints"""
    
    def test_create_property(self, auth_token):
        """Test creating a property"""
        response = client.post(
            "/api/properties",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={
                "title": "Appartamento Centro",
                "description": "Bellissimo appartamento",
                "price": 150000,
                "location": "Tarquinia Centro",
                "bedrooms": 2,
                "bathrooms": 1,
                "square_meters": 80,
                "property_type": "Appartamento"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Appartamento Centro"
        assert data["price"] == 150000
    
    def test_get_properties(self, auth_token):
        """Test getting properties list"""
        # Create a property first
        client.post(
            "/api/properties",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={
                "title": "Villa Mare",
                "description": "Villa fronte mare",
                "price": 500000,
                "location": "Lido",
                "bedrooms": 4,
                "bathrooms": 3,
                "square_meters": 200,
                "property_type": "Villa"
            }
        )
        
        # Get properties
        response = client.get(
            "/api/properties",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
    
    def test_create_property_unauthenticated(self):
        """Test creating property without authentication"""
        response = client.post("/api/properties", json={
            "title": "Test Property",
            "description": "Test",
            "price": 100000,
            "location": "Test",
            "bedrooms": 2,
            "bathrooms": 1,
            "square_meters": 80,
            "property_type": "Appartamento"
        })
        
        assert response.status_code == 403


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

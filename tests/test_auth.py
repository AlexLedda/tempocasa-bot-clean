"""
Test Suite for Authentication
"""
import pytest
from fastapi.testclient import TestClient
from backend.server import app
import os

# Set test environment
os.environ["JWT_SECRET_KEY"] = "test-secret-key-for-testing-only"
os.environ["MONGO_URL"] = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
os.environ["DB_NAME"] = "tempocasa_test"

client = TestClient(app)


class TestAuth:
    """Test authentication endpoints"""
    
    def test_register_success(self):
        """Test successful user registration"""
        response = client.post("/api/auth/register", json={
            "username": "testuser",
            "password": "testpass123",
            "full_name": "Test User",
            "email": "test@example.com",
            "role": "agent"
        })
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["user"]["username"] == "testuser"
    
    def test_register_duplicate_username(self):
        """Test registration with duplicate username"""
        # First registration
        client.post("/api/auth/register", json={
            "username": "duplicate",
            "password": "testpass123",
            "full_name": "Test User",
            "role": "agent"
        })
        
        # Second registration with same username
        response = client.post("/api/auth/register", json={
            "username": "duplicate",
            "password": "testpass123",
            "full_name": "Test User 2",
            "role": "agent"
        })
        
        assert response.status_code == 400
        assert "già registrato" in response.json()["detail"]
    
    def test_login_success(self):
        """Test successful login"""
        # Register user first
        client.post("/api/auth/register", json={
            "username": "logintest",
            "password": "testpass123",
            "full_name": "Login Test",
            "role": "agent"
        })
        
        # Login
        response = client.post("/api/auth/login", json={
            "username": "logintest",
            "password": "testpass123"
        })
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["user"]["username"] == "logintest"
    
    def test_login_wrong_password(self):
        """Test login with wrong password"""
        # Register user
        client.post("/api/auth/register", json={
            "username": "wrongpass",
            "password": "correctpass",
            "full_name": "Test User",
            "role": "agent"
        })
        
        # Login with wrong password
        response = client.post("/api/auth/login", json={
            "username": "wrongpass",
            "password": "wrongpassword"
        })
        
        assert response.status_code == 401
        assert "incorretti" in response.json()["detail"]
    
    def test_get_me_authenticated(self):
        """Test getting current user info"""
        # Register and login
        reg_response = client.post("/api/auth/register", json={
            "username": "metest",
            "password": "testpass123",
            "full_name": "Me Test",
            "role": "agent"
        })
        
        token = reg_response.json()["access_token"]
        
        # Get current user
        response = client.get(
            "/api/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["username"] == "metest"
    
    def test_get_me_unauthenticated(self):
        """Test getting current user without token"""
        response = client.get("/api/auth/me")
        assert response.status_code == 403  # No authorization header


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

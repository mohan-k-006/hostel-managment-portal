import pytest
from fastapi.testclient import TestClient
from main import app
from database import Base, engine, SessionLocal
import auth

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "online"

def test_admin_login():
    response = client.post(
        "/api/auth/login",
        json={"email": "admin@hostel.edu", "password": "admin123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "admin"

def test_student_login():
    response = client.post(
        "/api/auth/login",
        json={"email": "student@hostel.edu", "password": "student123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "student"

def test_smart_auto_triage():
    from routers.complaints import smart_auto_triage
    priority = smart_auto_triage(
        title="Electrical spark near study table",
        description="There is a short circuit spark when plugging in charger.",
        current_priority="Low"
    )
    assert priority == "Emergency"

def test_get_rooms():
    # Login to get token
    login_resp = client.post(
        "/api/auth/login",
        json={"email": "admin@hostel.edu", "password": "admin123"}
    )
    token = login_resp.json()["access_token"]
    
    response = client.get(
        "/api/rooms",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    rooms = response.json()
    assert len(rooms) >= 1

def test_analytics_dashboard():
    login_resp = client.post(
        "/api/auth/login",
        json={"email": "admin@hostel.edu", "password": "admin123"}
    )
    token = login_resp.json()["access_token"]
    
    response = client.get(
        "/api/analytics/dashboard",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "rooms" in data
    assert "complaints" in data
    assert "fees" in data

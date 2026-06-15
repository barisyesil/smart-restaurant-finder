from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_register_returns_token_and_me_works():
    response = client.post(
        "/auth/register", json={"email": "a@example.com", "password": "secret123"}
    )
    assert response.status_code == 201
    token = response.json()["access_token"]

    me = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me.status_code == 200
    assert me.json()["email"] == "a@example.com"


def test_duplicate_email_rejected():
    client.post("/auth/register", json={"email": "dup@example.com", "password": "secret123"})
    response = client.post(
        "/auth/register", json={"email": "dup@example.com", "password": "secret123"}
    )
    assert response.status_code == 409


def test_login_success_and_wrong_password():
    client.post("/auth/register", json={"email": "b@example.com", "password": "secret123"})

    ok = client.post("/auth/login", json={"email": "b@example.com", "password": "secret123"})
    assert ok.status_code == 200
    assert "access_token" in ok.json()

    bad = client.post("/auth/login", json={"email": "b@example.com", "password": "wrong"})
    assert bad.status_code == 401


def test_me_requires_authentication():
    assert client.get("/auth/me").status_code == 401

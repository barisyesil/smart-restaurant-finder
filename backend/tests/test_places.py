from fastapi.testclient import TestClient

import app.api.places as places_module
from app.core.config import settings
from app.main import app
from app.schemas.place import Place

client = TestClient(app)


def test_nearby_returns_places(monkeypatch):
    monkeypatch.setattr(settings, "google_maps_api_key", "test-key")

    async def fake_fetch(lat, lon, radius):
        return [
            Place(
                id="abc123",
                name="Test Cafe",
                category="cafe",
                types=["cafe"],
                rating=4.6,
                user_ratings_total=1200,
                price_level=2,
                address="Atatürk Cd 5",
                lat=lat,
                lon=lon,
                distance_m=42,
                open_now=True,
            )
        ]

    monkeypatch.setattr(places_module, "fetch_nearby_places", fake_fetch)

    response = client.get("/places/nearby", params={"lat": 39.0, "lon": 30.0, "radius": 500})

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == "Test Cafe"
    assert data[0]["rating"] == 4.6


def test_nearby_requires_api_key(monkeypatch):
    monkeypatch.setattr(settings, "google_maps_api_key", "")
    response = client.get("/places/nearby", params={"lat": 39.0, "lon": 30.0})
    assert response.status_code == 503


def test_nearby_validates_coordinates():
    response = client.get("/places/nearby", params={"lat": 200, "lon": 30})
    assert response.status_code == 422

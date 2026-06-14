from fastapi.testclient import TestClient

import app.api.places as places_module
from app.core.config import settings
from app.main import app
from app.schemas.place import Place, PlaceDetail

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


def test_recommend_endpoint(monkeypatch):
    monkeypatch.setattr(settings, "google_maps_api_key", "test-key")

    async def fake_fetch(lat, lon, radius):
        return [
            Place(
                id="a",
                name="Kafe A",
                category="cafe",
                rating=4.5,
                user_ratings_total=100,
                lat=lat,
                lon=lon,
                distance_m=100,
            )
        ]

    monkeypatch.setattr(places_module, "fetch_nearby_places", fake_fetch)

    response = client.post(
        "/places/recommend",
        json={"lat": 39.0, "lon": 30.0, "radius": 1000, "categories": ["cafe"]},
    )

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["category"] == "cafe"
    assert "score" in data[0]
    assert isinstance(data[0]["reasons"], list)


def test_place_detail_returns_data(monkeypatch):
    monkeypatch.setattr(settings, "google_maps_api_key", "test-key")

    async def fake_details(place_id):
        return PlaceDetail(
            id=place_id,
            name="Test Mekan",
            category="cafe",
            lat=39.0,
            lon=30.0,
            rating=4.5,
            phone="0212 000 00 00",
            opening_hours=["Pazartesi: 09:00–18:00"],
            photo_uri="https://example.com/p.jpg",
        )

    monkeypatch.setattr(places_module, "fetch_place_details", fake_details)

    response = client.get("/places/xyz123")

    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Test Mekan"
    assert data["phone"] == "0212 000 00 00"
    assert data["photo_uri"] == "https://example.com/p.jpg"

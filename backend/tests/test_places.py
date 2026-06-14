from fastapi.testclient import TestClient

import app.api.places as places_module
from app.main import app
from app.schemas.place import Place

client = TestClient(app)


def test_nearby_returns_places(monkeypatch):
    async def fake_fetch(lat, lon, radius):
        return [
            Place(
                id=1,
                name="Test Cafe",
                category="cafe",
                cuisine="coffee_shop",
                address="Atatürk Cd 5",
                lat=lat,
                lon=lon,
                distance_m=42,
            )
        ]

    monkeypatch.setattr(places_module, "fetch_nearby_places", fake_fetch)

    response = client.get("/places/nearby", params={"lat": 39.0, "lon": 30.0, "radius": 500})

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == "Test Cafe"
    assert data[0]["distance_m"] == 42


def test_nearby_validates_coordinates():
    response = client.get("/places/nearby", params={"lat": 200, "lon": 30})
    assert response.status_code == 422

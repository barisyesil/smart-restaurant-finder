from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def _auth_headers(email: str) -> dict[str, str]:
    token = client.post(
        "/auth/register", json={"email": email, "password": "secret123"}
    ).json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


SAMPLE_PLACE = {
    "id": "place-1",
    "name": "Köşe Kafe",
    "category": "cafe",
    "types": ["cafe", "coffee_shop"],
    "rating": 4.5,
    "user_ratings_total": 120,
    "price_level": 2,
    "lat": 41.0,
    "lon": 29.0,
}


def test_saved_add_list_remove():
    headers = _auth_headers("saved@example.com")

    client.post("/me/saved", json={"kind": "favorite", "place": SAMPLE_PLACE}, headers=headers)
    listed = client.get("/me/saved", headers=headers).json()
    assert len(listed["favorites"]) == 1
    assert listed["favorites"][0]["id"] == "place-1"

    client.delete("/me/saved/favorite/place-1", headers=headers)
    listed = client.get("/me/saved", headers=headers).json()
    assert listed["favorites"] == []


def test_saved_requires_auth():
    assert client.get("/me/saved").status_code == 401


def test_preferences_put_and_get():
    headers = _auth_headers("prefs@example.com")

    payload = {
        "categories": ["cafe"],
        "cuisines": ["coffee_shop"],
        "max_distance": 3000,
        "max_price": 2,
        "open_now": True,
    }
    put = client.put("/me/preferences", json=payload, headers=headers)
    assert put.status_code == 200

    got = client.get("/me/preferences", headers=headers).json()
    assert got["max_distance"] == 3000
    assert got["cuisines"] == ["coffee_shop"]
    assert got["open_now"] is True


def test_preferences_defaults_when_none():
    headers = _auth_headers("defaults@example.com")
    got = client.get("/me/preferences", headers=headers).json()
    assert got["categories"] == []
    assert got["max_distance"] == 1500

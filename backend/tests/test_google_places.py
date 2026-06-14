from app.services.google_places import _derive_category, _parse_place


def test_derive_category():
    assert _derive_category(["coffee_shop", "cafe"], None) == "cafe"
    assert _derive_category(["meal_takeaway"], "fast_food_restaurant") == "fast_food"
    assert _derive_category(["restaurant"], "restaurant") == "restaurant"
    assert _derive_category([], None) == "restaurant"


def test_parse_place_full():
    raw = {
        "id": "x1",
        "displayName": {"text": "Köfteci"},
        "location": {"latitude": 39.0, "longitude": 30.0},
        "types": ["restaurant"],
        "rating": 4.2,
        "userRatingCount": 10,
        "priceLevel": "PRICE_LEVEL_MODERATE",
        "formattedAddress": "Adres 1",
        "currentOpeningHours": {"openNow": True},
        "photos": [{"name": "places/x1/photos/p1"}],
    }
    place = _parse_place(raw, 39.0, 30.0)
    assert place is not None
    assert place.name == "Köfteci"
    assert place.price_level == 2
    assert place.open_now is True
    assert place.photo_name == "places/x1/photos/p1"
    assert place.distance_m == 0


def test_parse_place_missing_name_returns_none():
    raw = {"id": "x", "location": {"latitude": 1.0, "longitude": 1.0}}
    assert _parse_place(raw, 0.0, 0.0) is None

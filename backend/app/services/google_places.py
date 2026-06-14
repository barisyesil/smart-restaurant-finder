import time

import httpx

from app.core.config import settings
from app.schemas.place import Place, PlaceDetail
from app.utils.geo import haversine_distance

NEARBY_URL = "https://places.googleapis.com/v1/places:searchNearby"
DETAILS_URL = "https://places.googleapis.com/v1/places/{place_id}"
PHOTO_URL = "https://places.googleapis.com/v1/{photo_name}/media"

# Google Places (New) tip tablosundan ilgili yeme-içme türleri.
INCLUDED_TYPES = ["restaurant", "cafe", "bakery", "bar", "meal_takeaway"]

# Yalnızca ihtiyacımız olan alanları isteyerek SKU maliyetini düşürürüz.
FIELD_MASK = ",".join(
    [
        "places.id",
        "places.displayName",
        "places.types",
        "places.primaryType",
        "places.location",
        "places.rating",
        "places.userRatingCount",
        "places.priceLevel",
        "places.formattedAddress",
        "places.currentOpeningHours.openNow",
        "places.photos",
    ]
)

# Place Details (tekil) alan maskesi — "places." ön eki YOK (Nearby'den farklı).
DETAILS_FIELD_MASK = ",".join(
    [
        "id",
        "displayName",
        "types",
        "primaryType",
        "location",
        "rating",
        "userRatingCount",
        "priceLevel",
        "formattedAddress",
        "currentOpeningHours.openNow",
        "currentOpeningHours.weekdayDescriptions",
        "nationalPhoneNumber",
        "websiteUri",
        "googleMapsUri",
        "photos",
        "editorialSummary",
    ]
)

PRICE_LEVEL_MAP = {
    "PRICE_LEVEL_FREE": 0,
    "PRICE_LEVEL_INEXPENSIVE": 1,
    "PRICE_LEVEL_MODERATE": 2,
    "PRICE_LEVEL_EXPENSIVE": 3,
    "PRICE_LEVEL_VERY_EXPENSIVE": 4,
}

CAFE_TYPES = {"cafe", "coffee_shop"}
FAST_FOOD_TYPES = {"fast_food_restaurant", "meal_takeaway", "meal_delivery"}

# Basit in-memory TTL cache: aynı bölgeye tekrarlanan istekleri Google'a göndermeyiz.
_CACHE: dict[tuple[float, float, int], tuple[float, list[Place]]] = {}
_DETAILS_CACHE: dict[str, tuple[float, PlaceDetail]] = {}
_PHOTO_CACHE: dict[str, tuple[float, str | None]] = {}
_CACHE_TTL = 300.0  # saniye


def _derive_category(types: list[str], primary: str | None) -> str:
    all_types = set(types or [])
    if primary:
        all_types.add(primary)
    if all_types & CAFE_TYPES:
        return "cafe"
    if all_types & FAST_FOOD_TYPES:
        return "fast_food"
    return "restaurant"


def _parse_place(raw: dict, user_lat: float, user_lon: float) -> Place | None:
    name = (raw.get("displayName") or {}).get("text")
    location = raw.get("location") or {}
    lat = location.get("latitude")
    lon = location.get("longitude")
    if not name or lat is None or lon is None:
        return None

    photos = raw.get("photos") or []
    return Place(
        id=raw["id"],
        name=name,
        category=_derive_category(raw.get("types", []), raw.get("primaryType")),
        types=raw.get("types", []),
        rating=raw.get("rating"),
        user_ratings_total=raw.get("userRatingCount"),
        price_level=PRICE_LEVEL_MAP.get(raw.get("priceLevel")),
        address=raw.get("formattedAddress"),
        lat=lat,
        lon=lon,
        distance_m=round(haversine_distance(user_lat, user_lon, lat, lon)),
        open_now=(raw.get("currentOpeningHours") or {}).get("openNow"),
        photo_name=photos[0]["name"] if photos else None,
    )


async def fetch_nearby_places(lat: float, lon: float, radius: int) -> list[Place]:
    """Google Places (New) Nearby Search ile çevredeki mekanları getirir (mesafeye göre sıralı)."""
    cache_key = (round(lat, 4), round(lon, 4), radius)
    cached = _CACHE.get(cache_key)
    if cached and time.monotonic() - cached[0] < _CACHE_TTL:
        return cached[1]

    body = {
        "includedTypes": INCLUDED_TYPES,
        "maxResultCount": 20,
        "locationRestriction": {
            "circle": {
                "center": {"latitude": lat, "longitude": lon},
                "radius": float(radius),
            }
        },
        "rankPreference": "DISTANCE",
    }
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": settings.google_maps_api_key,
        "X-Goog-FieldMask": FIELD_MASK,
    }

    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(NEARBY_URL, json=body, headers=headers)
        response.raise_for_status()

    raw_places = response.json().get("places", [])
    places = [
        place
        for raw in raw_places
        if (place := _parse_place(raw, lat, lon)) is not None
    ]
    places.sort(key=lambda place: place.distance_m)

    _CACHE[cache_key] = (time.monotonic(), places)
    return places


async def _resolve_photo(
    client: httpx.AsyncClient, photo_name: str, max_width: int = 600
) -> str | None:
    """Google foto kaynak adını gösterilebilir bir URL'ye çözer (cache'li)."""
    cached = _PHOTO_CACHE.get(photo_name)
    if cached and time.monotonic() - cached[0] < _CACHE_TTL:
        return cached[1]

    response = await client.get(
        PHOTO_URL.format(photo_name=photo_name),
        params={"maxWidthPx": max_width, "skipHttpRedirect": "true"},
        headers={"X-Goog-Api-Key": settings.google_maps_api_key},
    )
    response.raise_for_status()
    uri = response.json().get("photoUri")
    _PHOTO_CACHE[photo_name] = (time.monotonic(), uri)
    return uri


def _parse_detail(raw: dict, photo_uri: str | None) -> PlaceDetail:
    location = raw.get("location") or {}
    hours = raw.get("currentOpeningHours") or {}
    return PlaceDetail(
        id=raw["id"],
        name=(raw.get("displayName") or {}).get("text", ""),
        category=_derive_category(raw.get("types", []), raw.get("primaryType")),
        types=raw.get("types", []),
        rating=raw.get("rating"),
        user_ratings_total=raw.get("userRatingCount"),
        price_level=PRICE_LEVEL_MAP.get(raw.get("priceLevel")),
        address=raw.get("formattedAddress"),
        lat=location.get("latitude", 0.0),
        lon=location.get("longitude", 0.0),
        open_now=hours.get("openNow"),
        phone=raw.get("nationalPhoneNumber"),
        website=raw.get("websiteUri"),
        google_maps_uri=raw.get("googleMapsUri"),
        opening_hours=hours.get("weekdayDescriptions", []),
        photo_uri=photo_uri,
        editorial_summary=(raw.get("editorialSummary") or {}).get("text"),
    )


async def fetch_place_details(place_id: str) -> PlaceDetail:
    """Tek bir mekanın detayını (Place Details New) + ilk fotoğrafını getirir (cache'li, lazy)."""
    cached = _DETAILS_CACHE.get(place_id)
    if cached and time.monotonic() - cached[0] < _CACHE_TTL:
        return cached[1]

    headers = {
        "X-Goog-Api-Key": settings.google_maps_api_key,
        "X-Goog-FieldMask": DETAILS_FIELD_MASK,
    }
    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.get(DETAILS_URL.format(place_id=place_id), headers=headers)
        response.raise_for_status()
        raw = response.json()

        photo_uri = None
        photos = raw.get("photos") or []
        if photos:
            photo_uri = await _resolve_photo(client, photos[0]["name"])

    detail = _parse_detail(raw, photo_uri)
    _DETAILS_CACHE[place_id] = (time.monotonic(), detail)
    return detail

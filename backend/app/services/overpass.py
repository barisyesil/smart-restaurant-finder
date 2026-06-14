import httpx

from app.schemas.place import Place
from app.utils.geo import haversine_distance

OVERPASS_URL = "https://overpass-api.de/api/interpreter"
CATEGORIES = ("restaurant", "cafe", "fast_food")

# Overpass, isteklerde kendini tanıtan bir User-Agent bekler.
HEADERS = {"User-Agent": "SmartRestaurantFinder/1.0 (interview project)"}


def _build_query(lat: float, lon: float, radius: int) -> str:
    """Belirtilen nokta etrafındaki mekanları getiren Overpass QL sorgusu üretir."""
    amenity_filter = "|".join(CATEGORIES)
    return f"""
    [out:json][timeout:25];
    (
      node["amenity"~"^({amenity_filter})$"](around:{radius},{lat},{lon});
      way["amenity"~"^({amenity_filter})$"](around:{radius},{lat},{lon});
    );
    out center tags;
    """


def _format_address(tags: dict) -> str | None:
    parts = [tags.get("addr:street"), tags.get("addr:housenumber"), tags.get("addr:city")]
    address = " ".join(part for part in parts if part)
    return address or None


def _parse_element(element: dict, user_lat: float, user_lon: float) -> Place | None:
    tags = element.get("tags", {})
    name = tags.get("name")
    if not name:
        return None  # isimsiz mekanları öneri listesine almıyoruz

    # node -> doğrudan lat/lon; way/relation -> center
    lat = element.get("lat") or element.get("center", {}).get("lat")
    lon = element.get("lon") or element.get("center", {}).get("lon")
    if lat is None or lon is None:
        return None

    return Place(
        id=element["id"],
        name=name,
        category=tags.get("amenity", "restaurant"),
        cuisine=tags.get("cuisine"),
        address=_format_address(tags),
        lat=lat,
        lon=lon,
        distance_m=round(haversine_distance(user_lat, user_lon, lat, lon)),
    )


async def fetch_nearby_places(lat: float, lon: float, radius: int) -> list[Place]:
    """Overpass API'den çevredeki mekanları çeker, mesafeye göre sıralı döndürür."""
    query = _build_query(lat, lon, radius)
    async with httpx.AsyncClient(timeout=30, headers=HEADERS) as client:
        response = await client.post(OVERPASS_URL, data={"data": query})
        response.raise_for_status()

    elements = response.json().get("elements", [])
    places = [
        place
        for element in elements
        if (place := _parse_element(element, lat, lon)) is not None
    ]
    places.sort(key=lambda place: place.distance_m)
    return places

from pydantic import BaseModel


class Place(BaseModel):
    """Bir mekanı (restoran/kafe/fast-food) temsil eden veri modeli (Google Places kaynaklı)."""

    id: str  # Google place id
    name: str
    category: str  # restaurant | cafe | fast_food
    types: list[str] = []
    rating: float | None = None
    user_ratings_total: int | None = None
    price_level: int | None = None  # 0 (ücretsiz) – 4 (çok pahalı)
    address: str | None = None
    lat: float
    lon: float
    distance_m: int  # kullanıcıya kuş uçuşu mesafe (metre)
    open_now: bool | None = None
    photo_name: str | None = None  # ilk fotoğrafın Google kaynak adı (lazy çözümlenir)


class PlaceDetail(BaseModel):
    """Tek bir mekanın detaylı bilgisi (Place Details + çözümlenmiş foto)."""

    id: str
    name: str
    category: str
    types: list[str] = []
    rating: float | None = None
    user_ratings_total: int | None = None
    price_level: int | None = None
    address: str | None = None
    lat: float
    lon: float
    open_now: bool | None = None
    phone: str | None = None
    website: str | None = None
    google_maps_uri: str | None = None
    opening_hours: list[str] = []  # haftanın günlerine göre saatler
    photo_uri: str | None = None
    editorial_summary: str | None = None

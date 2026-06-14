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

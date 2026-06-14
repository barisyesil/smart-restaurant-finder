from pydantic import BaseModel, Field


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


class RecommendRequest(BaseModel):
    """Kişiselleştirilmiş öneri isteği (konum + kullanıcı tercihleri)."""

    lat: float = Field(..., ge=-90, le=90)
    lon: float = Field(..., ge=-180, le=180)
    radius: int = Field(1000, ge=100, le=5000)
    categories: list[str] = []  # boş = tüm türler
    max_price: int | None = Field(None, ge=0, le=4)  # None = fiyat farketmez
    favorite_ids: list[str] = []


class RecommendedPlace(Place):
    """Skorlanmış mekan + 'neden önerildi' gerekçeleri."""

    score: float
    reasons: list[str] = []

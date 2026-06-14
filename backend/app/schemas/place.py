from pydantic import BaseModel


class Place(BaseModel):
    """Bir mekanı (restoran/kafe/fast-food) temsil eden veri modeli."""

    id: int
    name: str
    category: str  # restaurant | cafe | fast_food
    cuisine: str | None = None
    address: str | None = None
    lat: float
    lon: float
    distance_m: int  # kullanıcıya kuş uçuşu mesafe (metre)

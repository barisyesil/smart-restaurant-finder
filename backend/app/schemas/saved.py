from pydantic import BaseModel


class SavedPlaceSchema(BaseModel):
    id: str  # Google place id
    name: str
    category: str
    types: list[str] = []
    rating: float | None = None
    user_ratings_total: int | None = None
    price_level: int | None = None
    lat: float
    lon: float


class SavedCollection(BaseModel):
    favorites: list[SavedPlaceSchema] = []
    wishlist: list[SavedPlaceSchema] = []
    visited: list[SavedPlaceSchema] = []


class AddSavedRequest(BaseModel):
    kind: str  # favorite | wishlist | visited
    place: SavedPlaceSchema

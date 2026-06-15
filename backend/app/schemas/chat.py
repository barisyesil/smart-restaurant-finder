from typing import Literal

from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    """Sohbet geçmişindeki tek bir mesaj (çok turlu bağlam için)."""

    role: Literal["user", "model"]
    text: str


class ChatPlace(BaseModel):
    """Modelin önerebilmesi için gönderilen, o an görünen aday mekan (kompakt)."""

    id: str
    name: str
    category: str
    rating: float | None = None
    distance_m: int | None = None
    price_level: int | None = None
    open_now: bool | None = None
    reason: str | None = None  # skorlama motorunun ürettiği ilk gerekçe


class ChatSavedPlace(BaseModel):
    """Kullanıcının kaydettiği bir mekanın özeti (favori/gidilecek/gidilen)."""

    id: str
    name: str
    category: str


class ChatContext(BaseModel):
    """Modelin karar verirken kullandığı bağlam: o anki filtreler, görünür mekanlar ve
    kullanıcının kayıtlı listeleri."""

    locale: str = "tr"  # arayüz dili (tr/en) — modelin yanıt dili
    categories: list[str] = []
    cuisines: list[str] = []
    max_distance: int | None = None
    max_price: int | None = None
    open_now: bool | None = None
    has_location: bool = False
    places: list[ChatPlace] = []
    favorites: list[ChatSavedPlace] = []
    wishlist: list[ChatSavedPlace] = []
    visited: list[ChatSavedPlace] = []


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=500)
    history: list[ChatMessage] = []
    context: ChatContext | None = None


class ChatAction(BaseModel):
    """Modelin döndürdüğü yapılandırılmış eylem. Frontend bunu store'a uygular.

    apply_filters: null OLMAYAN her alan, ilgili filtrenin yeni TAM değeridir.
    set_location: location_query frontend'de Nominatim ile çözülür.
    reset_filters: tüm tercihleri varsayılana döndürür.
    """

    type: Literal["apply_filters", "set_location", "reset_filters"]
    categories: list[str] | None = None
    cuisines: list[str] | None = None
    max_distance: int | None = None
    max_price: int | None = None
    open_now: bool | None = None
    location_query: str | None = None


class PlaceRecommendation(BaseModel):
    """Modelin seçtiği somut bir mekan + kullanıcıya özel doğal dil gerekçesi.
    place_id yalnızca context'te verilen mekanlardan biri olabilir (sanitize doğrular)."""

    place_id: str
    reason: str


class ChatResponse(BaseModel):
    reply: str
    actions: list[ChatAction] = []
    recommendations: list[PlaceRecommendation] = []
    suggestions: list[str] = []

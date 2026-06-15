from typing import Literal

from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    """Sohbet geçmişindeki tek bir mesaj (çok turlu bağlam için)."""

    role: Literal["user", "model"]
    text: str


class ChatContext(BaseModel):
    """Kullanıcının o anki filtre durumu. Modelin artımlı istekleri ('bir de açık olsun')
    doğru yorumlaması için gönderilir."""

    categories: list[str] = []
    cuisines: list[str] = []
    max_distance: int | None = None
    max_price: int | None = None
    open_now: bool | None = None
    has_location: bool = False


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


class ChatResponse(BaseModel):
    reply: str
    actions: list[ChatAction] = []
    suggestions: list[str] = []

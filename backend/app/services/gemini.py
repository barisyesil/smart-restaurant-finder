"""Gemini tabanlı doğal dil → yapılandırılmış filtre/konum eylemleri servisi.

Tasarım kararı: Modeli serbest metinle bırakmak yerine, çıktısını katı bir JSON
şemasına (ChatResponse) zorluyoruz (Gemini "structured output"). Böylece:
  * Çıktı tip-güvenli ve doğrudan store'a uygulanabilir (halüsinasyon riski yok).
  * Model geçersiz bir mutfak/kategori uydursa bile _sanitize() onu geçerli
    enum'lara "snap"ler ve sayısal değerleri güvenli aralığa kıstırır.
Bu, "function-calling" desenidir: model araç (eylem) çağrıları üretir, deterministik
katman doğrular, frontend uygular.
"""

import json

from google import genai
from google.genai import types

from app.core.config import settings
from app.schemas.chat import ChatAction, ChatRequest, ChatResponse

# Frontend'deki filtre enum'larıyla bire bir aynı (tek doğruluk kaynağı: bu set).
VALID_CATEGORIES = {"restaurant", "cafe", "fast_food"}
VALID_CUISINES = {
    "turkish_restaurant",
    "pizza_restaurant",
    "hamburger_restaurant",
    "coffee_shop",
    "dessert_shop",
    "seafood_restaurant",
    "bakery",
    "bar",
}
MIN_DISTANCE = 250
MAX_DISTANCE = 20000
MAX_HISTORY = 8
MAX_SUGGESTIONS = 4

SYSTEM_INSTRUCTION = """\
Sen "Akıllı Restoran Bulucu" uygulamasının asistanısın. Kullanıcının doğal dildeki
isteğini, haritayı ve listeyi güncelleyen yapılandırılmış eylemlere çeviriyorsun.

Üretebileceğin eylemler (actions):
1) apply_filters — filtreleri ayarlar. Sadece kullanıcının ima ettiği alanları doldur;
   değiştirilmeyecek alanları null bırak. Döndürdüğün her alan o filtrenin YENİ TAM
   değeridir (eski değerin üzerine yazılır).
   - categories: sadece ["restaurant","cafe","fast_food"] arasından.
   - cuisines: sadece şu Google türlerinden:
     ["turkish_restaurant","pizza_restaurant","hamburger_restaurant","coffee_shop",
      "dessert_shop","seafood_restaurant","bakery","bar"].
     (kahve/kahveci→coffee_shop, tatlı→dessert_shop, balık/deniz→seafood_restaurant,
      pizza→pizza_restaurant, burger→hamburger_restaurant, fırın/pastane→bakery,
      türk/kebap/ev yemeği→turkish_restaurant, bar/pub→bar)
   - max_distance: METRE cinsinden. "yürüme mesafesi"≈800, "yakın"≈1000, "çok yakın"≈500,
     "biraz uzak olabilir"≈5000. 250–20000 aralığında tut.
   - max_price: 0–4. "ucuz/bütçe dostu/hesaplı"→2, "orta"→3, "lüks/pahalı/şık"→4.
     Fiyattan hiç bahsedilmediyse null bırak.
   - open_now: "açık/şu an açık/şimdi gidebileceğim" geçerse true.
2) set_location — kullanıcı bir şehir/semt/yer adı söylerse (ör. "Kadıköy'de", "Beşiktaş").
   location_query alanına o yer adını yaz.
3) reset_filters — "sıfırla/temizle/baştan başla/filtreleri kaldır" gibi isteklerde.

reply: Kullanıcının diliyle (Türkçe isteğe Türkçe), kısa ve samimi 1-2 cümle. Ne yaptığını
özetle. Eğer isteği anlamadıysan veya konu dışıysa, eylem üretme; nazikçe ne yapabildiğini
söyle.
suggestions: Kullanıcının diliyle 2-4 kısa takip önerisi (tıklanabilir çip metni gibi,
ör. "Sadece açık olanlar", "Daha yakın").
"""

_client: genai.Client | None = None


def is_configured() -> bool:
    return bool(settings.gemini_api_key)


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        _client = genai.Client(api_key=settings.gemini_api_key)
    return _client


def _clamp(value: int, low: int, high: int) -> int:
    return max(low, min(high, value))


def _sanitize(response: ChatResponse) -> ChatResponse:
    """Modelin döndürdüğü eylemleri geçerli enum'lara snap'ler ve aralıkları kıstırır."""
    clean: list[ChatAction] = []
    for action in response.actions:
        if action.type == "apply_filters":
            categories = (
                [c for c in action.categories if c in VALID_CATEGORIES]
                if action.categories is not None
                else None
            )
            cuisines = (
                [c for c in action.cuisines if c in VALID_CUISINES]
                if action.cuisines is not None
                else None
            )
            distance = (
                _clamp(action.max_distance, MIN_DISTANCE, MAX_DISTANCE)
                if action.max_distance is not None
                else None
            )
            price = _clamp(action.max_price, 0, 4) if action.max_price is not None else None
            clean.append(
                ChatAction(
                    type="apply_filters",
                    categories=categories,
                    cuisines=cuisines,
                    max_distance=distance,
                    max_price=price,
                    open_now=action.open_now,
                )
            )
        elif action.type == "set_location":
            query = (action.location_query or "").strip()
            if query:
                clean.append(ChatAction(type="set_location", location_query=query))
        elif action.type == "reset_filters":
            clean.append(ChatAction(type="reset_filters"))

    return ChatResponse(
        reply=response.reply,
        actions=clean,
        suggestions=response.suggestions[:MAX_SUGGESTIONS],
    )


def _build_contents(request: ChatRequest) -> list[types.Content]:
    contents: list[types.Content] = []
    for message in request.history[-MAX_HISTORY:]:
        contents.append(
            types.Content(role=message.role, parts=[types.Part(text=message.text)])
        )
    contents.append(types.Content(role="user", parts=[types.Part(text=request.message)]))
    return contents


async def chat(request: ChatRequest) -> ChatResponse:
    """Kullanıcı mesajını Gemini'ye gönderir, doğrulanmış eylem setini döndürür."""
    client = _get_client()

    system = SYSTEM_INSTRUCTION
    if request.context is not None:
        system += "\n\nKullanıcının şu anki filtre durumu: " + request.context.model_dump_json()

    response = await client.aio.models.generate_content(
        model=settings.gemini_model,
        contents=_build_contents(request),
        config=types.GenerateContentConfig(
            system_instruction=system,
            response_mime_type="application/json",
            response_schema=ChatResponse,
            temperature=0.3,
        ),
    )

    data = json.loads(response.text)
    return _sanitize(ChatResponse.model_validate(data))

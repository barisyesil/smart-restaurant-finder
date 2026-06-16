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
from google.genai import errors as genai_errors
from google.genai import types

from app.core.config import settings
from app.schemas.chat import ChatAction, ChatRequest, ChatResponse

# Birincil model geçici olarak yanıt veremezse (yoğunluk/kota) bu kodlarda fallback denenir.
RETRYABLE_CODES = {429, 500, 503}

# Frontend'deki filtre enum'larıyla bire bir aynı (tek doğruluk kaynağı: bu listeler).
VALID_CATEGORIES = {"restaurant", "cafe", "fast_food"}
CUISINE_TYPES = [
    "turkish_restaurant",
    "italian_restaurant",
    "chinese_restaurant",
    "japanese_restaurant",
    "sushi_restaurant",
    "korean_restaurant",
    "thai_restaurant",
    "indian_restaurant",
    "mexican_restaurant",
    "french_restaurant",
    "greek_restaurant",
    "mediterranean_restaurant",
    "middle_eastern_restaurant",
    "american_restaurant",
    "vietnamese_restaurant",
    "lebanese_restaurant",
    "spanish_restaurant",
    "pizza_restaurant",
    "hamburger_restaurant",
    "sandwich_shop",
    "fast_food_restaurant",
    "seafood_restaurant",
    "steak_house",
    "barbecue_restaurant",
    "vegetarian_restaurant",
    "vegan_restaurant",
    "ramen_restaurant",
    "breakfast_restaurant",
    "brunch_restaurant",
    "coffee_shop",
    "dessert_shop",
    "ice_cream_shop",
    "bakery",
    "bar",
    "pub",
    "wine_bar",
]
VALID_CUISINES = set(CUISINE_TYPES)
MIN_DISTANCE = 250
MAX_DISTANCE = 20000
MAX_HISTORY = 8
MAX_SUGGESTIONS = 4
MAX_RECOMMENDATIONS = 4

SYSTEM_INSTRUCTION = """\
Sen "Akıllı Restoran Bulucu" uygulamasının asistanısın. Kullanıcının doğal dildeki
isteğini, haritayı ve listeyi güncelleyen yapılandırılmış eylemlere çeviriyorsun.

Üretebileceğin eylemler (actions):
1) apply_filters — filtreleri ayarlar. Sadece kullanıcının ima ettiği alanları doldur;
   değiştirilmeyecek alanları null bırak. Döndürdüğün her alan o filtrenin YENİ TAM
   değeridir (eski değerin üzerine yazılır).
   - categories: sadece ["restaurant","cafe","fast_food"] arasından.
   - cuisines: YALNIZCA aşağıda verilen "Geçerli mutfak türleri" listesinden değer kullan.
     Kullanıcının bahsettiği mutfağı en yakın türe eşle (ör. kahve→coffee_shop, tatlı→
     dessert_shop, suşi→sushi_restaurant, kebap/ev yemeği→turkish_restaurant, balık→
     seafood_restaurant). Listede uygun tür yoksa cuisines'i boş bırak.
   - max_distance: METRE cinsinden. "yürüme mesafesi"≈800, "yakın"≈1000, "çok yakın"≈500,
     "biraz uzak olabilir"≈5000. 250–20000 aralığında tut.
   - max_price: 0–4. "ucuz/bütçe dostu/hesaplı"→2, "orta"→3, "lüks/pahalı/şık"→4.
     Fiyattan hiç bahsedilmediyse null bırak.
   - open_now: "açık/şu an açık/şimdi gidebileceğim" geçerse true.
2) set_location — kullanıcı bir şehir/semt/yer adı söylerse (ör. "Kadıköy'de", "Beşiktaş").
   location_query alanına o yer adını yaz.
3) reset_filters — "sıfırla/temizle/baştan başla/filtreleri kaldır" gibi isteklerde.

Filtre birleştirme: Kullanıcı "bir de X ekle / ayrıca / üstüne" derse, context'teki mevcut
categories/cuisines'i KORU ve üzerine ekleyerek tam listeyi döndür. "sadece X / yalnız X"
derse o alanı tek başına X yap.

Sana her mesajda bir bağlam (context) JSON'u verilir:
- places: kullanıcının o an haritada gördüğü aday mekanlar (id, ad, puan, mesafe, fiyat,
  açık mı, skorlama gerekçesi). Mekan önerisi YALNIZCA bu listeden yapılır.
- favorites / wishlist / visited: kullanıcının beğendiği / gitmek istediği / gittiği mekanlar.

Mekan önerisi (recommendations):
- Kullanıcı mekan tavsiyesi isterse ("nereye gideyim", "bir yer öner", "en iyisi hangisi")
  places listesinden niyetine en uygun 1-3 mekanı seç ve her biri için recommendations'a
  {place_id, reason} ekle. reason: o mekanı NEDEN önerdiğini anlatan, kullanıcının diliyle
  kısa ve kişisel bir cümle (puan/mesafe/fiyat/tür gibi somut nedenlere dayan).
- Önerdiğin mekanları reply'da da isimleriyle kısaca an.
- place_id'leri ASLA uydurma; yalnızca context'teki id'leri kullan.
- Kullanıcı favori/gidilecek/gittiği yerleri sorarsa ilgili listeyi reply'da isimleriyle
  özetle; uygunsa recommendations ile de göster.
- Niyete uyan mekan yoksa bunu reply'da dürüstçe söyle ve filtreleri gevşetmeyi öner.

Dil: reply ve suggestions'ı context.locale dilinde yaz (tr=Türkçe, en=İngilizce). Kullanıcı
farklı bir dilde yazsa bile arayüz diline (locale) uy.

reply: Kısa ve samimi 1-2 cümle. Ne yaptığını özetle. Eğer isteği anlamadıysan veya konu
dışıysa, eylem üretme; nazikçe ne yapabildiğini söyle.
suggestions: 2-4 kısa takip önerisi (tıklanabilir çip metni gibi, ör. "Sadece açık olanlar",
"Daha yakın" / "Only open ones", "Closer").
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


def _sanitize(response: ChatResponse, valid_place_ids: set[str]) -> ChatResponse:
    """Modelin döndürdüğü eylemleri geçerli enum'lara snap'ler, aralıkları kıstırır ve
    önerilen mekanları yalnızca bağlamda gerçekten var olan id'lerle sınırlar."""
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

    recommendations = [
        rec for rec in response.recommendations if rec.place_id in valid_place_ids
    ][:MAX_RECOMMENDATIONS]

    return ChatResponse(
        reply=response.reply,
        actions=clean,
        recommendations=recommendations,
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


def _models() -> list[str]:
    """Denenecek modeller: birincil + (varsa farklı) fallback."""
    models = [settings.gemini_model]
    fallback = settings.gemini_fallback_model
    if fallback and fallback != settings.gemini_model:
        models.append(fallback)
    return models


async def chat(request: ChatRequest) -> ChatResponse:
    """Kullanıcı mesajını Gemini'ye gönderir, doğrulanmış eylem setini döndürür.

    Birincil model geçici bir hata (429/500/503) verirse hafif fallback modeli denenir;
    diğer hatalar (geçersiz istek vb.) doğrudan yukarı fırlatılır."""
    client = _get_client()

    system = SYSTEM_INSTRUCTION + "\n\nGeçerli mutfak türleri: " + ", ".join(CUISINE_TYPES)
    valid_place_ids: set[str] = set()
    if request.context is not None:
        context = request.context
        system += "\n\nGüncel bağlam (context):\n" + context.model_dump_json()
        valid_place_ids = (
            {place.id for place in context.places}
            | {place.id for place in context.favorites}
            | {place.id for place in context.wishlist}
            | {place.id for place in context.visited}
        )

    contents = _build_contents(request)
    config = types.GenerateContentConfig(
        system_instruction=system,
        response_mime_type="application/json",
        response_schema=ChatResponse,
        temperature=0.3,
    )

    models = _models()
    for index, model in enumerate(models):
        try:
            response = await client.aio.models.generate_content(
                model=model, contents=contents, config=config
            )
            data = json.loads(response.text)
            return _sanitize(ChatResponse.model_validate(data), valid_place_ids)
        except genai_errors.APIError as exc:
            is_last = index == len(models) - 1
            if exc.code in RETRYABLE_CODES and not is_last:
                continue  # geçici hata → sıradaki modeli dene
            raise

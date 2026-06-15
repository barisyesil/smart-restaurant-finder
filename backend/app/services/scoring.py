
from app.schemas.place import Place, RecommendedPlace, RecommendRequest

# 4 bileşenli ağırlıklı model (toplam 1.0). Üstüne küçük bir favori-benzerliği bonusu eklenir.
W_RATING = 0.30
W_CATEGORY = 0.30
W_DISTANCE = 0.25
W_PRICE = 0.15

BAYES_THRESHOLD = 50  # m: güven eşiği (minimum anlamlı yorum sayısı)
DEFAULT_GLOBAL_RATING = 3.5  # C: küresel ortalama verisi yoksa varsayım
DISTANCE_HALF_LIFE = 450  # m: her 450m'de mesafe puanı yarılanır (üstel bozunma)
CLOSED_PENALTY = 0.3  # şu an kapalı mekanlar için ceza çarpanı
FAVORITE_BONUS_MAX = 6.0

# Kategori puanları
CATEGORY_NO_PREFERENCE = 60.0  # tercih yokken nötr (şişirmeyi önler)
CATEGORY_MATCH = 100.0
CATEGORY_MISMATCH = 20.0  # tercih var ama eşleşmiyor → belirgin düşüş


def _global_average_rating(places: list[Place]) -> float:
    rated = [p.rating for p in places if p.rating is not None]
    return sum(rated) / len(rated) if rated else DEFAULT_GLOBAL_RATING


def _bayesian_score(place: Place, global_avg: float) -> float:
    """Güven ağırlıklı puan (Bayesian Average) → 0-100."""
    r = place.rating if place.rating is not None else global_avg
    v = place.user_ratings_total or 0
    weighted = (r * v + global_avg * BAYES_THRESHOLD) / (v + BAYES_THRESHOLD)
    return (weighted / 5.0) * 100.0


def _category_score(place: Place, categories: list[str], cuisines: list[str]) -> float:
    if not categories and not cuisines:
        return CATEGORY_NO_PREFERENCE
    if cuisines and set(cuisines) & set(place.types):
        return CATEGORY_MATCH
    if categories and place.category in categories:
        return CATEGORY_MATCH
    return CATEGORY_MISMATCH


def _distance_score(place: Place) -> float:
    """Üstel bozunma (yarı-ömür): yakınlık belirgin şekilde ödüllendirilir."""
    return 100.0 * (0.5 ** (place.distance_m / DISTANCE_HALF_LIFE))


def _price_score(place: Place, max_price: int | None) -> float:
    if max_price is None:
        return 60.0  # tercih yok → nötr
    if place.price_level is None:
        return 50.0  # fiyat verisi yok → nötr
    if place.price_level <= max_price:
        return 100.0
    if place.price_level == max_price + 1:
        return 40.0  # bir kademe üstü → kısmi
    return 0.0


def _favorite_bonus(place: Place, favorite_types: list[str]) -> float:
    if not favorite_types:
        return 0.0
    overlap = len(set(favorite_types) & set(place.types))
    return min(FAVORITE_BONUS_MAX, overlap * 3.0)


def score_place(place: Place, request: RecommendRequest, global_avg: float) -> RecommendedPlace:
    rating_s = _bayesian_score(place, global_avg)
    category_s = _category_score(place, request.categories, request.cuisines)
    distance_s = _distance_score(place)
    price_s = _price_score(place, request.max_price)

    base = (
        W_RATING * rating_s
        + W_CATEGORY * category_s
        + W_DISTANCE * distance_s
        + W_PRICE * price_s
    )

    bonus = _favorite_bonus(place, request.favorite_types)
    if place.id in request.favorite_ids:
        bonus = FAVORITE_BONUS_MAX

    total = base + bonus

    closed = place.open_now is False
    if closed and not request.open_now:
        total *= CLOSED_PENALTY

    total = max(0.0, min(100.0, total))

    reasons = _build_reasons(place, request, category_s, distance_s, price_s, bonus, closed)
    return RecommendedPlace(**place.model_dump(), score=round(total, 1), reasons=reasons)


def _build_reasons(
    place: Place,
    request: RecommendRequest,
    category_s: float,
    distance_s: float,
    price_s: float,
    bonus: float,
    closed: bool,
) -> list[str]:
    # Niteliksel (sayısız) gerekçeler — i18n ANAHTARI olarak döner; metin frontend'de
    # kullanıcının diline çevrilir (i18n: reasons.*). Sayısal değerler detay kartındadır.
    reasons: list[str] = []
    if bonus > 0:
        reasons.append("favoriteSimilar")
    if (request.categories or request.cuisines) and category_s == CATEGORY_MATCH:
        reasons.append("typeMatch")
    if request.max_price is not None and price_s == 100.0:
        reasons.append("budget")
    if distance_s >= 70:
        reasons.append("nearby")
    if (
        place.rating is not None
        and place.user_ratings_total
        and place.user_ratings_total >= 200
        and place.rating >= 4.3
    ):
        reasons.append("topRated")
    if closed:
        reasons.append("closedNow")
    return reasons


def recommend(places: list[Place], request: RecommendRequest) -> list[RecommendedPlace]:
    """Ağırlıklı skorlama motoru: mekanları 100 üzerinden puanlayıp sıralar."""
    global_avg = _global_average_rating(places)
    scored = [score_place(place, request, global_avg) for place in places]
    scored.sort(key=lambda item: item.score, reverse=True)
    return scored

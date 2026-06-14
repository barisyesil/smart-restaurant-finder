import math

from app.schemas.place import Place, RecommendedPlace, RecommendRequest

# 4 bileşenli ağırlıklı model (toplam 1.0). Üstüne favori benzerliği bonusu eklenir.
W_RATING = 0.30
W_CATEGORY = 0.35
W_DISTANCE = 0.25
W_PRICE = 0.10

BAYES_THRESHOLD = 50  # m: güven eşiği (minimum anlamlı yorum sayısı)
DEFAULT_GLOBAL_RATING = 3.5  # C: küresel ortalama verisi yoksa varsayım
WALKABLE_DISTANCE = 200  # m: tam puan alınan "yürüme" mesafesi
DECAY_FACTOR = 4.0  # üstel bozunmanın sertliği
CLOSED_PENALTY = 0.3  # şu an kapalı mekanlar için ceza çarpanı
FAVORITE_BONUS_MAX = 10.0


def _global_average_rating(places: list[Place]) -> float:
    """C: aday kümesindeki tüm mekanların ortalama puanı (Bayes formülü için)."""
    rated = [p.rating for p in places if p.rating is not None]
    return sum(rated) / len(rated) if rated else DEFAULT_GLOBAL_RATING


def _bayesian_score(place: Place, global_avg: float) -> float:
    """Güven ağırlıklı puan (Bayesian Average) → 0-100.

    W = (R*v + C*m) / (v + m)
    Az yorumlu mekanlar küresel ortalamaya çekilir; çok yorumlu köklü
    mekanlar kendi puanına yakın kalır.
    """
    r = place.rating if place.rating is not None else global_avg
    v = place.user_ratings_total or 0
    weighted = (r * v + global_avg * BAYES_THRESHOLD) / (v + BAYES_THRESHOLD)
    return (weighted / 5.0) * 100.0


def _category_score(place: Place, categories: list[str], cuisines: list[str]) -> float:
    """Tam eşleşme 100, kısmi (aynı yeme-içme evreni) 50, tercih yoksa nötr 100."""
    if not categories and not cuisines:
        return 100.0
    if cuisines and set(cuisines) & set(place.types):
        return 100.0
    if categories and place.category in categories:
        return 100.0
    return 50.0


def _distance_score(place: Place, max_distance: int) -> float:
    """Üstel bozunma: <200m tam puan, maksimuma yaklaştıkça hızla 0'a düşer."""
    distance = place.distance_m
    if distance <= WALKABLE_DISTANCE:
        return 100.0
    span = max(1, max_distance - WALKABLE_DISTANCE)
    ratio = min(1.0, (distance - WALKABLE_DISTANCE) / span)
    return 100.0 * math.exp(-DECAY_FACTOR * ratio)


def _price_score(place: Place, max_price: int | None) -> float:
    if max_price is None:
        return 100.0  # tercih yok
    if place.price_level is None:
        return 50.0  # fiyat verisi yok → nötr
    return 100.0 if place.price_level <= max_price else 0.0


def _favorite_bonus(place: Place, favorite_types: list[str]) -> float:
    """İçerik-tabanlı benzerlik: beğenilen mekanların türleriyle örtüşme bonusu."""
    if not favorite_types:
        return 0.0
    overlap = len(set(favorite_types) & set(place.types))
    return min(FAVORITE_BONUS_MAX, overlap * 5.0)


def score_place(place: Place, request: RecommendRequest, global_avg: float) -> RecommendedPlace:
    rating_s = _bayesian_score(place, global_avg)
    category_s = _category_score(place, request.categories, request.cuisines)
    distance_s = _distance_score(place, request.radius)
    price_s = _price_score(place, request.max_price)

    base = (
        W_RATING * rating_s
        + W_CATEGORY * category_s
        + W_DISTANCE * distance_s
        + W_PRICE * price_s
    )

    bonus = _favorite_bonus(place, request.favorite_types)
    if place.id in request.favorite_ids:
        bonus = max(bonus, FAVORITE_BONUS_MAX)

    total = base + bonus

    closed = place.open_now is False
    if closed and not request.open_now:
        total *= CLOSED_PENALTY  # mutlak filtre: kapalıyı listenin sonuna at

    total = max(0.0, min(100.0, total))

    reasons: list[str] = []
    if place.rating is not None and place.user_ratings_total:
        reasons.append(f"{place.rating:.1f}★ ({place.user_ratings_total} yorum)")
    if distance_s >= 80:
        reasons.append(f"{place.distance_m} m yakın")
    if category_s == 100.0 and (request.categories or request.cuisines):
        reasons.append("tercihinle eşleşti")
    if request.max_price is not None and place.price_level is not None and price_s == 100.0:
        reasons.append("bütçene uygun")
    if bonus > 0:
        reasons.append("beğendiklerine benziyor")
    if closed:
        reasons.append("şu an kapalı")

    return RecommendedPlace(**place.model_dump(), score=round(total, 1), reasons=reasons)


def recommend(places: list[Place], request: RecommendRequest) -> list[RecommendedPlace]:
    """Ağırlıklı skorlama motoru: mekanları 100 üzerinden puanlayıp sıralar."""
    global_avg = _global_average_rating(places)
    scored = [score_place(place, request, global_avg) for place in places]
    scored.sort(key=lambda item: item.score, reverse=True)
    return scored

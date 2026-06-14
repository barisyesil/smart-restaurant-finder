from app.schemas.place import Place, RecommendedPlace, RecommendRequest

# Skor ağırlıkları (toplam 1.0)
W_RATING = 0.30
W_DISTANCE = 0.30
W_CATEGORY = 0.20
W_PRICE = 0.15
W_FAVORITE = 0.05

# Puanın güven kazandığı yorum sayısı eşiği.
RATING_CONFIDENCE_THRESHOLD = 50


def _rating_score(place: Place) -> float:
    """Puan + yorum sayısı güveni. Veri yoksa nötr (0.5)."""
    if place.rating is None:
        return 0.5
    confidence = min(1.0, (place.user_ratings_total or 0) / RATING_CONFIDENCE_THRESHOLD)
    return (place.rating / 5.0) * (0.5 + 0.5 * confidence)


def _distance_score(place: Place, radius: int) -> float:
    if radius <= 0:
        return 0.0
    return max(0.0, 1.0 - place.distance_m / radius)


def score_place(place: Place, request: RecommendRequest) -> RecommendedPlace:
    rating_s = _rating_score(place)
    distance_s = _distance_score(place, request.radius)

    category_match = not request.categories or place.category in request.categories
    category_s = 1.0 if category_match else 0.0

    # Fiyat verisi yoksa nötr; varsa bütçeye uyuyorsa yüksek.
    price_s = 0.6
    price_ok = False
    if place.price_level is not None and request.max_price is not None:
        price_ok = place.price_level <= request.max_price
        price_s = 1.0 if price_ok else 0.2

    is_favorite = place.id in request.favorite_ids
    favorite_s = 1.0 if is_favorite else 0.0

    total = (
        W_RATING * rating_s
        + W_DISTANCE * distance_s
        + W_CATEGORY * category_s
        + W_PRICE * price_s
        + W_FAVORITE * favorite_s
    )

    reasons: list[str] = []
    if place.rating is not None and place.rating >= 4.0:
        reasons.append(f"{place.rating:.1f}★ ({place.user_ratings_total or 0} yorum)")
    if distance_s > 0.6:
        reasons.append(f"{place.distance_m} m yakın")
    if request.categories and category_match:
        reasons.append("tercih ettiğin tür")
    if price_ok:
        reasons.append("bütçene uygun")
    if is_favorite:
        reasons.append("favorin")

    return RecommendedPlace(**place.model_dump(), score=round(total, 4), reasons=reasons)


def recommend(places: list[Place], request: RecommendRequest) -> list[RecommendedPlace]:
    """Mekanları kullanıcı tercihlerine göre puanlayıp yüksekten düşüğe sıralar."""
    scored = [score_place(place, request) for place in places]
    scored.sort(key=lambda item: item.score, reverse=True)
    return scored

from app.schemas.place import Place, RecommendRequest
from app.services.scoring import recommend


def make_place(
    place_id: str,
    category: str = "restaurant",
    types: list[str] | None = None,
    rating: float | None = None,
    count: int | None = None,
    price: int | None = None,
    distance: int = 100,
    open_now: bool | None = None,
) -> Place:
    return Place(
        id=place_id,
        name=place_id,
        category=category,
        types=types or [],
        rating=rating,
        user_ratings_total=count,
        price_level=price,
        lat=0.0,
        lon=0.0,
        distance_m=distance,
        open_now=open_now,
    )


def test_bayesian_penalizes_low_review_count():
    # 5.0★ ama 2 yorum, 4.7★ ve 1500 yorumun ÜSTÜNE çıkmamalı.
    high_count = make_place("kokemli", rating=4.7, count=1500)
    low_count = make_place("yeni", rating=5.0, count=2)
    anchor = make_place("ucuncu", rating=3.0, count=200)  # C'yi gerçekçi seviyeye çeker

    result = recommend([low_count, high_count, anchor], RecommendRequest(lat=0, lon=0, radius=1000))
    scores = {r.id: r.score for r in result}

    assert scores["kokemli"] > scores["yeni"]
    assert result[0].id == "kokemli"


def test_cuisine_exact_match_ranks_first():
    pizza = make_place("pizza", types=["restaurant", "pizza_restaurant"], rating=4.2, count=100)
    kebap = make_place("kebap", types=["restaurant", "turkish_restaurant"], rating=4.2, count=100)
    request = RecommendRequest(lat=0, lon=0, radius=1000, cuisines=["pizza_restaurant"])

    result = recommend([kebap, pizza], request)
    assert result[0].id == "pizza"


def test_closed_place_is_penalized():
    open_place = make_place("acik", rating=4.0, count=100, distance=400, open_now=True)
    closed_top = make_place("kapali", rating=4.9, count=2000, distance=100, open_now=False)

    result = recommend([closed_top, open_place], RecommendRequest(lat=0, lon=0, radius=1000))
    assert result[0].id == "acik"  # kapalı, yüksek puanına rağmen sona düştü


def test_favorite_similarity_boosts_score():
    plain = make_place("a", types=["restaurant", "italian_restaurant"], rating=4.0, count=100)
    similar = make_place("b", types=["restaurant", "pizza_restaurant"], rating=4.0, count=100)
    request = RecommendRequest(
        lat=0, lon=0, radius=1000, favorite_types=["pizza_restaurant"]
    )

    result = recommend([plain, similar], request)
    assert result[0].id == "b"


def test_reasons_present():
    [rec] = recommend(
        [make_place("p", rating=4.6, count=200, distance=120)],
        RecommendRequest(lat=0, lon=0, radius=1000),
    )
    assert "Sana yakın" in rec.reasons
    assert "Yüksek puanlı ve köklü" in rec.reasons
    assert 0 <= rec.score <= 100

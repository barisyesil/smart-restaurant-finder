from app.schemas.place import Place, RecommendRequest
from app.services.scoring import recommend


def make_place(
    place_id: str,
    category: str = "restaurant",
    rating: float | None = None,
    count: int | None = None,
    price: int | None = None,
    distance: int = 100,
) -> Place:
    return Place(
        id=place_id,
        name=place_id,
        category=category,
        rating=rating,
        user_ratings_total=count,
        price_level=price,
        lat=0.0,
        lon=0.0,
        distance_m=distance,
    )


def test_recommend_orders_by_score():
    places = [
        make_place("far_low", rating=3.0, count=10, distance=900),
        make_place("near_high", rating=4.8, count=500, distance=100),
    ]
    result = recommend(places, RecommendRequest(lat=0, lon=0, radius=1000))
    assert result[0].id == "near_high"
    assert result[0].score >= result[1].score


def test_reasons_include_rating_and_distance():
    places = [make_place("p", rating=4.6, count=200, distance=150)]
    [rec] = recommend(places, RecommendRequest(lat=0, lon=0, radius=1000))
    assert any("★" in reason for reason in rec.reasons)
    assert any("yakın" in reason for reason in rec.reasons)


def test_category_preference_ranks_match_first():
    cafe = make_place("cafe", category="cafe", rating=4.5, count=100)
    resto = make_place("resto", category="restaurant", rating=4.5, count=100)
    request = RecommendRequest(lat=0, lon=0, radius=1000, categories=["cafe"])
    result = recommend([resto, cafe], request)
    assert result[0].id == "cafe"

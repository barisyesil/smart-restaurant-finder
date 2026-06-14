from app.utils.geo import haversine_distance


def test_haversine_zero_distance():
    assert haversine_distance(39.0, 30.0, 39.0, 30.0) == 0


def test_haversine_one_degree_latitude():
    # 1 derece enlem farkı ~111 km'ye denk gelir
    distance = haversine_distance(0.0, 0.0, 1.0, 0.0)
    assert 110_000 < distance < 112_000

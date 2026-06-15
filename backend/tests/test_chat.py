from fastapi.testclient import TestClient

from app.main import app
from app.schemas.chat import ChatAction, ChatResponse, PlaceRecommendation
from app.services.gemini import _sanitize

client = TestClient(app)


def test_chat_requires_api_key(monkeypatch):
    # Anahtar yoksa endpoint zarifçe 503 döner (gerçek Gemini çağrısı yapılmaz).
    monkeypatch.setattr("app.services.gemini.settings.gemini_api_key", "")
    response = client.post("/chat", json={"message": "merhaba"})
    assert response.status_code == 503


def test_sanitize_snaps_invalid_enums_and_clamps_ranges():
    raw = ChatResponse(
        reply="Tamamdır",
        actions=[
            ChatAction(
                type="apply_filters",
                categories=["cafe", "hayalet_kategori"],
                cuisines=["coffee_shop", "uydurma_mutfak"],
                max_distance=999_999,
                max_price=9,
            )
        ],
        suggestions=["a", "b", "c", "d", "e", "f"],
    )
    cleaned = _sanitize(raw, set())
    action = cleaned.actions[0]
    assert action.categories == ["cafe"]
    assert action.cuisines == ["coffee_shop"]
    assert action.max_distance == 20_000  # üst sınıra kıstırıldı
    assert action.max_price == 4  # üst sınıra kıstırıldı
    assert len(cleaned.suggestions) == 4  # en fazla 4 öneri


def test_sanitize_drops_blank_location_query():
    raw = ChatResponse(
        reply="",
        actions=[ChatAction(type="set_location", location_query="   ")],
    )
    assert _sanitize(raw, set()).actions == []


def test_sanitize_keeps_null_fields_as_none():
    # max_price hiç belirtilmediyse None kalmalı (0 ile karıştırılmamalı).
    raw = ChatResponse(
        reply="",
        actions=[ChatAction(type="apply_filters", open_now=True)],
    )
    action = _sanitize(raw, set()).actions[0]
    assert action.open_now is True
    assert action.max_price is None
    assert action.cuisines is None


def test_sanitize_drops_recommendations_with_unknown_place_ids():
    # Model bağlamda olmayan bir mekan uydurursa elenmeli (halüsinasyon koruması).
    raw = ChatResponse(
        reply="İşte öneriler",
        recommendations=[
            PlaceRecommendation(place_id="real-1", reason="Yüksek puanlı"),
            PlaceRecommendation(place_id="uydurma-9", reason="Mevcut değil"),
        ],
    )
    cleaned = _sanitize(raw, {"real-1"})
    assert [rec.place_id for rec in cleaned.recommendations] == ["real-1"]

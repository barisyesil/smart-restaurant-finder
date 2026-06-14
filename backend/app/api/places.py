import httpx
from fastapi import APIRouter, HTTPException, Query

from app.core.config import settings
from app.schemas.place import Place, PlaceDetail, RecommendedPlace, RecommendRequest
from app.services.google_places import fetch_nearby_places, fetch_place_details
from app.services.scoring import recommend

router = APIRouter(prefix="/places", tags=["places"])


def _require_api_key() -> None:
    if not settings.google_maps_api_key:
        raise HTTPException(status_code=503, detail="Google Maps API anahtarı yapılandırılmamış.")


@router.get("/nearby", response_model=list[Place])
async def get_nearby_places(
    lat: float = Query(..., ge=-90, le=90, description="Kullanıcı enlemi"),
    lon: float = Query(..., ge=-180, le=180, description="Kullanıcı boylamı"),
    radius: int = Query(1000, ge=100, le=5000, description="Arama yarıçapı (metre)"),
) -> list[Place]:
    _require_api_key()
    try:
        return await fetch_nearby_places(lat, lon, radius)
    except httpx.HTTPError as exc:
        raise HTTPException(
            status_code=502,
            detail="Mekan verisi sağlayıcısına ulaşılamadı.",
        ) from exc


@router.post("/recommend", response_model=list[RecommendedPlace])
async def recommend_places(request: RecommendRequest) -> list[RecommendedPlace]:
    _require_api_key()
    try:
        places = await fetch_nearby_places(request.lat, request.lon, request.radius)
    except httpx.HTTPError as exc:
        raise HTTPException(
            status_code=502,
            detail="Mekan verisi sağlayıcısına ulaşılamadı.",
        ) from exc
    return recommend(places, request)


@router.get("/{place_id}", response_model=PlaceDetail)
async def get_place_detail(place_id: str) -> PlaceDetail:
    _require_api_key()
    try:
        return await fetch_place_details(place_id)
    except httpx.HTTPStatusError as exc:
        if exc.response.status_code == 404:
            raise HTTPException(status_code=404, detail="Mekan bulunamadı.") from exc
        raise HTTPException(status_code=502, detail="Mekan detayına ulaşılamadı.") from exc
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail="Mekan detayına ulaşılamadı.") from exc

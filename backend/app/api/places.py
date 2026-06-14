import httpx
from fastapi import APIRouter, HTTPException, Query

from app.schemas.place import Place
from app.services.overpass import fetch_nearby_places

router = APIRouter(prefix="/places", tags=["places"])


@router.get("/nearby", response_model=list[Place])
async def get_nearby_places(
    lat: float = Query(..., ge=-90, le=90, description="Kullanıcı enlemi"),
    lon: float = Query(..., ge=-180, le=180, description="Kullanıcı boylamı"),
    radius: int = Query(1000, ge=100, le=5000, description="Arama yarıçapı (metre)"),
) -> list[Place]:
    try:
        return await fetch_nearby_places(lat, lon, radius)
    except httpx.HTTPError as exc:
        raise HTTPException(
            status_code=502,
            detail="Mekan verisi sağlayıcısına ulaşılamadı.",
        ) from exc

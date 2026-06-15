import logging

from fastapi import APIRouter, HTTPException
from google.genai import errors as genai_errors

from app.schemas.chat import ChatRequest, ChatResponse
from app.services import gemini

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("", response_model=ChatResponse)
async def chat(request: ChatRequest) -> ChatResponse:
    if not gemini.is_configured():
        raise HTTPException(
            status_code=503,
            detail="AI asistanı yapılandırılmamış (GEMINI_API_KEY eksik).",
        )
    try:
        return await gemini.chat(request)
    except genai_errors.APIError as exc:
        # Gemini'nin kendi hatası (kota/kimlik/geçersiz istek) — gerçek sebebi logla.
        logger.warning("Gemini API hatası (code=%s): %s", exc.code, exc.message)
        if exc.code == 429:
            raise HTTPException(
                status_code=429,
                detail="AI asistanının kotası/kredisi şu an dolu. Lütfen biraz sonra tekrar dene.",
            ) from exc
        raise HTTPException(status_code=502, detail="AI asistanına ulaşılamadı.") from exc
    except Exception as exc:  # ağ/parse gibi beklenmeyen hatalar
        logger.exception("Beklenmeyen /chat hatası")
        raise HTTPException(
            status_code=502,
            detail="AI asistanına şu an ulaşılamıyor, lütfen tekrar dene.",
        ) from exc

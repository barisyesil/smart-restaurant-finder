from fastapi import APIRouter, HTTPException

from app.schemas.chat import ChatRequest, ChatResponse
from app.services import gemini

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
    except Exception as exc:  # Gemini SDK / ağ / parse hatalarını tek noktada sar
        raise HTTPException(
            status_code=502,
            detail="AI asistanına şu an ulaşılamıyor, lütfen tekrar dene.",
        ) from exc

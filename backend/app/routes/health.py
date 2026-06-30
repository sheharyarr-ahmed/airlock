"""GET /health — liveness plus LM Studio reachability and document state."""
from __future__ import annotations

from fastapi import APIRouter

from ..llm import is_reachable
from ..models import HealthResponse
from ..store import store

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    return HealthResponse(
        status="ok",
        lm_studio_reachable=await is_reachable(),
        document_loaded=store.is_loaded,
    )

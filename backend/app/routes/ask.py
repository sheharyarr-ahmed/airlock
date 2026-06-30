"""POST /ask — Server-Sent Events: sources → token* → done (or a terminal error)."""
from __future__ import annotations

from collections.abc import AsyncIterator

import httpx
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from ..config import settings
from ..llm import stream_answer
from ..models import (
    AskRequest,
    DoneEvent,
    ErrorEvent,
    SourcesEvent,
    TokenEvent,
)
from ..retrieval import retrieve
from ..store import store

router = APIRouter()


def _sse(event: str, payload: BaseModel) -> str:
    """Format one named SSE event with a typed JSON data line."""
    return f"event: {event}\ndata: {payload.model_dump_json()}\n\n"


async def _event_stream(question: str) -> AsyncIterator[str]:
    if not store.is_loaded:
        yield _sse("error", ErrorEvent(message="No document loaded. Upload a PDF first."))
        return

    sources = retrieve(question, store, settings.TOP_K)
    yield _sse("sources", SourcesEvent(sources=sources))

    try:
        async for token in stream_answer(question, sources):
            yield _sse("token", TokenEvent(text=token))
    except httpx.HTTPError:
        yield _sse(
            "error",
            ErrorEvent(message="LM Studio is unreachable. Is it running with the model loaded?"),
        )
        return

    yield _sse("done", DoneEvent())


@router.post("/ask")
async def ask(req: AskRequest) -> StreamingResponse:
    return StreamingResponse(
        _event_stream(req.question),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )

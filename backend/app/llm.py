"""Async streaming client to LM Studio's OpenAI-compatible chat endpoint.

Grounding: the system prompt forbids outside knowledge; the user message is the
top-K retrieved chunks (with page numbers) followed by the question.
"""
from __future__ import annotations

import json
from collections.abc import AsyncIterator

import httpx

from .config import settings
from .models import Source

SYSTEM_PROMPT = (
    "You are a document assistant. Answer the user's question using ONLY the "
    "provided context. If the answer is not in the context, say you cannot find "
    "it in the document. Do not use outside knowledge."
)


def build_user_message(question: str, sources: list[Source]) -> str:
    blocks = [f"[Page {s.page}]\n{s.text}" for s in sources]
    context = "\n\n".join(blocks)
    return f"Context:\n{context}\n\nQuestion: {question}"


async def is_reachable() -> bool:
    """Short probe of LM_STUDIO_URL/models for the health check."""
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            resp = await client.get(f"{settings.LM_STUDIO_URL}/models")
            return resp.status_code == 200
    except httpx.HTTPError:
        return False


async def stream_answer(question: str, sources: list[Source]) -> AsyncIterator[str]:
    """Yield answer tokens as they arrive from LM Studio.

    Raises httpx.HTTPError on transport failure / non-200 — the route turns that
    into a terminal SSE `error` event.
    """
    payload = {
        "model": settings.MODEL_NAME,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": build_user_message(question, sources)},
        ],
        "temperature": settings.TEMPERATURE,
        "stream": True,
    }
    async with httpx.AsyncClient(timeout=None) as client:
        async with client.stream(
            "POST", f"{settings.LM_STUDIO_URL}/chat/completions", json=payload
        ) as resp:
            resp.raise_for_status()
            async for line in resp.aiter_lines():
                if not line.startswith("data:"):
                    continue
                data = line[len("data:") :].strip()
                if data == "[DONE]":
                    break
                try:
                    obj = json.loads(data)
                except json.JSONDecodeError:
                    continue
                delta = obj.get("choices", [{}])[0].get("delta", {})
                token = delta.get("content")
                if token:
                    yield token

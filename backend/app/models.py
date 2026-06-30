"""Typed contracts at every boundary (Pydantic v2). SSE events are individually typed."""
from __future__ import annotations

from pydantic import BaseModel, Field


# ---- Requests / responses -------------------------------------------------

class AskRequest(BaseModel):
    question: str = Field(min_length=1)


class UploadResponse(BaseModel):
    filename: str
    pages: int
    chunks: int


class HealthResponse(BaseModel):
    status: str
    lm_studio_reachable: bool
    document_loaded: bool


# ---- Retrieval ------------------------------------------------------------

class Source(BaseModel):
    chunk_id: int
    page: int
    text: str
    score: float


# ---- SSE event payloads ---------------------------------------------------
# Each event carries one typed JSON payload; the event name is set separately
# on the SSE `event:` line (see routes/ask.py).

class SourcesEvent(BaseModel):
    sources: list[Source]


class TokenEvent(BaseModel):
    text: str


class DoneEvent(BaseModel):
    pass


class ErrorEvent(BaseModel):
    message: str

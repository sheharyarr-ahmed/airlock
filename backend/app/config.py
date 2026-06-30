"""Application settings — all tunables in one place (spec §Decided design choices)."""
from __future__ import annotations

from pydantic import BaseModel


class Settings(BaseModel):
    # Local LM Studio OpenAI-compatible endpoint.
    LM_STUDIO_URL: str = "http://localhost:1234/v1"
    MODEL_NAME: str = "llama-3.2-3b-instruct"

    # Retrieval params (spec defaults).
    CHUNK_SIZE: int = 800
    CHUNK_OVERLAP: int = 150
    TOP_K: int = 4

    # In-process embedding model (CPU, ~90MB), lazy-loaded.
    EMBED_MODEL: str = "all-MiniLM-L6-v2"

    # Grounding (spec §Grounding).
    TEMPERATURE: float = 0.2


settings = Settings()

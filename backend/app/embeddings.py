"""Lazy-loaded sentence-transformers embedder (CPU, L2-normalized vectors).

Loaded on first use to keep startup memory low — LM Studio holds only the chat
model until an embedding is actually needed.
"""
from __future__ import annotations

import numpy as np

from .config import settings

_model = None  # module-level singleton


def _get_model():
    global _model
    if _model is None:
        # Imported lazily so the heavy torch import happens only on first use.
        from sentence_transformers import SentenceTransformer

        _model = SentenceTransformer(settings.EMBED_MODEL, device="cpu")
    return _model


def embed(texts: list[str]) -> np.ndarray:
    """Return an (n, d) float32 matrix of L2-normalized embeddings."""
    if not texts:
        return np.empty((0, 0), dtype=np.float32)
    vectors = _get_model().encode(
        texts,
        convert_to_numpy=True,
        normalize_embeddings=True,
    )
    return vectors.astype(np.float32)

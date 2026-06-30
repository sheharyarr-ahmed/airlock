"""Brute-force cosine retrieval over the in-memory matrix.

Both stored chunk vectors and the query vector are L2-normalized, so a plain
dot product equals cosine similarity.
"""
from __future__ import annotations

import numpy as np

from .embeddings import embed
from .models import Source
from .store import InMemoryStore


def cosine_top_k(query_vec: np.ndarray, matrix: np.ndarray, k: int) -> list[tuple[int, float]]:
    """Return [(row_index, score)] for the top-k rows by cosine similarity."""
    if matrix.shape[0] == 0:
        return []
    scores = matrix @ query_vec  # (n,) — normalized vectors → cosine
    k = min(k, scores.shape[0])
    # argpartition for the top-k, then sort those by score descending.
    top_idx = np.argpartition(-scores, k - 1)[:k]
    top_idx = top_idx[np.argsort(-scores[top_idx])]
    return [(int(i), float(scores[i])) for i in top_idx]


def retrieve(question: str, store: InMemoryStore, k: int) -> list[Source]:
    """Embed the question and return the top-k chunks as typed Sources."""
    if not store.is_loaded or store.matrix is None:
        return []
    query_vec = embed([question])[0]
    ranked = cosine_top_k(query_vec, store.matrix, k)
    sources: list[Source] = []
    for idx, score in ranked:
        chunk = store.chunks[idx]
        sources.append(
            Source(chunk_id=chunk.chunk_id, page=chunk.page, text=chunk.text, score=score)
        )
    return sources

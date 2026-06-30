"""In-memory single-document store (module-level singleton).

Single-document scope: each upload *replaces* the store. Requires the backend
to run with a single worker (`uvicorn --workers 1`).
"""
from __future__ import annotations

import numpy as np

from .chunking import Chunk


class InMemoryStore:
    def __init__(self) -> None:
        self.filename: str | None = None
        self.pages: int = 0
        self.chunks: list[Chunk] = []
        self.matrix: np.ndarray | None = None  # (n_chunks, dim), L2-normalized

    @property
    def is_loaded(self) -> bool:
        return self.matrix is not None and len(self.chunks) > 0

    def replace(
        self,
        filename: str,
        pages: int,
        chunks: list[Chunk],
        matrix: np.ndarray,
    ) -> None:
        self.filename = filename
        self.pages = pages
        self.chunks = chunks
        self.matrix = matrix

    def reset(self) -> None:
        self.__init__()


store = InMemoryStore()

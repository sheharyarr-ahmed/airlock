"""Split a page's text into overlapping chunks.

Chunks never span a page boundary (spec §Page attribution): we chunk *within*
each page so every chunk belongs to exactly one page → unambiguous citations.
"""
from __future__ import annotations

from pydantic import BaseModel


class Chunk(BaseModel):
    chunk_id: int
    page: int
    text: str


def chunk_text(text: str, size: int, overlap: int) -> list[str]:
    """Character-window chunking with overlap, normalized whitespace.

    Returns [] for empty/whitespace-only text. `overlap` must be < `size`.
    """
    if overlap >= size:
        raise ValueError("CHUNK_OVERLAP must be smaller than CHUNK_SIZE.")

    normalized = " ".join(text.split())
    if not normalized:
        return []

    step = size - overlap
    chunks: list[str] = []
    for start in range(0, len(normalized), step):
        window = normalized[start : start + size]
        if window:
            chunks.append(window)
        if start + size >= len(normalized):
            break
    return chunks


def chunk_pages(pages: list, size: int, overlap: int) -> list[Chunk]:
    """Chunk every page, assigning a globally unique, ordered chunk_id."""
    chunks: list[Chunk] = []
    next_id = 0
    for page in pages:
        for piece in chunk_text(page.text, size, overlap):
            chunks.append(Chunk(chunk_id=next_id, page=page.page, text=piece))
            next_id += 1
    return chunks

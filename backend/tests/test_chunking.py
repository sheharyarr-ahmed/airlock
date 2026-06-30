"""Chunking: overlap, page boundaries, and config validation. No network."""
from __future__ import annotations

import pytest

from app.chunking import Chunk, chunk_pages, chunk_text
from app.pdf import PageText


def test_short_text_is_single_chunk():
    assert chunk_text("hello world", size=800, overlap=150) == ["hello world"]


def test_empty_text_yields_no_chunks():
    assert chunk_text("   \n  ", size=800, overlap=150) == []


def test_overlap_carries_characters_between_chunks():
    text = "".join(str(i % 10) for i in range(1000))  # 1000 distinct-position chars
    chunks = chunk_text(text, size=400, overlap=100)
    # step = 300 → windows start at 0, 300, 600; the [600:1000] window already
    # reaches the end, so no redundant 4th chunk is emitted.
    assert [len(c) for c in chunks] == [400, 400, 400]
    # consecutive windows share exactly `overlap` characters
    assert chunks[0][-100:] == chunks[1][:100]
    assert chunks[1][-100:] == chunks[2][:100]
    # full coverage: concatenating non-overlapping parts reconstructs the text
    assert chunks[0] + chunks[1][100:] + chunks[2][100:] == text


def test_overlap_must_be_smaller_than_size():
    with pytest.raises(ValueError):
        chunk_text("abc", size=100, overlap=100)


def test_chunks_never_span_pages_and_ids_are_sequential():
    pages = [PageText(page=1, text="a " * 600), PageText(page=2, text="b " * 600)]
    chunks = chunk_pages(pages, size=800, overlap=150)
    assert all(isinstance(c, Chunk) for c in chunks)
    assert [c.chunk_id for c in chunks] == list(range(len(chunks)))
    # every chunk belongs to exactly one page → unambiguous citations
    pages_seen = {c.page for c in chunks}
    assert pages_seen == {1, 2}

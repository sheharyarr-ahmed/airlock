"""Cosine top-k ordering — pure NumPy, no embedding model required."""
from __future__ import annotations

import numpy as np

from app.retrieval import cosine_top_k


def test_top_k_orders_by_similarity_descending():
    matrix = np.array(
        [
            [1.0, 0.0],   # identical to query
            [0.0, 1.0],   # orthogonal
            [0.9, 0.1],   # close
        ],
        dtype=np.float32,
    )
    query = np.array([1.0, 0.0], dtype=np.float32)
    ranked = cosine_top_k(query, matrix, k=2)
    assert [idx for idx, _ in ranked] == [0, 2]
    assert ranked[0][1] >= ranked[1][1]


def test_k_larger_than_rows_is_clamped():
    matrix = np.array([[1.0, 0.0]], dtype=np.float32)
    ranked = cosine_top_k(np.array([1.0, 0.0], dtype=np.float32), matrix, k=10)
    assert len(ranked) == 1


def test_empty_matrix_returns_empty():
    assert cosine_top_k(np.array([1.0, 0.0], dtype=np.float32), np.empty((0, 2)), k=4) == []

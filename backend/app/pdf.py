"""PDF text extraction (PyMuPDF), preserving 1-based page numbers."""
from __future__ import annotations

from pydantic import BaseModel
import fitz  # PyMuPDF


class PageText(BaseModel):
    page: int  # 1-based
    text: str


def extract_pages(data: bytes) -> list[PageText]:
    """Extract per-page text from PDF bytes.

    Raises ValueError if the bytes are not a valid PDF, or if no page yields
    any extractable text (image-only / scanned PDF — no OCR in v1).
    """
    try:
        doc = fitz.open(stream=data, filetype="pdf")
    except Exception as exc:  # noqa: BLE001 - surface a clean message to the route
        raise ValueError("File is not a valid PDF.") from exc

    pages: list[PageText] = []
    try:
        for i, page in enumerate(doc):
            pages.append(PageText(page=i + 1, text=page.get_text("text")))
    finally:
        doc.close()

    if not any(p.text.strip() for p in pages):
        raise ValueError(
            "No extractable text found. This looks like a scanned or image-only "
            "PDF; OCR is not supported in v1."
        )
    return pages

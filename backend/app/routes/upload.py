"""POST /upload — validate, extract, chunk, embed, and replace the store."""
from __future__ import annotations

from fastapi import APIRouter, File, HTTPException, UploadFile

from ..chunking import chunk_pages
from ..config import settings
from ..embeddings import embed
from ..models import UploadResponse
from ..pdf import extract_pages
from ..store import store

router = APIRouter()


@router.post("/upload", response_model=UploadResponse)
async def upload(file: UploadFile = File(...)) -> UploadResponse:
    filename = file.filename or "upload.pdf"
    if not filename.lower().endswith(".pdf") and file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    data = await file.read()
    try:
        pages = extract_pages(data)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    chunks = chunk_pages(pages, settings.CHUNK_SIZE, settings.CHUNK_OVERLAP)
    if not chunks:
        raise HTTPException(status_code=400, detail="No text could be extracted from the PDF.")

    matrix = embed([c.text for c in chunks])
    store.replace(filename=filename, pages=len(pages), chunks=chunks, matrix=matrix)

    return UploadResponse(filename=filename, pages=len(pages), chunks=len(chunks))

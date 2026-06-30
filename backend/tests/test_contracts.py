"""SSE event payloads and the /upload rejection path. No LM Studio, no network."""
from __future__ import annotations

import json

from fastapi.testclient import TestClient

from app.main import app
from app.models import DoneEvent, Source, SourcesEvent, TokenEvent
from app.routes.ask import _sse

client = TestClient(app)


def test_event_payloads_serialize_to_typed_json():
    src = Source(chunk_id=1, page=2, text="hi", score=0.5)
    frame = _sse("sources", SourcesEvent(sources=[src]))
    assert frame.startswith("event: sources\ndata: ")
    body = json.loads(frame.split("data: ", 1)[1].strip())
    assert body == {"sources": [{"chunk_id": 1, "page": 2, "text": "hi", "score": 0.5}]}

    assert json.loads(_sse("token", TokenEvent(text="x")).split("data: ", 1)[1]) == {"text": "x"}
    assert json.loads(_sse("done", DoneEvent()).split("data: ", 1)[1]) == {}


def test_upload_rejects_non_pdf():
    resp = client.post("/upload", files={"file": ("note.txt", b"plain text", "text/plain")})
    assert resp.status_code == 400


def test_upload_rejects_corrupt_pdf():
    resp = client.post("/upload", files={"file": ("bad.pdf", b"%PDF-not-really", "application/pdf")})
    assert resp.status_code == 400


def test_ask_without_document_streams_error_event():
    with client.stream("POST", "/ask", json={"question": "anything"}) as resp:
        assert resp.status_code == 200
        text = "".join(resp.iter_text())
    assert "event: error" in text
    assert "No document loaded" in text

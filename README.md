# Airlock

A **private, fully-local** document assistant. Upload a PDF, ask questions in plain language, and get answers grounded in that document with exact page citations. The entire inference path runs on your own machine via [LM Studio](https://lmstudio.ai/) — no document text, question, or answer ever leaves the device. **It works with wifi off.**

## How it works

```
PDF ──▶ FastAPI backend (:8000)                       Next.js frontend (:3000)
        ├─ extract text per page (PyMuPDF)            └─ upload + ask UI, streamed answer
        ├─ chunk each page (overlap within a page)       + expandable page citations
        ├─ embed chunks (sentence-transformers, CPU)
        ├─ retrieve top-K by cosine (NumPy)
        └─ stream answer (SSE) from LM Studio ◀── local llama-3.2-3b-instruct
```

Only the **retrieved chunks** are sent to the local model — never the full document. Embeddings run **in-process** in the backend so LM Studio only ever holds the 3B chat model (matters on 8GB machines).

## Prerequisites

- [LM Studio](https://lmstudio.ai/) running with **`llama-3.2-3b-instruct`** loaded, serving the OpenAI-compatible API at `http://localhost:1234/v1`.
- Python **3.12** (PyTorch wheels are not yet published for 3.14).
- Node 20+ and `pnpm`.

## Run it

**Backend** (terminal 1):
```bash
cd backend
python3.12 -m venv .venv && ./.venv/bin/pip install -r requirements.txt
./.venv/bin/uvicorn app.main:app --workers 1 --reload --port 8000
```

**Frontend** (terminal 2):
```bash
cd frontend
cp .env.local.example .env.local
pnpm install
pnpm dev
```

Open <http://localhost:3000>, upload a PDF (a sample lives at `backend/sample/beacon-handbook.pdf`), and ask away.

## Verify (end-to-end)

```bash
curl -s localhost:8000/health
curl -s -F "file=@backend/sample/beacon-handbook.pdf" localhost:8000/upload
curl -N -s -X POST localhost:8000/ask -H 'Content-Type: application/json' \
  -d '{"question":"How many paid vacation days do full-time employees get?"}'
```

The first `ask` returns a `sources` event citing **page 2**, then streams the grounded answer. Ask something not in the document and it honestly says it cannot find the answer.

Backend unit tests (no LM Studio required):
```bash
cd backend && ./.venv/bin/pytest -q
```

## Out of scope (v1)

Airlock v1 is deliberately **single-user, single-machine, single-document**. The following are **not** included:

- Multi-user accounts, authentication, or authorization
- Payments or billing
- Cloud deployment (it is local-only by design)
- Multi-document libraries or search across documents
- Conversation memory across sessions
- **OCR** for scanned / image-only PDFs (text-based PDFs only; image-only PDFs are rejected with a clear error)

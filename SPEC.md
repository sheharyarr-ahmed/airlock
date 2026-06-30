# Airlock — Build Specification

## Goal

A private, fully-local document assistant: a user uploads a PDF, asks questions in plain language, and gets answers grounded in that document with exact page citations. The entire inference path runs on the user's own machine via LM Studio — no document text, question, or answer ever leaves the device. Must work with wifi off.

---

## Architecture (three strict layers)

1. **Frontend** — Next.js 15 App Router, React 19, TypeScript strict. Single upload-and-ask interface. No business logic; it only calls the backend and renders results.
2. **Backend** — FastAPI + Pydantic v2. Owns all document work: PDF extraction, chunking, embedding, retrieval, and the streaming call to the local model. Every boundary is typed.
3. **Local model** — LM Studio, OpenAI-compatible endpoint at `http://localhost:1234/v1`, model `llama-3.2-3b-instruct`. The only "AI" in the running product. Receives **only retrieved chunks**, never the full document.

### Decided design choices (and why — defend these)

| Decision | Choice | Why |
|---|---|---|
| Embeddings | **`sentence-transformers` `all-MiniLM-L6-v2`** running in-process in FastAPI on CPU (~90MB, vectors L2-normalized) | Keeps LM Studio holding **only** the 3B chat model — critical on 8GB. Self-contained, fast, no second LM Studio model to juggle. Lazy-loaded on first use to keep startup memory low ("load only when needed"). |
| Vector index | **NumPy brute-force cosine** over an in-memory matrix | Single document = hundreds of chunks. Brute-force is instant, zero extra deps, trivial to reason about. FAISS/Chroma would be overkill machinery for one document. |
| Answer delivery | **Streaming via SSE** | A local 3B model is slow; token-by-token streaming gives the best perceived speed. |
| Typed contracts + streaming | **Per-event typed payloads** | SSE can't be one typed response, so each event carries a Pydantic-typed JSON payload (`SourcesEvent`, `TokenEvent`, `DoneEvent`, `ErrorEvent`). The request stays a typed `AskRequest`. No untyped boundary. |
| Page attribution | **Chunk per page** — extract text page-by-page and chunk within each page (overlap applied inside a page) | Each chunk belongs to exactly one page → unambiguous citations. Trade-off: no chunk spans a page boundary (minor context loss at edges) in exchange for clean, correct page numbers. |
| State | **Module-level singleton store**, replaced on each new upload | Single-document scope. Requires backend run with a single worker (`--workers 1`). |
| Grounding | System prompt forces "answer **only** from the provided context; if the answer is not present, say so plainly." Temperature 0.2 | Retrieval does the heavy lifting; the 3B model only rewords retrieved text — never invents from training knowledge. |

---

## Repository layout

```
airlock/
├── README.md                  # what it is + HONEST out-of-scope boundary (v1 limits)
├── SPEC.md                    # this file
├── .gitignore                 # node_modules, .venv, __pycache__, .next, .env*.local
├── backend/
│   ├── requirements.txt       # fastapi, uvicorn, pydantic>=2, pymupdf, sentence-transformers, numpy, httpx, python-multipart
│   ├── app/
│   │   ├── main.py            # FastAPI app, CORS (allow http://localhost:3000), router mounts
│   │   ├── config.py         # Settings: LM_STUDIO_URL, MODEL_NAME, CHUNK_SIZE, CHUNK_OVERLAP, TOP_K, EMBED_MODEL
│   │   ├── models.py         # Pydantic v2: AskRequest, UploadResponse, HealthResponse, Source, *Event
│   │   ├── pdf.py            # PyMuPDF: extract list[PageText] preserving page numbers
│   │   ├── chunking.py      # split a page's text into overlapping chunks (size/overlap from config)
│   │   ├── embeddings.py    # lazy-load sentence-transformers; embed(texts) -> normalized np.ndarray
│   │   ├── store.py         # InMemoryStore singleton: chunks[], matrix(np), reset(), is_loaded
│   │   ├── retrieval.py     # embed query, cosine top-k against store, return list[Source]
│   │   ├── llm.py           # httpx async streaming client to LM Studio /v1/chat/completions
│   │   └── routes/
│   │       ├── health.py    # GET /health
│   │       ├── upload.py    # POST /upload
│   │       └── ask.py       # POST /ask (SSE)
│   └── sample/               # a sample multi-page PDF for the verification check
└── frontend/
    ├── package.json          # pnpm; next 15, react 19, typescript strict, tailwind v4
    ├── tsconfig.json         # "strict": true
    ├── next.config.ts
    ├── .env.local.example    # NEXT_PUBLIC_API_BASE=http://localhost:8000
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx          # composes the three panels + client state machine
    │   └── globals.css       # tailwind v4
    ├── components/
    │   ├── UploadPanel.tsx   # file input + upload status (pages/chunks)
    │   ├── QuestionBox.tsx   # question input, disabled until a doc is loaded
    │   ├── AnswerPanel.tsx   # streamed answer text
    │   └── SourceCitation.tsx# expandable source chunk + page number
    └── lib/
        ├── types.ts          # TS mirrors of the Pydantic contracts
        └── api.ts            # uploadPdf(file); askQuestion(q, handlers) consuming SSE
```

---

## Interfaces

### `GET /health` → `HealthResponse`
```
{ status: "ok", lm_studio_reachable: bool, document_loaded: bool }
```
`lm_studio_reachable` is determined by a short GET to `LM_STUDIO_URL/models`.

### `POST /upload` (multipart `file`) → `UploadResponse`
```
{ filename: str, pages: int, chunks: int }
```
Behavior: validate PDF → extract per-page text (PyMuPDF) → chunk each page → embed all chunks → **replace** the singleton store. Reject non-PDF and image-only/empty-text PDFs with a clear 400 (no OCR in v1).

### `POST /ask` (`AskRequest { question: str }`) → **SSE stream**
Ordered events, each `event:` named with a typed JSON `data:` payload:
1. `sources` — `SourcesEvent { sources: Source[] }` where `Source { chunk_id, page, text, score }` (the top-K retrieved chunks, sent first so the UI can render citations immediately)
2. `token` — `TokenEvent { text }` (repeated; forwarded from LM Studio)
3. `done` — `DoneEvent {}`
4. `error` — `ErrorEvent { message }` (terminal; e.g. no document loaded, LM Studio unreachable)

Retrieval params (config defaults): `CHUNK_SIZE=800`, `CHUNK_OVERLAP=150`, `TOP_K=4`.

Prompt construction:
- **system**: "You are a document assistant. Answer the user's question using ONLY the provided context. If the answer is not in the context, say you cannot find it in the document. Do not use outside knowledge."
- **user**: the concatenated top-K chunks (with their page numbers) followed by the question.

---

## Dev topology

Two processes: FastAPI on `:8000` (`uvicorn app.main:app --workers 1 --reload`), Next.js on `:3000` (`pnpm dev`). Frontend reaches the backend via `NEXT_PUBLIC_API_BASE`. Backend enables CORS for `http://localhost:3000`. Both are local-only.

---

## Repository & commit workflow (implementation phase)

- Create a **private** GitHub repo named `airlock` under the user's account (`gh repo create`).
- Before the first commit set: `git config user.name "Sheharyar Ahmed"` and `git config user.email "sheharyar.softwareengineer@gmail.com"`.
- **Commit after every meaningful modification/improvement**, small steps, clean rollback targets.
- **No `Co-Authored-By: Claude` trailer on any commit.** No mention of Claude anywhere in git history or the GitHub contributors section. Sheharyar is the sole author. (Overrides the default trailer instruction.)

---

## Out of scope for v1 (state plainly in README)

Multi-user accounts, authentication, payments, cloud deployment, multi-document libraries, conversation memory across sessions, OCR for scanned/image-only PDFs. Single-user, single-machine, single-document.

---

## Definition of done — end-to-end verification

Prereq: LM Studio running with `llama-3.2-3b-instruct` loaded; backend (`:8000`) and frontend (`:3000`) running; **wifi off**.

**Backend check (independent of UI):**
```bash
# 1. Health
curl -s http://localhost:8000/health
#    expect: {"status":"ok","lm_studio_reachable":true,"document_loaded":false}

# 2. Upload the sample PDF
curl -s -F "file=@backend/sample/<sample>.pdf" http://localhost:8000/upload
#    expect: {"filename":"...","pages":<n>,"chunks":<m>}

# 3. Ask a question whose answer is on a known page (SSE)
curl -N -s -X POST http://localhost:8000/ask \
  -H "Content-Type: application/json" \
  -d '{"question":"<question answered on page X>"}'
#    expect: a `sources` event citing page X, then streamed tokens with a correct answer.

# 4. Ask an out-of-document question
curl -N -s -X POST http://localhost:8000/ask \
  -H "Content-Type: application/json" \
  -d '{"question":"<something not in the document>"}'
#    expect: the model states it cannot find the answer in the document (no fabrication).
```

**UI check:** at `http://localhost:3000`, upload the same PDF, ask both questions, confirm the streamed answer and the expandable source citation shows the correct page; confirm the out-of-document question yields an honest "not found."

**Privacy check:** all four steps above succeed with wifi disabled.

PASS = correct grounded answer + correct page citation for the in-document question, honest "not found" for the out-of-document question, both with wifi off.

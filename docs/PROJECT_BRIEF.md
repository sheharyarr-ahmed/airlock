# Airlock — Project Brief

*The single-source document for portfolio entries, LinkedIn posts, and case-study copy. Every claim below is verifiable in this repository — nothing here is aspirational.*

## One-liner

A private, fully-local PDF assistant: upload a document, ask questions in plain language, get answers grounded in that document with exact page citations — and nothing ever leaves your machine. It works with wifi off.

## The problem it answers

Teams handling sensitive documents — legal, medical, financial, HR — cannot paste them into cloud AI tools. Airlock demonstrates the alternative: the entire inference path (embedding, retrieval, generation) runs on the user's own hardware. If the documents can't leave the building, the model comes to them.

## Architecture (three strict layers)

| Layer | Technology | Responsibility |
|---|---|---|
| Frontend | Next.js 15 App Router, React 19, TypeScript strict, Tailwind v4 | UI only — zero business logic; typed mirrors of every backend contract |
| Backend | FastAPI + Pydantic v2 | The full RAG path: per-page PDF extraction (PyMuPDF), page-scoped chunking, in-process CPU embeddings (all-MiniLM-L6-v2), NumPy cosine retrieval, SSE token streaming |
| Model | LM Studio serving llama-3.2-3b-instruct locally | The only AI in the product; receives only the top-K retrieved chunks — never the full document |

Deliberate engineering decisions (full rationale in [SPEC.md](../SPEC.md)):
- **Chunks never span pages** → every citation maps to exactly one page, unambiguously
- **Embeddings run in-process**, not in LM Studio → an 8GB machine only holds the 3B chat model
- **NumPy brute-force cosine** instead of a vector database → hundreds of chunks need no FAISS-scale machinery
- **Grounded prompting at temperature 0.2** → the model rewords retrieved text; asked something outside the document, it says so plainly

## The interface — "The Sealed Chamber"

The design makes the privacy promise something you *feel* rather than read. The hero is a machined porthole hatch — the entire drop zone. Drop a PDF: the chamber pressurizes while pages index, the lock ring torques shut with a shockwave and frost, and the hatch docks into a `SEALED · LOCAL` pill. Answers bleed through the glass token-by-token in serif type, with citation cards carrying page badges and relative-relevance meters. The masthead's engine indicator is a working miniature of the hatch: its bolt ring idles one revolution per minute while the local engine is reachable, ratchets while checking, and visibly slips off-index when the engine is down.

- Dark-first with full light theme; one-button animated toggle, persisted, no flash of wrong theme
- All motion is CSS, GPU-composited transform/opacity only — **zero animation libraries**; 136 kB First Load JS
- Targeted `prefers-reduced-motion` support that keeps loading feedback honest
- State never carried by color or motion alone; streamed answers announce calmly to screen readers; installable PWA

## Verification discipline

- 12 backend unit tests (chunking, retrieval, API contracts)
- A 19-check Playwright suite driving the real UI against the real local model: upload → seal → streamed answer → expandable citations, error paths, theme persistence, reduced-motion flow
- 7 dedicated failure-mode regressions: backend dying mid-stream, truncated SSE streams, replace-during-answer races — the UI always settles, never sticks
- Every build phase shipped as a small, independently verified commit; final gate is a clean production build

## Fact sheet (safe to quote)

- Fully local; works with wifi off (one-time ~90MB embedding-model download on first upload)
- Stack: FastAPI, Pydantic v2, PyMuPDF, sentence-transformers, NumPy · Next.js 15, React 19, TypeScript strict, Tailwind v4, shadcn/ui on Base UI
- Model: llama-3.2-3b-instruct via LM Studio's OpenAI-compatible endpoint
- v1 scope honestly stated: single-user, single-machine, single-document; no OCR
- MIT licensed, sole author: Sheharyar Ahmed

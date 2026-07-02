"use client";

// The chamber state machine — the only orchestration layer in the app.
// Owns the UI phase and streamed answer state; calls the unchanged lib/api.ts
// client and translates its callbacks into reducer transitions.
import { useCallback, useEffect, useReducer } from "react";
import { toast } from "sonner";
import { askQuestion, uploadPdf } from "./api";
import { getMockState, MOCK_ANSWER, MOCK_DOC, MOCK_SOURCES } from "./devMock";
import type { Source, UploadResponse } from "./types";

export type ChamberPhase = "empty" | "sealing" | "sealed" | "answering";

export interface ChamberState {
  phase: ChamberPhase;
  doc: UploadResponse | null;
  tokens: string[];
  sources: Source[];
}

type ChamberAction =
  | { type: "SEAL_START" }
  | { type: "SEAL_DONE"; doc: UploadResponse }
  | { type: "SEAL_FAIL" }
  | { type: "ASK_START" }
  | { type: "SOURCES"; sources: Source[] }
  | { type: "TOKEN"; text: string }
  | { type: "ASK_SETTLED" }
  | { type: "MOCK"; state: ChamberState };

const INITIAL: ChamberState = { phase: "empty", doc: null, tokens: [], sources: [] };

function reducer(state: ChamberState, action: ChamberAction): ChamberState {
  switch (action.type) {
    case "SEAL_START":
      return { ...state, phase: "sealing" };
    case "SEAL_DONE":
      return { phase: "sealed", doc: action.doc, tokens: [], sources: [] };
    case "SEAL_FAIL":
      // Failed replace keeps the previously sealed document usable.
      return { ...state, phase: state.doc ? "sealed" : "empty" };
    case "ASK_START":
      return { ...state, phase: "answering", tokens: [], sources: [] };
    case "SOURCES":
      return { ...state, sources: action.sources };
    case "TOKEN":
      return { ...state, tokens: [...state.tokens, action.text] };
    case "ASK_SETTLED":
      return { ...state, phase: "sealed" };
    case "MOCK":
      return action.state;
  }
}

// Dev-only ?mock= seeding happens post-mount so SSR markup stays in sync.
function mockState(): ChamberState | null {
  switch (getMockState()) {
    case "sealed":
      return { phase: "sealed", doc: MOCK_DOC, tokens: [], sources: [] };
    case "answering":
      return {
        phase: "answering",
        doc: MOCK_DOC,
        tokens: MOCK_ANSWER.split(/(?<= )/),
        sources: MOCK_SOURCES,
      };
    default:
      return null;
  }
}

export function useChamber() {
  const [state, dispatch] = useReducer(reducer, INITIAL);

  useEffect(() => {
    const seeded = mockState();
    if (seeded) dispatch({ type: "MOCK", state: seeded });
  }, []);

  const seal = useCallback(async (file: File) => {
    dispatch({ type: "SEAL_START" });
    try {
      const doc = await uploadPdf(file);
      dispatch({ type: "SEAL_DONE", doc });
      toast.success(`Sealed ${doc.filename}`, {
        description: `${doc.pages} pages · ${doc.chunks} chunks indexed.`,
      });
    } catch (e) {
      dispatch({ type: "SEAL_FAIL" });
      toast.error("Upload failed", {
        description: e instanceof Error ? e.message : "Could not read that PDF.",
      });
    }
  }, []);

  const ask = useCallback(async (question: string) => {
    dispatch({ type: "ASK_START" });
    await askQuestion(question, {
      onSources: (sources) => dispatch({ type: "SOURCES", sources }),
      onToken: (text) => dispatch({ type: "TOKEN", text }),
      onError: (message) => {
        toast.error("Could not answer", { description: message });
        dispatch({ type: "ASK_SETTLED" });
      },
      onDone: () => dispatch({ type: "ASK_SETTLED" }),
    });
  }, []);

  return { ...state, busy: state.phase === "answering", seal, ask };
}

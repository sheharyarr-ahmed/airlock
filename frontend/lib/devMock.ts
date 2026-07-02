// Dev-only screenshot harness: ?mock=empty|sealed|answering seeds the chamber
// state machine so headless Chrome can capture every UI state without a live
// backend. Returns null in production builds — zero runtime impact there.
import type { Source, UploadResponse } from "./types";

export type MockState = "empty" | "sealed" | "answering";

export const MOCK_DOC: UploadResponse = {
  filename: "beacon-handbook.pdf",
  pages: 4,
  chunks: 4,
};

export const MOCK_SOURCES: Source[] = [
  {
    chunk_id: 2,
    page: 2,
    text: "Beacon crews must complete the pressure-seal checklist before every dive. The hatch indicator turns solid once the chamber reads nominal.",
    score: 0.912,
  },
  {
    chunk_id: 3,
    page: 3,
    text: "In an emergency, the manual override wheel disengages the seal after three full counter-clockwise turns.",
    score: 0.734,
  },
];

export const MOCK_ANSWER =
  "Before every dive, the crew completes the pressure-seal checklist. The hatch indicator turns solid once the chamber reads nominal, and the manual override wheel can disengage the seal in an emergency.";

export function getMockState(): MockState | null {
  if (process.env.NODE_ENV !== "development" || typeof window === "undefined") {
    return null;
  }
  const m = new URLSearchParams(window.location.search).get("mock");
  return m === "empty" || m === "sealed" || m === "answering" ? m : null;
}

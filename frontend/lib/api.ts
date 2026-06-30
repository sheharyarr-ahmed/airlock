// Backend client: typed upload + SSE-consuming ask. No business logic here —
// it only calls the FastAPI backend and surfaces typed results to the UI.
import type {
  HealthResponse,
  Source,
  SourcesEvent,
  TokenEvent,
  ErrorEvent,
  UploadResponse,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";

export async function getHealth(): Promise<HealthResponse> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error(`health ${res.status}`);
  return res.json();
}

export async function uploadPdf(file: File): Promise<UploadResponse> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_BASE}/upload`, { method: "POST", body: form });
  if (!res.ok) {
    const detail = await res.json().catch(() => null);
    throw new Error(detail?.detail ?? `upload failed (${res.status})`);
  }
  return res.json();
}

export interface AskHandlers {
  onSources: (sources: Source[]) => void;
  onToken: (text: string) => void;
  onError: (message: string) => void;
  onDone: () => void;
}

// Consume the POST /ask SSE stream. EventSource can't POST, so we parse the
// `event:`/`data:` frames out of the fetch ReadableStream ourselves.
export async function askQuestion(question: string, handlers: AskHandlers): Promise<void> {
  const res = await fetch(`${API_BASE}/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });

  if (!res.ok || !res.body) {
    handlers.onError(`ask failed (${res.status})`);
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // SSE frames are separated by a blank line.
    let sep: number;
    while ((sep = buffer.indexOf("\n\n")) !== -1) {
      const frame = buffer.slice(0, sep);
      buffer = buffer.slice(sep + 2);
      dispatchFrame(frame, handlers);
    }
  }
}

function dispatchFrame(frame: string, handlers: AskHandlers): void {
  let event = "message";
  let data = "";
  for (const line of frame.split("\n")) {
    if (line.startsWith("event:")) event = line.slice(6).trim();
    else if (line.startsWith("data:")) data += line.slice(5).trim();
  }
  if (!data) return;

  switch (event) {
    case "sources":
      handlers.onSources((JSON.parse(data) as SourcesEvent).sources);
      break;
    case "token":
      handlers.onToken((JSON.parse(data) as TokenEvent).text);
      break;
    case "error":
      handlers.onError((JSON.parse(data) as ErrorEvent).message);
      break;
    case "done":
      handlers.onDone();
      break;
  }
}

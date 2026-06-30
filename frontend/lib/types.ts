// TypeScript mirrors of the backend Pydantic contracts (backend/app/models.py).

export interface UploadResponse {
  filename: string;
  pages: number;
  chunks: number;
}

export interface HealthResponse {
  status: string;
  lm_studio_reachable: boolean;
  document_loaded: boolean;
}

export interface Source {
  chunk_id: number;
  page: number;
  text: string;
  score: number;
}

// SSE event payloads (one typed payload per named event).
export interface SourcesEvent {
  sources: Source[];
}

export interface TokenEvent {
  text: string;
}

export interface ErrorEvent {
  message: string;
}

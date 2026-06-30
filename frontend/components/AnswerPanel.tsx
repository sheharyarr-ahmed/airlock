"use client";

import type { Source } from "@/lib/types";
import SourceCitation from "./SourceCitation";

interface Props {
  answer: string;
  sources: Source[];
  busy: boolean;
  error: string | null;
}

export default function AnswerPanel({ answer, sources, busy, error }: Props) {
  const hasContent = answer || sources.length > 0 || busy || error;
  if (!hasContent) return null;

  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold text-neutral-700">3 · Answer</h2>

      {error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : (
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-800">
          {answer}
          {busy && <span className="ml-0.5 animate-pulse">▍</span>}
        </p>
      )}

      {sources.length > 0 && (
        <div className="mt-4">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">
            Sources
          </h3>
          <div className="flex flex-col gap-2">
            {sources.map((s) => (
              <SourceCitation key={s.chunk_id} source={s} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

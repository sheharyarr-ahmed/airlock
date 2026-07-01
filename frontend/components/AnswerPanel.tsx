"use client";

import type { Source } from "@/lib/types";
import SourceCitation from "./SourceCitation";

interface Props {
  answer: string;
  sources: Source[];
  busy: boolean;
}

export default function AnswerPanel({ answer, sources, busy }: Props) {
  if (!answer && sources.length === 0 && !busy) return null;

  return (
    <section className="fade-in">
      <h2 className="text-gradient text-xs font-semibold uppercase tracking-[0.18em]">
        Answer
      </h2>

      <div className="mt-2 font-serif text-[1.05rem] leading-relaxed text-foreground">
        {answer ? (
          <>
            {answer}
            {busy && <span className="ml-0.5 animate-cursor">▍</span>}
          </>
        ) : (
          busy && <span className="text-muted-foreground">Retrieving…</span>
        )}
      </div>

      {sources.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Sources
          </h3>
          <div className="mt-2 flex flex-col gap-2">
            {sources.map((s) => (
              <SourceCitation key={s.chunk_id} source={s} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

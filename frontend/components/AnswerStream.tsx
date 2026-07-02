"use client";

// The answer bleeds out through the glass: container blurs in once, then each
// streamed token reveals individually (tokens arrive as string[] so only new
// spans animate). Sources stagger in first, mirroring SSE order.
import type { Source } from "@/lib/types";
import SourceCitation from "./SourceCitation";

interface Props {
  tokens: string[];
  sources: Source[];
  busy: boolean;
}

export default function AnswerStream({ tokens, sources, busy }: Props) {
  if (tokens.length === 0 && sources.length === 0 && !busy) return null;

  const maxScore = Math.max(...sources.map((s) => s.score), 0);

  return (
    <section className="answer-bleed">
      <h2 className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.2em]">
        <span className="text-gradient">Answer</span>
        <span className="answer-rule h-[2px] flex-1 rounded-full" aria-hidden="true" />
      </h2>

      {/* Screen readers get two calm announcements (started / full answer)
          instead of a live region that mutates on every streamed token. */}
      <div role="status" className="sr-only">
        {busy ? "Answering from the sealed document…" : tokens.join("")}
      </div>

      <div className="mt-4 max-w-[64ch] font-serif text-[19px] leading-[1.72] text-foreground">
        {tokens.length > 0 ? (
          <>
            {tokens.map((t, i) => (
              <span key={i} className="token-in">
                {t}
              </span>
            ))}
            {busy && <span className="stream-cursor" aria-hidden="true" />}
          </>
        ) : (
          busy && (
            <span className="font-sans text-sm text-muted-foreground">
              Retrieving from the sealed document…
            </span>
          )
        )}
      </div>

      {sources.length > 0 && (
        <div className="mt-8">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Sources
          </h3>
          <div className="mt-3 flex flex-col gap-2">
            {sources.map((s, i) => (
              <div
                key={s.chunk_id}
                className="reveal-up"
                style={{ "--reveal-delay": `${i * 60}ms` } as React.CSSProperties}
              >
                <SourceCitation source={s} fraction={maxScore > 0 ? s.score / maxScore : 0} />
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

"use client";

// The EMPTY/SEALING state: a centered hero chamber on the single 720px axis.
// AskBar and answer are not mounted here — the hatch is the whole story.
import { type RefObject } from "react";
import SealPorthole from "./SealPorthole";
import type { ChamberPhase } from "@/lib/useChamber";

interface Props {
  phase: ChamberPhase;
  onFile: (file: File | undefined) => void;
  hatchRef?: RefObject<HTMLDivElement | null>;
}

export default function ChamberHero({ phase, onFile, hatchRef }: Props) {
  const sealing = phase === "sealing";
  const sealed = phase === "sealed" || phase === "answering";

  return (
    <div className="flex flex-1 flex-col items-center text-center">
      <div className="flex-[0.85]" />

      <div className="iris-in">
        <SealPorthole phase={phase} onFile={onFile} hatchRef={hatchRef} />
      </div>

      <p
        className="text-gradient reveal-up mt-8 text-[11px] font-semibold uppercase tracking-[0.2em]"
        style={{ "--reveal-delay": "80ms" } as React.CSSProperties}
      >
        Private · Local · Offline
      </p>

      <h1
        className="reveal-up mt-3 max-w-[22ch] font-serif text-[clamp(28px,4vw,40px)] font-medium leading-tight tracking-[-0.02em] text-foreground"
        style={{ "--reveal-delay": "160ms" } as React.CSSProperties}
        aria-live="polite"
      >
        {sealing
          ? "Sealing your document…"
          : sealed
            ? "Sealed."
            : "Ask your document anything. Nothing leaves this machine."}
      </h1>

      <p
        className="reveal-up mt-4 text-sm text-muted-foreground"
        style={{ "--reveal-delay": "240ms" } as React.CSSProperties}
      >
        {sealing ? (
          "Pressurizing the chamber — indexing pages on this machine."
        ) : (
          <>
            Drop a PDF to seal it in — or{" "}
            <label
              htmlFor="seal-file"
              className="cursor-pointer font-medium text-foreground underline decoration-primary/40 underline-offset-4 hover:decoration-primary"
            >
              choose a file
            </label>
          </>
        )}
      </p>

      <div className="flex-1" />

      <p className="reveal-up pb-6 text-xs text-muted-foreground/70">
        Answers grounded in your document with page citations · works with wifi off
      </p>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import Masthead from "@/components/Masthead";
import ChamberHero from "@/components/ChamberHero";
import DocSeal from "@/components/DocSeal";
import AskBar from "@/components/AskBar";
import AnswerStream from "@/components/AnswerStream";
import { useChamber } from "@/lib/useChamber";

// After a live seal, hold the hero long enough for the seal one-shot to land
// before the hatch FLIPs down into the DocSeal pill.
const SEAL_HOLD_MS = 1150;

export default function Home() {
  const chamber = useChamber();
  const [docked, setDocked] = useState(false);
  const [dockFrom, setDockFrom] = useState<DOMRect | null>(null);
  const hatchRef = useRef<HTMLDivElement>(null);
  const prevPhase = useRef(chamber.phase);

  useEffect(() => {
    const prev = prevPhase.current;
    prevPhase.current = chamber.phase;

    if (chamber.phase === "empty") {
      setDocked(false);
      setDockFrom(null);
      return;
    }
    if (docked || (chamber.phase !== "sealed" && chamber.phase !== "answering")) return;

    if (prev === "sealing") {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const t = setTimeout(
        () => {
          setDockFrom(hatchRef.current?.getBoundingClientRect() ?? null);
          setDocked(true);
        },
        reduced ? 0 : SEAL_HOLD_MS
      );
      return () => clearTimeout(t);
    }
    // Mock-seeded entry: already sealed, no seal moment to hold for.
    setDocked(true);
  }, [chamber.phase, docked]);

  const onFile = (f: File | undefined) => f && chamber.seal(f);

  return (
    <main
      data-phase={chamber.phase}
      className="mx-auto flex min-h-dvh w-full max-w-[720px] flex-col px-[clamp(20px,5vw,32px)]"
    >
      <Masthead />

      {!docked || !chamber.doc ? (
        <ChamberHero phase={chamber.phase} onFile={onFile} hatchRef={hatchRef} />
      ) : (
        <div className="flex flex-col gap-5 pb-16 pt-2">
          <DocSeal
            doc={chamber.doc}
            querying={chamber.busy}
            sealing={chamber.phase === "sealing"}
            dockFrom={dockFrom}
            onFile={onFile}
          />
          <AskBar
            disabled={chamber.phase === "sealing"}
            busy={chamber.busy}
            onAsk={chamber.ask}
          />
          <AnswerStream
            tokens={chamber.tokens}
            sources={chamber.sources}
            busy={chamber.busy}
          />
        </div>
      )}
    </main>
  );
}

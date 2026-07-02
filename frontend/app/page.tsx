"use client";

import Masthead from "@/components/Masthead";
import UploadPanel from "@/components/UploadPanel";
import QuestionBox from "@/components/QuestionBox";
import AnswerPanel from "@/components/AnswerPanel";
import { useChamber } from "@/lib/useChamber";

export default function Home() {
  const chamber = useChamber();

  return (
    <main
      data-phase={chamber.phase}
      className="mx-auto flex max-w-[680px] flex-col gap-6 px-4 py-12"
    >
      <Masthead />
      <UploadPanel
        phase={chamber.phase}
        doc={chamber.doc}
        onFile={(f) => f && chamber.seal(f)}
      />
      <QuestionBox
        disabled={chamber.phase === "empty" || chamber.phase === "sealing"}
        busy={chamber.busy}
        onAsk={chamber.ask}
      />
      <AnswerPanel
        answer={chamber.tokens.join("")}
        sources={chamber.sources}
        busy={chamber.busy}
      />
    </main>
  );
}

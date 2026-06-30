"use client";

import { useState } from "react";
import UploadPanel from "@/components/UploadPanel";
import QuestionBox from "@/components/QuestionBox";
import AnswerPanel from "@/components/AnswerPanel";
import { askQuestion } from "@/lib/api";
import type { Source, UploadResponse } from "@/lib/types";

export default function Home() {
  const [doc, setDoc] = useState<UploadResponse | null>(null);
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState<Source[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAsk(question: string) {
    setBusy(true);
    setError(null);
    setAnswer("");
    setSources([]);
    await askQuestion(question, {
      onSources: setSources,
      onToken: (t) => setAnswer((prev) => prev + t),
      onError: (m) => {
        setError(m);
        setBusy(false);
      },
      onDone: () => setBusy(false),
    });
  }

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-5 px-4 py-10">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Airlock</h1>
        <p className="text-sm text-neutral-500">
          Private, fully-local PDF assistant — answers grounded in your document, with page
          citations. Nothing leaves this machine.
        </p>
      </header>

      <UploadPanel onLoaded={setDoc} />
      <QuestionBox disabled={!doc} busy={busy} onAsk={handleAsk} />
      <AnswerPanel answer={answer} sources={sources} busy={busy} error={error} />
    </main>
  );
}

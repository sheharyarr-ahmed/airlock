"use client";

import { useState } from "react";
import { toast } from "sonner";
import Masthead from "@/components/Masthead";
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

  async function handleAsk(question: string) {
    setBusy(true);
    setAnswer("");
    setSources([]);
    await askQuestion(question, {
      onSources: setSources,
      onToken: (t) => setAnswer((prev) => prev + t),
      onError: (m) => {
        toast.error("Could not answer", { description: m });
        setBusy(false);
      },
      onDone: () => setBusy(false),
    });
  }

  return (
    <main className="mx-auto flex max-w-[680px] flex-col gap-6 px-4 py-12">
      <Masthead />
      <UploadPanel onLoaded={setDoc} />
      <QuestionBox disabled={!doc} busy={busy} onAsk={handleAsk} />
      <AnswerPanel answer={answer} sources={sources} busy={busy} />
    </main>
  );
}

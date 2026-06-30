"use client";

import { useState } from "react";

interface Props {
  disabled: boolean;
  busy: boolean;
  onAsk: (question: string) => void;
}

export default function QuestionBox({ disabled, busy, onAsk }: Props) {
  const [question, setQuestion] = useState("");

  function submit() {
    const q = question.trim();
    if (q && !disabled && !busy) onAsk(q);
  }

  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold text-neutral-700">2 · Ask</h2>
      <div className="flex gap-2">
        <input
          type="text"
          value={question}
          disabled={disabled}
          placeholder={disabled ? "Upload a document first" : "Ask a question about the document…"}
          className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500 disabled:bg-neutral-50 disabled:text-neutral-400"
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
        />
        <button
          onClick={submit}
          disabled={disabled || busy || !question.trim()}
          className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:cursor-not-allowed disabled:bg-neutral-300"
        >
          {busy ? "…" : "Ask"}
        </button>
      </div>
    </section>
  );
}

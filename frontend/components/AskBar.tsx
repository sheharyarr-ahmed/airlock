"use client";

// Questions are asked "into the chamber": a full-width pill on the column
// axis. Focus pulls a coral ring glow (CSS :focus-within on .askbar).
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Props {
  disabled: boolean;
  busy: boolean;
  onAsk: (question: string) => void;
}

export default function AskBar({ disabled, busy, onAsk }: Props) {
  const [question, setQuestion] = useState("");

  function submit() {
    const q = question.trim();
    if (q && !disabled && !busy) onAsk(q);
  }

  return (
    <div className="askbar elev-1 flex items-center gap-2 rounded-full border border-border bg-card p-1.5 pl-5">
      <Input
        aria-label="Ask about the document"
        value={question}
        disabled={disabled}
        autoFocus
        placeholder={disabled ? "Sealing…" : "Ask about the document…"}
        onChange={(e) => setQuestion(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        className="h-9 border-0 bg-transparent px-0 shadow-none focus-visible:border-0 focus-visible:ring-0"
      />
      <Button
        onClick={submit}
        disabled={disabled || busy || !question.trim()}
        className="accent-gradient rounded-full border-0 px-6 text-white transition-[transform,filter] hover:-translate-y-px hover:brightness-110 active:translate-y-0 active:scale-[0.98]"
      >
        {busy ? "…" : "Ask"}
      </Button>
    </div>
  );
}

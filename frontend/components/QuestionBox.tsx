"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
    <div className="fade-in flex items-center gap-2 rounded-full bg-card p-1.5 pl-5 ring-1 ring-foreground/10">
      <Input
        value={question}
        disabled={disabled}
        placeholder={disabled ? "Upload a document to begin…" : "Ask about the document…"}
        onChange={(e) => setQuestion(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        className="h-9 border-0 bg-transparent px-0 shadow-none focus-visible:border-0 focus-visible:ring-0"
      />
      <Button
        onClick={submit}
        disabled={disabled || busy || !question.trim()}
        className="accent-gradient rounded-full border-0 px-6 text-white hover:opacity-90"
      >
        {busy ? "…" : "Ask"}
      </Button>
    </div>
  );
}

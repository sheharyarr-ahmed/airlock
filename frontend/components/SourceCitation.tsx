"use client";

import { useState } from "react";
import type { Source } from "@/lib/types";

export default function SourceCitation({ source }: { source: Source }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg border border-neutral-200 bg-neutral-50 text-sm">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-3 py-2 text-left"
      >
        <span className="font-medium text-neutral-700">
          Page {source.page}
          <span className="ml-2 font-normal text-neutral-400">
            score {source.score.toFixed(3)}
          </span>
        </span>
        <span className="text-neutral-400">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <p className="border-t border-neutral-200 px-3 py-2 text-neutral-600">{source.text}</p>
      )}
    </div>
  );
}

"use client";

// A fragment lifted from the sealed document. Page badge is a tinted chip —
// coral is reserved for the open one; relevance is a micro-meter (relative to
// the best match), and the expanded chunk sits on a glass-tint wash.
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import type { Source } from "@/lib/types";

interface Props {
  source: Source;
  fraction?: number; // 0..1, relevance relative to the best-scoring source
}

export default function SourceCitation({ source, fraction = 0 }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className={cn(
        "source-card relative overflow-hidden rounded-lg border border-border bg-card transition-colors",
        open && "source-card-open"
      )}
    >
      <CollapsibleTrigger className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left">
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-xs font-semibold transition-colors",
            open ? "accent-gradient text-white" : "bg-accent text-accent-foreground"
          )}
        >
          p.{source.page}
        </span>
        <span
          className="micro-meter"
          title={`relevance ${source.score.toFixed(3)}`}
          aria-hidden="true"
        >
          <span style={{ width: `${Math.round(Math.max(0.08, fraction) * 100)}%` }} />
        </span>
        <span className="text-xs text-muted-foreground">relevance</span>
        <ChevronDown
          className={cn(
            "ml-auto size-4 text-muted-foreground transition-transform",
            open && "rotate-180"
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <p className="source-chunk px-3.5 py-3 font-serif text-[15px] leading-relaxed text-foreground/85">
          {source.text}
        </p>
      </CollapsibleContent>
    </Collapsible>
  );
}

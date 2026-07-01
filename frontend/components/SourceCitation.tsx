"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import type { Source } from "@/lib/types";

export default function SourceCitation({ source }: { source: Source }) {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="rounded-lg bg-card ring-1 ring-foreground/10"
    >
      <CollapsibleTrigger className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left">
        <span className="flex items-center gap-2 text-sm">
          <span className="accent-gradient rounded-full px-2 py-0.5 text-xs font-semibold text-white">
            p.{source.page}
          </span>
          <span className="text-muted-foreground">
            relevance {source.score.toFixed(3)}
          </span>
        </span>
        <ChevronDown
          className={cn(
            "size-4 text-muted-foreground transition-transform",
            open && "rotate-180"
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="px-3 pb-3 text-sm leading-relaxed text-muted-foreground">
        {source.text}
      </CollapsibleContent>
    </Collapsible>
  );
}

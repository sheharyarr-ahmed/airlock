"use client";

// The docked seal: the hatch shrunk to a 28px indicator inside a status pill.
// FLIPs in from the hero hatch's last on-screen position.
import Porthole from "./Porthole";
import { useFlipDock } from "@/lib/useFlipDock";
import type { UploadResponse } from "@/lib/types";

interface Props {
  doc: UploadResponse;
  querying: boolean;
  sealing: boolean;
  dockFrom: DOMRect | null;
  onFile: (file: File | undefined) => void;
}

export default function DocSeal({ doc, querying, sealing, dockFrom, onFile }: Props) {
  const portholeRef = useFlipDock<HTMLDivElement>(dockFrom);

  return (
    <div
      data-querying={querying}
      className="elev-1 flex items-center gap-3 rounded-full border border-border bg-card py-2 pl-3 pr-2"
    >
      <div ref={portholeRef} className="relative size-7 shrink-0">
        <div className="dock-pulse" />
        <Porthole className="size-7" />
      </div>

      <span className="text-gradient text-[10px] font-semibold uppercase tracking-[0.18em]">
        Sealed · Local
      </span>

      <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
        {doc.filename}
      </span>

      <span className="shrink-0 text-xs text-muted-foreground">
        {doc.pages}p · {doc.chunks} chunks
      </span>

      <label className="shrink-0 cursor-pointer rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
        {sealing ? "Sealing…" : "Replace"}
        <input
          type="file"
          accept="application/pdf"
          className="sr-only"
          disabled={sealing}
          onChange={(e) => {
            onFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </label>
    </div>
  );
}

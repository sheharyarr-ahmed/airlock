"use client";

import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import PortholeMark from "./PortholeMark";
import type { ChamberPhase } from "@/lib/useChamber";
import type { UploadResponse } from "@/lib/types";

interface Props {
  phase: ChamberPhase;
  doc: UploadResponse | null;
  onFile: (file: File | undefined) => void;
}

// Presentational: upload orchestration lives in useChamber.
export default function UploadPanel({ phase, doc, onFile }: Props) {
  const uploading = phase === "sealing";

  return (
    <Card className="fade-in p-1">
      <label className="flex cursor-pointer flex-col items-center gap-3 rounded-lg border-2 border-dashed border-border px-6 py-10 text-center transition-colors hover:border-primary/50 hover:bg-accent/40">
        <PortholeMark className="size-12" />
        <div>
          <p className="font-serif text-lg font-medium text-foreground">
            {uploading ? "Reading your document…" : doc ? "Replace document" : "Upload a PDF"}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Text-based PDFs only — no OCR in v1.
          </p>
        </div>
        <span className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
          {uploading ? "Processing…" : "Choose file"}
        </span>
        <input
          type="file"
          accept="application/pdf"
          className="hidden"
          disabled={uploading}
          onChange={(e) => onFile(e.target.files?.[0])}
        />
      </label>

      {doc && (
        <p className="px-4 pb-1 text-center text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{doc.filename}</span> ·{" "}
          {doc.pages} pages · {doc.chunks} chunks
        </p>
      )}
    </Card>
  );
}

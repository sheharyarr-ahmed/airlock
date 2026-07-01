"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import PortholeMark from "./PortholeMark";
import { uploadPdf } from "@/lib/api";
import type { UploadResponse } from "@/lib/types";

interface Props {
  onLoaded: (info: UploadResponse) => void;
}

export default function UploadPanel({ onLoaded }: Props) {
  const [status, setStatus] = useState<"idle" | "uploading">("idle");
  const [info, setInfo] = useState<UploadResponse | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setStatus("uploading");
    try {
      const res = await uploadPdf(file);
      setInfo(res);
      onLoaded(res);
      toast.success(`Loaded ${res.filename}`, {
        description: `${res.pages} pages · ${res.chunks} chunks indexed.`,
      });
    } catch (e) {
      toast.error("Upload failed", {
        description: e instanceof Error ? e.message : "Could not read that PDF.",
      });
    } finally {
      setStatus("idle");
    }
  }

  return (
    <Card className="fade-in p-1">
      <label className="flex cursor-pointer flex-col items-center gap-3 rounded-lg border-2 border-dashed border-border px-6 py-10 text-center transition-colors hover:border-primary/50 hover:bg-accent/40">
        <PortholeMark className="size-12" />
        <div>
          <p className="font-serif text-lg font-medium text-foreground">
            {status === "uploading"
              ? "Reading your document…"
              : info
                ? "Replace document"
                : "Upload a PDF"}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Text-based PDFs only — no OCR in v1.
          </p>
        </div>
        <span className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
          {status === "uploading" ? "Processing…" : "Choose file"}
        </span>
        <input
          type="file"
          accept="application/pdf"
          className="hidden"
          disabled={status === "uploading"}
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </label>

      {info && (
        <p className="px-4 pb-1 text-center text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{info.filename}</span> ·{" "}
          {info.pages} pages · {info.chunks} chunks
        </p>
      )}
    </Card>
  );
}

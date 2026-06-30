"use client";

import { useState } from "react";
import { uploadPdf } from "@/lib/api";
import type { UploadResponse } from "@/lib/types";

interface Props {
  onLoaded: (info: UploadResponse) => void;
}

export default function UploadPanel({ onLoaded }: Props) {
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [info, setInfo] = useState<UploadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setStatus("uploading");
    setError(null);
    try {
      const res = await uploadPdf(file);
      setInfo(res);
      setStatus("idle");
      onLoaded(res);
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Upload failed");
    }
  }

  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold text-neutral-700">1 · Document</h2>
      <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-neutral-300 px-4 py-8 text-center text-sm text-neutral-500 hover:border-neutral-400">
        <span className="font-medium text-neutral-700">
          {status === "uploading" ? "Processing…" : "Choose a PDF"}
        </span>
        <span>Text-based PDFs only (no OCR in v1)</span>
        <input
          type="file"
          accept="application/pdf"
          className="hidden"
          disabled={status === "uploading"}
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </label>

      {info && (
        <p className="mt-3 text-sm text-emerald-700">
          Loaded <span className="font-medium">{info.filename}</span> — {info.pages} pages,{" "}
          {info.chunks} chunks.
        </p>
      )}
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </section>
  );
}

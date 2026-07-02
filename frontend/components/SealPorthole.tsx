"use client";

// The hero hatch: the entire porthole is the drop zone — no dashed border.
// Maps chamber phase → hatch visual (idle | pressurizing | sealed | unsealing);
// a failed seal plays a brief unsealing vent before returning to idle.
import { useEffect, useRef, useState, type RefObject } from "react";
import Porthole from "./Porthole";
import type { ChamberPhase } from "@/lib/useChamber";

interface Props {
  phase: ChamberPhase;
  onFile: (file: File | undefined) => void;
  hatchRef?: RefObject<HTMLDivElement | null>;
}

type HatchVisual = "idle" | "pressurizing" | "sealed" | "unsealing";

function visualFor(phase: ChamberPhase): HatchVisual {
  if (phase === "sealing") return "pressurizing";
  if (phase === "sealed" || phase === "answering") return "sealed";
  return "idle";
}

export default function SealPorthole({ phase, onFile, hatchRef }: Props) {
  const [armed, setArmed] = useState(false);
  const [venting, setVenting] = useState(false);
  const prevPhase = useRef(phase);

  useEffect(() => {
    const prev = prevPhase.current;
    prevPhase.current = phase;
    if (prev === "sealing" && phase === "empty") {
      setVenting(true);
      const t = setTimeout(() => setVenting(false), 650);
      return () => clearTimeout(t);
    }
  }, [phase]);

  const visual: HatchVisual = venting ? "unsealing" : visualFor(phase);
  const sealing = phase === "sealing";

  return (
    <label
      className="hatch cursor-pointer"
      data-phase={visual}
      onDragOver={(e) => {
        e.preventDefault();
        if (!sealing) setArmed(true);
      }}
      onDragLeave={() => setArmed(false)}
      onDrop={(e) => {
        e.preventDefault();
        setArmed(false);
        if (!sealing) onFile(e.dataTransfer.files?.[0]);
      }}
    >
      <div
        ref={hatchRef}
        className={`relative mx-auto w-[clamp(240px,42vw,340px)] ${armed ? "hatch-armed" : ""}`}
      >
        <div className="hatch-glow" />
        <div className="hatch-body">
          <Porthole className="drop-shadow-xl" />
          <div className="hatch-doc" />
          <div className="hatch-frost" />
        </div>
        <div className="hatch-sweep" />
        <div className="hatch-shockwave" />
      </div>
      <input
        id="seal-file"
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
  );
}

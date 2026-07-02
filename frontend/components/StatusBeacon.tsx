"use client";

// Live chamber telemetry in the masthead: polls the local backend and shows
// whether the LM Studio engine is reachable. Makes the privacy promise
// visible — the "engine" being local IS the product.
import { useEffect, useState } from "react";
import { getHealth } from "@/lib/api";

type BeaconState = "checking" | "online" | "offline";

const COPY: Record<BeaconState, { label: string; detail: string }> = {
  checking: {
    label: "Checking engine…",
    detail: "Contacting the local backend.",
  },
  online: {
    label: "Local · Online",
    detail: "LM Studio reachable on this machine — inference never leaves it.",
  },
  offline: {
    label: "Engine offline",
    detail: "Can't reach LM Studio. Start it locally to seal and ask.",
  },
};

export default function StatusBeacon() {
  const [state, setState] = useState<BeaconState>("checking");

  useEffect(() => {
    let alive = true;
    async function ping() {
      try {
        const h = await getHealth();
        if (alive) setState(h.lm_studio_reachable ? "online" : "offline");
      } catch {
        if (alive) setState("offline");
      }
    }
    ping();
    const id = setInterval(ping, 30_000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  return (
    <div
      role="status"
      aria-label={COPY[state].label}
      title={COPY[state].detail}
      className="flex items-center gap-2"
    >
      <span className={`beacon-dot beacon-${state}`} aria-hidden="true" />
      <span className="hidden text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground sm:inline">
        {COPY[state].label}
      </span>
    </div>
  );
}

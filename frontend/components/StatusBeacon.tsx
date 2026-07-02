"use client";

// Live chamber telemetry in the masthead. The indicator is the "Torque
// Collar": a working miniature of the hero hatch. Online, its bolt ring
// idles one revolution per minute (watch-movement calm); while checking it
// ratchets bolt-to-bolt like a torque wrench; offline the mechanism has
// slipped — ring off-index, one bolt ejected, glass slashed. State is
// carried by silhouette and pose, never by color or motion alone.
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

// Bolts at radius 6.2 around (10,10), 60° apart starting top. The bottom
// bolt carries beacon-bolt-eject so the offline state can vent it.
const BOLTS: Array<[number, number, boolean]> = [
  [10, 3.8, false],
  [15.37, 6.9, false],
  [15.37, 13.1, false],
  [10, 16.2, true],
  [4.63, 13.1, false],
  [4.63, 6.9, false],
];

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
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        aria-hidden="true"
        className={`beacon-mark beacon--${state}`}
      >
        <circle className="beacon-collar" cx="10" cy="10" r="8.3" fill="none" strokeWidth="1.4" />
        <g className="beacon-bolts">
          {BOLTS.map(([cx, cy, eject]) => (
            <circle
              key={`${cx}-${cy}`}
              className={eject ? "beacon-bolt beacon-bolt-eject" : "beacon-bolt"}
              cx={cx}
              cy={cy}
              r="1.1"
            />
          ))}
        </g>
        <circle className="beacon-glow" cx="10" cy="10" r="4.7" />
        <circle className="beacon-glass" cx="10" cy="10" r="3.3" strokeWidth="1.3" />
        <line
          className="beacon-slash"
          x1="7.6"
          y1="12.4"
          x2="12.4"
          y2="7.6"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
      <span className="hidden text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground sm:inline">
        {COPY[state].label}
      </span>
    </div>
  );
}

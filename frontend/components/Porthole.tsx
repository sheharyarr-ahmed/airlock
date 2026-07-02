"use client";

import { useId } from "react";

// The hatch mark, scalable from 320px hero to 28px docked indicator.
// Bolt ring → machined metal ring (with inset coral rim light) → radial
// glass → coral serif "A". Parts carry classes so CSS phase animations
// (ring torque, bolt scan) can target them.
export default function Porthole({ className }: { className?: string }) {
  const uid = useId().replace(/[:]/g, "");
  const rim = `rim-${uid}`;
  const glass = `glass-${uid}`;
  const coral = `coral-${uid}`;

  const bolts = Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 180) * (i * 60 - 90);
    return { cx: 100 + 92 * Math.cos(a), cy: 100 + 92 * Math.sin(a) };
  });

  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={rim} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--hatch-rim-hi)" />
          <stop offset="1" stopColor="var(--hatch-rim-lo)" />
        </linearGradient>
        <radialGradient id={glass}>
          <stop offset="0" stopColor="var(--glass-center)" />
          <stop offset="1" stopColor="var(--glass-edge)" />
        </radialGradient>
        <linearGradient id={coral} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F5375B" />
          <stop offset="1" stopColor="#FF6B4A" />
        </linearGradient>
      </defs>

      <g className="porthole-ring-group">
        {/* Machined metal ring */}
        <circle cx="100" cy="100" r="98" fill={`url(#${rim})`} />
        {bolts.map((b, i) => (
          <circle
            key={i}
            className="porthole-bolt"
            cx={b.cx}
            cy={b.cy}
            r="4.5"
            fill="var(--hatch-rim-hi)"
            opacity="0.9"
          />
        ))}
        {/* Inset coral rim light */}
        <circle
          cx="100"
          cy="100"
          r="84"
          fill="none"
          stroke="var(--coral-glow)"
          strokeWidth="2.5"
        />
      </g>

      {/* Hatch face + glass */}
      <circle cx="100" cy="100" r="80" fill="var(--hatch-face)" />
      <circle cx="100" cy="100" r="68" fill={`url(#${glass})`} />
      <circle cx="100" cy="100" r="68" fill="var(--glass-tint)" />

      <text
        className="porthole-a"
        x="100"
        y="128"
        textAnchor="middle"
        fontFamily="var(--font-newsreader), Georgia, serif"
        fontSize="82"
        fontWeight="600"
        fill={`url(#${coral})`}
      >
        A
      </text>
    </svg>
  );
}

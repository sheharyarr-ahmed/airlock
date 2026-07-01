import { useId } from "react";

// The Airlock brand mark: a sealed porthole/hatch — "private, nothing leaves".
// Inline SVG so it renders before the Claude Design PNGs are dropped in.
export default function PortholeMark({ className }: { className?: string }) {
  const gid = useId().replace(/[:]/g, "");

  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F5375B" />
          <stop offset="1" stopColor="#FF6B4A" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill={`url(#${gid})`} />
      <g fill="#ffffff" opacity="0.9">
        <circle cx="32" cy="6" r="1.9" />
        <circle cx="54.5" cy="19" r="1.9" />
        <circle cx="54.5" cy="45" r="1.9" />
        <circle cx="32" cy="58" r="1.9" />
        <circle cx="9.5" cy="45" r="1.9" />
        <circle cx="9.5" cy="19" r="1.9" />
      </g>
      <circle cx="32" cy="32" r="21" fill="var(--card)" />
      <circle cx="32" cy="32" r="21" fill={`url(#${gid})`} opacity="0.08" />
      <text
        x="32"
        y="42"
        textAnchor="middle"
        fontFamily="var(--font-newsreader), Georgia, serif"
        fontSize="28"
        fontWeight="700"
        fill={`url(#${gid})`}
      >
        A
      </text>
    </svg>
  );
}

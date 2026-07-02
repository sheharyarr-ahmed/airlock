// Ambient chamber atmosphere: coral aurora drifting behind a vignette that
// darkens the edges. Zero-JS server component; both layers are pure CSS and
// freeze (but stay visible) under prefers-reduced-motion.
export default function AuroraBackground() {
  return (
    <div aria-hidden="true">
      <div className="chamber-aurora" />
      <div className="chamber-vignette" />
    </div>
  );
}

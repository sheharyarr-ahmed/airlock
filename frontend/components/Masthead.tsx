import Porthole from "./Porthole";
import ThemeToggle from "./ThemeToggle";
import StatusBeacon from "./StatusBeacon";

// Full-width sticky app bar over the chamber: frosted glass, hairline bottom
// edge. Brand anchors the left edge; live engine telemetry and the theme
// toggle sit on the right — content below stays on the 720px column.
export default function Masthead() {
  return (
    <header className="masthead-bar reveal-up">
      <div className="flex h-14 items-center justify-between gap-4 px-5 sm:px-8">
        <a
          href="/"
          aria-label="Airlock — start over"
          className="group flex min-w-0 items-center gap-2.5 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Porthole className="size-7 shrink-0 transition-transform duration-300 group-hover:rotate-[14deg]" />
          <span className="truncate font-serif text-[20px] font-semibold tracking-tight text-foreground">
            Airlock
          </span>
        </a>

        <div className="flex shrink-0 items-center gap-3">
          <StatusBeacon />
          <span className="h-5 w-px bg-border" aria-hidden="true" />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

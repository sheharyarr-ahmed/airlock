import Porthole from "./Porthole";
import ThemeToggle from "./ThemeToggle";

// Chrome-only masthead: wordmark on the column axis, theme toggle is the one
// right-aligned element on the page.
export default function Masthead() {
  return (
    <header className="reveal-up flex items-center justify-between pb-4 pt-6">
      <div className="flex items-center gap-2.5">
        <Porthole className="size-7" />
        <span className="font-serif text-[22px] font-semibold tracking-tight text-foreground">
          Airlock
        </span>
      </div>
      <ThemeToggle />
    </header>
  );
}

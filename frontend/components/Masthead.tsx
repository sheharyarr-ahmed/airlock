import PortholeMark from "./PortholeMark";
import ThemeToggle from "./ThemeToggle";

export default function Masthead() {
  return (
    <header className="fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <PortholeMark className="size-10" />
          <span className="font-serif text-3xl font-semibold tracking-tight text-foreground">
            Airlock
          </span>
        </div>
        <ThemeToggle />
      </div>

      <div className="mt-4 h-px w-full bg-border" />

      <p className="text-gradient mt-3 inline-block text-xs font-semibold uppercase tracking-[0.18em]">
        Private · Local · Offline
      </p>
      <p className="mt-1 max-w-prose text-sm leading-relaxed text-muted-foreground">
        A private PDF assistant. Ask questions in plain language and get answers grounded
        in your document, with exact page citations. Nothing ever leaves this machine.
      </p>
    </header>
  );
}

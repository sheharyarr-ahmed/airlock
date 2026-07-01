"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle(next: boolean) {
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      /* ignore storage errors (private mode) */
    }
  }

  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <Sun className="size-4" />
      <Switch
        checked={mounted ? dark : false}
        onCheckedChange={toggle}
        aria-label="Toggle dark mode"
      />
      <Moon className="size-4" />
    </div>
  );
}

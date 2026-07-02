"use client";

// One-button theme toggle: sun and moon cross-fade/rotate via the .dark class
// (CSS-driven, so SSR markup never mismatches).
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      /* ignore storage errors (private mode) */
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      className="theme-btn"
    >
      <Sun className="theme-icon theme-icon-sun" />
      <Moon className="theme-icon theme-icon-moon" />
    </button>
  );
}

"use client";

// FLIP the docked porthole from the hero hatch's last position — Web
// Animations API, no library. No-ops under prefers-reduced-motion.
import { useLayoutEffect, useRef } from "react";

export function useFlipDock<T extends HTMLElement>(from: DOMRect | null) {
  const ref = useRef<T>(null);
  const played = useRef(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !from || played.current) return;
    played.current = true;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const to = el.getBoundingClientRect();
    if (!to.width) return;
    const dx = from.left - to.left;
    const dy = from.top - to.top;
    const scale = from.width / to.width;
    el.animate(
      [
        { transform: `translate(${dx}px, ${dy}px) scale(${scale})`, opacity: 0.9 },
        { transform: "none", opacity: 1 },
      ],
      { duration: 640, easing: "cubic-bezier(0.76, 0, 0.24, 1)" }
    );
  }, [from]);

  return ref;
}

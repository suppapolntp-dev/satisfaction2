"use client";

import { useEffect } from "react";

export default function TouchEnabler() {
  useEffect(() => {
    const noop = () => {};

    // iOS requires a touch listener for :active CSS to apply reliably.
    document.addEventListener("touchstart", noop, { passive: true });
    // iPad external pointer/mouse can use pointer events instead of touch events.
    document.addEventListener("pointerdown", noop, { passive: true });

    // Add a class so global styles can target touch-specific rules if needed.
    document.body.classList.add("touch-manipulation");

    return () => {
      document.removeEventListener("touchstart", noop);
      document.removeEventListener("pointerdown", noop);
      document.body.classList.remove("touch-manipulation");
    };
  }, []);

  return null;
}

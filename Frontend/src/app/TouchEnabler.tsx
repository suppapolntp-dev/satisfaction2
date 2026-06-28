"use client";

import { useEffect } from "react";

const noop = () => {};

export default function TouchEnabler() {
  useEffect(() => {
    // เอา pointerdown ออก — ขัด React 19 synthetic events
    document.addEventListener("touchstart", noop, { passive: true });
    document.body.classList.add("touch-manipulation");

    return () => {
      document.removeEventListener("touchstart", noop);
      document.body.classList.remove("touch-manipulation");
    };
  }, []);

  return null;
}
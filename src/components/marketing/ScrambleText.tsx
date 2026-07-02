import React, { useEffect, useRef, useState } from "react";

/**
 * Scramble-in heading effect: characters cycle through glyphs and resolve
 * left-to-right into the final text over ~0.8s on mount. Screen readers get
 * the final text immediately (aria-label + aria-hidden scramble), and
 * prefers-reduced-motion renders the plain text with no animation.
 */

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&*+=<>/";

interface ScrambleTextProps {
  text: string;
  /** Delay before the scramble starts, in ms. */
  delayMs?: number;
  className?: string;
}

const ScrambleText = ({ text, delayMs = 0, className }: ScrambleTextProps) => {
  const [display, setDisplay] = useState(text);
  const frameRef = useRef<number>();

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    let start: number | null = null;
    const DURATION = 800;

    const tick = (now: number) => {
      if (start === null) start = now;
      const progress = Math.min(1, (now - start) / DURATION);
      // Characters left of the resolve point are final; the rest scramble.
      const resolved = Math.floor(progress * text.length);
      let next = "";
      for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (i < resolved || ch === " " || progress === 1) {
          next += ch;
        } else {
          next += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }
      }
      setDisplay(next);
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    };

    const timer = window.setTimeout(() => {
      frameRef.current = requestAnimationFrame(tick);
    }, delayMs);

    return () => {
      window.clearTimeout(timer);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [text, delayMs]);

  return (
    <span className={className}>
      <span aria-hidden="true">{display}</span>
      <span className="sr-only">{text}</span>
    </span>
  );
};

export default ScrambleText;

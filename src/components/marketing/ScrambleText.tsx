import React, { useEffect, useRef, useState } from "react";

/**
 * Scramble-in heading effect: characters cycle through glyphs and resolve
 * left-to-right into the final text over ~0.8s on mount. The final text stays
 * invisibly in normal flow while the animation is overlaid, so changing glyph
 * widths cannot move the surrounding hero content. Screen readers get the
 * final text immediately, and reduced-motion users get no animation.
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
    <span
      className={["relative inline-block whitespace-nowrap", className].filter(Boolean).join(" ")}
      aria-label={text}
    >
      <span aria-hidden="true" className="invisible">{text}</span>
      <span aria-hidden="true" className="absolute inset-0">{display}</span>
    </span>
  );
};

export default ScrambleText;

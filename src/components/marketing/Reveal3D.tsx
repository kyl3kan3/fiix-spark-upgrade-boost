import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Scroll-in 3D reveal wrapper.
 *
 * Children start rotated back in 3D (the .reveal-3d utility in index.css)
 * and stand upright once the element scrolls into view. Fires once per
 * element; `delayMs` staggers siblings. Under prefers-reduced-motion the CSS
 * renders the final state immediately.
 */
interface Reveal3DProps {
  children: React.ReactNode;
  delayMs?: number;
  className?: string;
}

const Reveal3D = ({ children, delayMs = 0, className }: Reveal3DProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      setRevealed(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn("reveal-3d", revealed && "is-revealed", className)}
      style={delayMs ? ({ "--reveal-delay": `${delayMs}ms` } as React.CSSProperties) : undefined}
    >
      {children}
    </div>
  );
};

export default Reveal3D;

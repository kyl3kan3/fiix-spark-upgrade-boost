import React, { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Magnetic hover wrapper: the child drifts a few pixels toward the cursor
 * while hovered and springs back on leave. Fine-pointer devices only;
 * inert under prefers-reduced-motion and on touch.
 */

interface MagneticProps {
  children: React.ReactNode;
  /** Maximum pull distance in px. */
  strength?: number;
  className?: string;
}

const Magnetic = ({ children, strength = 6, className }: MagneticProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>();
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(
      typeof window !== "undefined" &&
        window.matchMedia("(pointer: fine)").matches &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  const handleMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!enabled) return;
      const node = ref.current;
      if (!node) return;
      const { clientX, clientY } = event;
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      frameRef.current = requestAnimationFrame(() => {
        const rect = node.getBoundingClientRect();
        const dx = (clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
        const dy = (clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
        node.style.transform = `translate(${(dx * strength).toFixed(1)}px, ${(dy * strength).toFixed(1)}px)`;
        node.style.transition = "transform 60ms linear";
      });
    },
    [enabled, strength],
  );

  const handleLeave = useCallback(() => {
    if (!enabled) return;
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    const node = ref.current;
    if (!node) return;
    node.style.transform = "translate(0px, 0px)";
    node.style.transition = "transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1)";
  }, [enabled]);

  return (
    <div
      ref={ref}
      className={cn("inline-block", className)}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
    >
      {children}
    </div>
  );
};

export default Magnetic;

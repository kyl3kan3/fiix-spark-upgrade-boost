import React, { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Pointer-tracking 3D tilt wrapper.
 *
 * Renders a perspective scene whose child plane rotates toward the cursor
 * (rotateX/rotateY via the --tilt-* custom properties consumed by the
 * .tilt-3d utility in index.css) and eases back flat on leave. Disabled for
 * coarse pointers (touch) and prefers-reduced-motion, where it renders as a
 * static wrapper.
 */
interface Tilt3DProps {
  children: React.ReactNode;
  /** Maximum rotation in degrees at the plane's edges. */
  maxTilt?: number;
  /** Scale applied while the pointer is over the plane. */
  hoverScale?: number;
  className?: string;
}

function motionAllowed() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

const Tilt3D = ({ children, maxTilt = 8, hoverScale = 1.02, className }: Tilt3DProps) => {
  const planeRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>();
  const [enabled, setEnabled] = useState(false);
  const [tilting, setTilting] = useState(false);

  useEffect(() => {
    setEnabled(motionAllowed());
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  const handleMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!enabled) return;
      const plane = planeRef.current;
      if (!plane) return;
      const { clientX, clientY } = event;
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      frameRef.current = requestAnimationFrame(() => {
        const rect = plane.getBoundingClientRect();
        const px = (clientX - rect.left) / rect.width - 0.5;
        const py = (clientY - rect.top) / rect.height - 0.5;
        plane.style.setProperty("--tilt-x", `${(-py * 2 * maxTilt).toFixed(2)}deg`);
        plane.style.setProperty("--tilt-y", `${(px * 2 * maxTilt).toFixed(2)}deg`);
        plane.style.setProperty("--tilt-scale", `${hoverScale}`);
      });
    },
    [enabled, maxTilt, hoverScale],
  );

  const handleLeave = useCallback(() => {
    if (!enabled) return;
    setTilting(false);
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    const plane = planeRef.current;
    if (!plane) return;
    plane.style.setProperty("--tilt-x", "0deg");
    plane.style.setProperty("--tilt-y", "0deg");
    plane.style.setProperty("--tilt-scale", "1");
  }, [enabled]);

  return (
    <div
      className={cn("scene-3d", className)}
      onPointerMove={handleMove}
      onPointerEnter={() => enabled && setTilting(true)}
      onPointerLeave={handleLeave}
    >
      <div ref={planeRef} className={cn("tilt-3d", tilting && "is-tilting")}>
        {children}
      </div>
    </div>
  );
};

export default Tilt3D;

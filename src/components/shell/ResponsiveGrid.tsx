import React from "react";
import { cn } from "@/lib/utils";

type ColCount = 1 | 2 | 3 | 4 | 5 | 6;
type GapStep = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8;

interface ResponsiveGridProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Column count per breakpoint. `base` applies from the smallest screen up;
   * `sm`/`md`/`lg`/`xl` layer on top. Defaults to a single column on mobile so
   * grids stack instead of squeezing — the breakpoint ladder lives here, not as
   * literals scattered across every view.
   */
  cols?: { base?: ColCount; sm?: ColCount; md?: ColCount; lg?: ColCount; xl?: ColCount };
  /** Tailwind gap step (matches the spacing scale). Defaults to 4. */
  gap?: GapStep;
  children: React.ReactNode;
}

// Literal class strings so Tailwind's content scanner keeps them.
const BASE: Record<ColCount, string> = {
  1: "grid-cols-1", 2: "grid-cols-2", 3: "grid-cols-3",
  4: "grid-cols-4", 5: "grid-cols-5", 6: "grid-cols-6",
};
const SM: Record<ColCount, string> = {
  1: "sm:grid-cols-1", 2: "sm:grid-cols-2", 3: "sm:grid-cols-3",
  4: "sm:grid-cols-4", 5: "sm:grid-cols-5", 6: "sm:grid-cols-6",
};
const MD: Record<ColCount, string> = {
  1: "md:grid-cols-1", 2: "md:grid-cols-2", 3: "md:grid-cols-3",
  4: "md:grid-cols-4", 5: "md:grid-cols-5", 6: "md:grid-cols-6",
};
const LG: Record<ColCount, string> = {
  1: "lg:grid-cols-1", 2: "lg:grid-cols-2", 3: "lg:grid-cols-3",
  4: "lg:grid-cols-4", 5: "lg:grid-cols-5", 6: "lg:grid-cols-6",
};
const XL: Record<ColCount, string> = {
  1: "xl:grid-cols-1", 2: "xl:grid-cols-2", 3: "xl:grid-cols-3",
  4: "xl:grid-cols-4", 5: "xl:grid-cols-5", 6: "xl:grid-cols-6",
};
const GAP: Record<GapStep, string> = {
  0: "gap-0", 1: "gap-1", 2: "gap-2", 3: "gap-3",
  4: "gap-4", 5: "gap-5", 6: "gap-6", 8: "gap-8",
};

/**
 * The owner of responsive grid layout. Instead of hand-writing
 * `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4` in every view (the
 * copy-pasted edit that PR #24 had to repeat across 12 files), declare the
 * column counts per breakpoint and let this component own the class ladder.
 */
const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  cols = {},
  gap = 4,
  className,
  children,
  ...rest
}) => {
  const { base = 1, sm, md, lg, xl } = cols;
  return (
    <div
      className={cn(
        "grid",
        BASE[base],
        sm && SM[sm],
        md && MD[md],
        lg && LG[lg],
        xl && XL[xl],
        GAP[gap],
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
};

export default ResponsiveGrid;

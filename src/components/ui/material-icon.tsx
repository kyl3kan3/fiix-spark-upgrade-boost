import React from "react";
import { cn } from "@/lib/utils";

interface MaterialIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Material Symbols name, e.g. "dashboard", "assignment_turned_in". */
  name: string;
  /** Render the filled variant (FILL=1). */
  filled?: boolean;
}

/**
 * Renders a Google Material Symbol — the icon system the Clean Tech bundle uses.
 * Matches the bundle's `<span class="material-symbols-outlined">name</span>` markup;
 * the font + base class are loaded globally via src/index.css.
 */
export function MaterialIcon({ name, filled, className, ...rest }: MaterialIconProps) {
  return (
    <span
      className={cn("material-symbols-outlined", className)}
      data-icon={name}
      data-weight={filled ? "fill" : undefined}
      aria-hidden
      {...rest}
    >
      {name}
    </span>
  );
}

export default MaterialIcon;

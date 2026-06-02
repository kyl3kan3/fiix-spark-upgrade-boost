import React from "react";
import { cn } from "@/lib/utils";

interface FilterBarProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

/**
 * Recommended width for a constrained control (Select/Button) inside a
 * FilterBar: full-width when the bar is stacked on mobile, fixed once it
 * becomes a row. Use on SelectTrigger etc. so the stack→row transition stays
 * owned here instead of being re-derived per filter view.
 */
export const FILTER_CONTROL_WIDTH = "w-full sm:w-[180px]";

/**
 * The owner of the filter-row layout: a column of controls on mobile that
 * becomes an aligned row at `sm`. Replaces the hand-written
 * `flex flex-col sm:flex-row sm:items-center gap-4` repeated across every
 * filter/toolbar (TeamFilters, WorkOrderFilters, LocationFilters, …). Put a
 * `flex-1` search field first and constrained controls (FILTER_CONTROL_WIDTH)
 * after.
 */
const FilterBar: React.FC<FilterBarProps> = ({ className, children, ...rest }) => (
  <div
    className={cn("flex flex-col sm:flex-row sm:items-center gap-4", className)}
    {...rest}
  >
    {children}
  </div>
);

export default FilterBar;

import React from "react";
import { Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

interface BrandMarkProps {
  /** "onInk" for the dark nav rail, "onSurface" for light page chrome. */
  tone?: "onInk" | "onSurface";
  /** Second line under the wordmark. */
  tagline?: string;
  className?: string;
}

/**
 * The MaintenEase lockup: a signal-yellow tag with the wordmark beside it.
 * The single place the brand is drawn, so the rail, the mobile drawer and
 * the marketing header cannot drift apart.
 */
const BrandMark: React.FC<BrandMarkProps> = ({ tone = "onSurface", tagline, className }) => (
  <span className={cn("inline-flex items-center gap-2.5", className)}>
    <span
      aria-hidden
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-highlight text-highlight-foreground"
    >
      <Wrench className="h-[18px] w-[18px]" strokeWidth={2.25} />
    </span>
    <span className="flex min-w-0 flex-col leading-none">
      <span
        className={cn(
          "font-display text-xl font-bold leading-none",
          tone === "onInk" ? "text-white" : "text-foreground",
        )}
      >
        MaintenEase
      </span>
      {tagline && (
        <span
          className={cn(
            "mt-1 text-xs font-medium leading-none",
            tone === "onInk" ? "text-sidebar-foreground/70" : "text-muted-foreground",
          )}
        >
          {tagline}
        </span>
      )}
    </span>
  </span>
);

export default BrandMark;

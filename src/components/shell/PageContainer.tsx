import React from "react";
import { cn } from "@/lib/utils";

interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** Extra classes for the wrapper, e.g. `space-y-6`. */
  className?: string;
}

/**
 * The single content wrapper for every page body. Owns horizontal padding,
 * vertical padding, max-width and centering so pages don't each reinvent
 * their own (and so two of them no longer ship with zero horizontal padding).
 * Keep this in sync with PageHeader's inner wrapper.
 */
export const PAGE_MAX_WIDTH = "max-w-[1400px]";

const PageContainer: React.FC<PageContainerProps> = ({ children, className, ...rest }) => (
  <div
    className={cn("mx-auto w-full page-enter", PAGE_MAX_WIDTH, "px-4 md:px-6 lg:px-8 py-6", className)}
    {...rest}
  >
    {children}
  </div>
);

export default PageContainer;

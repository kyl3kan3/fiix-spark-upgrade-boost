import React from "react";
import { useLocation } from "react-router-dom";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { classifySeoPath } from "@/lib/seoRouting";

/**
 * Indexable marketing pages SSR with a plain light shell (no next-themes inline script).
 * App routes keep ThemeProvider for dark mode.
 */
export function MarketingLightShell({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  if (classifySeoPath(pathname) === "indexable") {
    return <div className="light">{children}</div>;
  }
  return <ThemeProvider>{children}</ThemeProvider>;
}